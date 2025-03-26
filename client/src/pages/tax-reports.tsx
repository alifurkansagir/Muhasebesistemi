import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
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
import { CHART_PERIODS, TAX_TYPES } from "@/lib/constants";
import type { Invoice, Tax } from "@shared/schema";

const TaxReports = () => {
  const [period, setPeriod] = useState("6months");
  const [taxType, setTaxType] = useState("all");
  
  const { startDate, endDate } = getDateRangeForPeriod(period);
  
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });
  
  const { data: taxes, isLoading: isLoadingTaxes } = useQuery<Tax[]>({
    queryKey: ['/api/taxes'],
  });
  
  const isLoading = isLoadingInvoices || isLoadingTaxes;
  const error = null; // Handle potential errors
  
  // Calculate total tax amounts
  const calculateTaxTotals = () => {
    if (!invoices) return { total: 0, income: 0, expense: 0 };
    
    // Filter invoices by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
    
    const incomeTax = filteredInvoices
      .filter(invoice => invoice.type === 'income')
      .reduce((sum, invoice) => sum + (invoice.taxAmount || 0), 0);
    
    const expenseTax = filteredInvoices
      .filter(invoice => invoice.type === 'expense')
      .reduce((sum, invoice) => sum + (invoice.taxAmount || 0), 0);
    
    return {
      total: incomeTax - expenseTax,
      income: incomeTax,
      expense: expenseTax
    };
  };
  
  // Prepare monthly tax data
  const prepareMonthlyTaxData = () => {
    if (!invoices) return [];
    
    // Group by month
    const monthlyData = new Map();
    
    // Filter invoices by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
    
    // Process invoices
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthYear = `${date.toLocaleString('tr-TR', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { 
          name: monthYear, 
          incomeTax: 0, 
          expenseTax: 0, 
          netTax: 0 
        });
      }
      
      if (invoice.type === 'income') {
        monthlyData.get(monthYear).incomeTax += (invoice.taxAmount || 0);
      } else {
        monthlyData.get(monthYear).expenseTax += (invoice.taxAmount || 0);
      }
    });
    
    // Calculate net tax and convert to array
    const monthlyTaxData = Array.from(monthlyData.values()).map(item => ({
      ...item,
      netTax: item.incomeTax - item.expenseTax
    }));
    
    // Sort by date
    return monthlyTaxData.sort((a, b) => {
      const [aMonth, aYear] = a.name.split(' ');
      const [bMonth, bYear] = b.name.split(' ');
      
      if (aYear !== bYear) return Number(aYear) - Number(bYear);
      
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
  };
  
  const taxTotals = calculateTaxTotals();
  const monthlyTaxData = prepareMonthlyTaxData();
  
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
        <h3 className="text-lg font-medium mb-2">Vergi raporu verileri yüklenirken bir hata oluştu</h3>
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
          <div>
            <CardTitle className="text-lg">Vergi Raporları</CardTitle>
            <CardDescription>
              {formatDate(startDate)} - {formatDate(endDate)} dönemi vergi özeti
            </CardDescription>
          </div>
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
            <Button variant="outline">
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
                <i className="fas fa-file-invoice-dollar text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Tahsil Edilen Vergi</h3>
              <p className="text-xl font-bold text-success">{formatCurrency(taxTotals.income)}</p>
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
                <i className="fas fa-file-invoice-dollar text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Ödenen Vergi</h3>
              <p className="text-xl font-bold text-danger">{formatCurrency(taxTotals.expense)}</p>
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
                <i className="fas fa-balance-scale text-2xl"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-400">Net Vergi</h3>
              <p className={`text-xl font-bold ${taxTotals.total >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(taxTotals.total)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg">Aylık Vergi Grafiği</CardTitle>
          <Select defaultValue={taxType} onValueChange={setTaxType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Vergi Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Vergiler</SelectItem>
              {TAX_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTaxData}
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
                <Bar dataKey="incomeTax" name="Tahsil Edilen Vergi" fill="#107C10" />
                <Bar dataKey="expenseTax" name="Ödenen Vergi" fill="#D13438" />
                <Bar dataKey="netTax" name="Net Vergi" fill="#0078D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Vergi Oranları</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vergi Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Oran (%)</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes && taxes.length > 0 ? (
                taxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>{tax.description || "-"}</TableCell>
                    <TableCell>{tax.type}</TableCell>
                    <TableCell>%{tax.rate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 ${tax.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-neutral-300 text-neutral-600'} text-xs rounded`}>
                        {tax.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Vergi kaydı bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Vergi Takvimi</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vergi</TableHead>
                <TableHead>Son Ödeme Tarihi</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">KDV Beyannamesi</TableCell>
                <TableCell>26 Mayıs 2023</TableCell>
                <TableCell>Nisan ayı KDV beyannamesi</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs rounded">
                    16 gün kaldı
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Muhtasar Beyanname</TableCell>
                <TableCell>30 Mayıs 2023</TableCell>
                <TableCell>Nisan ayı Muhtasar beyannamesi</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs rounded">
                    20 gün kaldı
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gelir Vergisi</TableCell>
                <TableCell>15 Haziran 2023</TableCell>
                <TableCell>2023 1. dönem geçici vergi beyannamesi</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs rounded">
                    36 gün kaldı
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default TaxReports;
