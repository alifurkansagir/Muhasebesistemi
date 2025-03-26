import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils/date-utils";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getDateRangeForPeriod } from "@/lib/utils/date-utils";
import { CHART_PERIODS } from "@/lib/constants";
import type { Income, Expense } from "@shared/schema";

const COLORS = ["#0078D4", "#107C10", "#D13438", "#FFB900", "#8764B8"];

const Reports = () => {
  const [period, setPeriod] = useState("6months");
  const [activeTab, setActiveTab] = useState("income-expense");
  
  const { startDate, endDate } = getDateRangeForPeriod(period);
  
  // Yeni finansal rapor API'sini kullanalım
  const financialReportQuery = useQuery({
    queryKey: ['/api/reports/financial', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
  });
  
  // Eski endpointleri de koruyalım
  const incomeQuery = useQuery<Income[]>({
    queryKey: ['/api/incomes', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
    enabled: !financialReportQuery.data, // Rapor verileri varsa eski sorguları çalıştırmayalım
  });
  
  const expenseQuery = useQuery<Expense[]>({
    queryKey: ['/api/expenses', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
    enabled: !financialReportQuery.data, // Rapor verileri varsa eski sorguları çalıştırmayalım
  });
  
  const isLoading = financialReportQuery.isLoading || incomeQuery.isLoading || expenseQuery.isLoading;
  const error = financialReportQuery.error || incomeQuery.error || expenseQuery.error;
  
  // Güncel API verilerini kullan veya eski verilere geri dön
  const useFinancialReportData = !!financialReportQuery.data;
  
  // Prepare time series data
  const prepareTimeSeriesData = () => {
    // Yeni API verilerini kullan
    if (useFinancialReportData && financialReportQuery.data?.monthlyData) {
      return financialReportQuery.data.monthlyData.map(item => ({
        name: new Date(item.date + '-01').toLocaleString('tr-TR', { month: 'short' }) + ' ' + 
              item.date.split('-')[0], // 'YYYY-MM' formatı -> 'Oca YYYY' gibi
        income: item.income,
        expense: item.expense,
        profit: item.netIncome
      }));
    }
    
    // Eski API verilerine geri dön
    if (!incomeQuery.data || !expenseQuery.data) return [];
    
    // Group by month
    const monthlyData = new Map();
    
    // Process incomes
    incomeQuery.data.forEach(income => {
      const date = new Date(income.date);
      const monthYear = `${date.toLocaleString('tr-TR', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { name: monthYear, income: 0, expense: 0, profit: 0 });
      }
      
      monthlyData.get(monthYear).income += income.amount;
    });
    
    // Process expenses
    expenseQuery.data.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.toLocaleString('tr-TR', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { name: monthYear, income: 0, expense: 0, profit: 0 });
      }
      
      monthlyData.get(monthYear).expense += expense.amount;
    });
    
    // Calculate profit and convert to array
    const timeSeriesData = Array.from(monthlyData.values()).map(item => ({
      ...item,
      profit: item.income - item.expense
    }));
    
    // Sort by date
    return timeSeriesData.sort((a, b) => {
      const [aMonth, aYear] = a.name.split(' ');
      const [bMonth, bYear] = b.name.split(' ');
      
      if (aYear !== bYear) return Number(aYear) - Number(bYear);
      
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
  };
  
  // Prepare category data for incomes
  const prepareIncomeCategoryData = () => {
    // Yeni API verilerini kullan
    if (useFinancialReportData && financialReportQuery.data?.incomeByCategory) {
      return financialReportQuery.data.incomeByCategory.map(item => ({
        name: item.category,
        value: item.amount
      }));
    }
    
    // Eski API verilerine geri dön
    if (!incomeQuery.data) return [];
    
    const categories = new Map();
    
    incomeQuery.data.forEach(income => {
      const category = income.category || "Diğer";
      
      if (!categories.has(category)) {
        categories.set(category, { name: category, value: 0 });
      }
      
      categories.get(category).value += income.amount;
    });
    
    return Array.from(categories.values());
  };
  
  // Prepare category data for expenses
  const prepareExpenseCategoryData = () => {
    // Yeni API verilerini kullan
    if (useFinancialReportData && financialReportQuery.data?.expenseByCategory) {
      return financialReportQuery.data.expenseByCategory.map(item => ({
        name: item.category,
        value: item.amount
      }));
    }
    
    // Eski API verilerine geri dön
    if (!expenseQuery.data) return [];
    
    const categories = new Map();
    
    expenseQuery.data.forEach(expense => {
      const category = expense.category || "Diğer";
      
      if (!categories.has(category)) {
        categories.set(category, { name: category, value: 0 });
      }
      
      categories.get(category).value += expense.amount;
    });
    
    return Array.from(categories.values());
  };
  
  const timeSeriesData = prepareTimeSeriesData();
  const incomeCategoryData = prepareIncomeCategoryData();
  const expenseCategoryData = prepareExpenseCategoryData();
  
  // Calculate totals - prefer new API data
  const totalIncome = useFinancialReportData 
    ? financialReportQuery.data?.summary.totalIncome || 0
    : incomeQuery.data ? incomeQuery.data.reduce((sum, income) => sum + income.amount, 0) : 0;
    
  const totalExpense = useFinancialReportData
    ? financialReportQuery.data?.summary.totalExpense || 0
    : expenseQuery.data ? expenseQuery.data.reduce((sum, expense) => sum + expense.amount, 0) : 0;
    
  const totalProfit = useFinancialReportData
    ? financialReportQuery.data?.summary.netIncome || 0
    : totalIncome - totalExpense;
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white shadow rounded-lg p-4 h-20"></div>
        <div className="bg-white shadow rounded-lg p-4 h-80"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="text-danger mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium mb-2">Rapor verileri yüklenirken bir hata oluştu</h3>
        <p className="text-neutral-500">{(error as Error).message}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          onClick={() => window.location.reload()}
        >
          Yeniden Dene
        </button>
      </div>
    );
  }
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg">Finansal Raporlar</CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dönem Seçin" />
              </SelectTrigger>
              <SelectContent>
                {CHART_PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                if (financialReportQuery.data) {
                  import('@/lib/utils/pdf-export').then(({ generateFinancialReportPdf, downloadPdf }) => {
                    const pdf = generateFinancialReportPdf(
                      financialReportQuery.data, 
                      CHART_PERIODS.find(p => p.value === period)?.label || period,
                      { companyName: 'Şirketinizin Adı', taxId: '1234567890' }
                    );
                    downloadPdf(pdf, `finansal-rapor-${period}.pdf`);
                  });
                }
              }}
            >
              <i className="fas fa-download mr-2"></i>
              PDF İndir
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="text-success mb-2">
                <i className="fas fa-arrow-up text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Toplam Gelir</h3>
              <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="text-danger mb-2">
                <i className="fas fa-arrow-down text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Toplam Gider</h3>
              <p className="text-xl font-bold text-danger">{formatCurrency(totalExpense)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="text-primary mb-2">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Net Kâr/Zarar</h3>
              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(totalProfit)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="income-expense">Gelir-Gider Grafiği</TabsTrigger>
              <TabsTrigger value="income-categories">Gelir Kategorileri</TabsTrigger>
              <TabsTrigger value="expense-categories">Gider Kategorileri</TabsTrigger>
            </TabsList>
            
            <TabsContent value="income-expense">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), ""]}
                      labelFormatter={(label) => `Tarih: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name="Gelir" 
                      stroke="#107C10" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name="Gider" 
                      stroke="#D13438" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Kar/Zarar" 
                      stroke="#0078D4" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="income-categories">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 h-80">
                      <PieChart width={400} height={300}>
                        <Pie
                          data={incomeCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {incomeCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), ""]}
                        />
                        <Legend />
                      </PieChart>
                    </div>
                    <div className="w-full md:w-1/2 h-80">
                      <BarChart
                        width={500}
                        height={300}
                        data={incomeCategoryData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), ""]} 
                        />
                        <Legend />
                        <Bar dataKey="value" name="Tutar" fill="#107C10" />
                      </BarChart>
                    </div>
                  </div>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="expense-categories">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 h-80">
                      <PieChart width={400} height={300}>
                        <Pie
                          data={expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), ""]}
                        />
                        <Legend />
                      </PieChart>
                    </div>
                    <div className="w-full md:w-1/2 h-80">
                      <BarChart
                        width={500}
                        height={300}
                        data={expenseCategoryData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), ""]} 
                        />
                        <Legend />
                        <Bar dataKey="value" name="Tutar" fill="#D13438" />
                      </BarChart>
                    </div>
                  </div>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default Reports;
