import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
import { useToast } from "@/hooks/use-toast";
import NewIncomeForm from "@/components/forms/new-income-form";
import NewExpenseForm from "@/components/forms/new-expense-form";
import { formatDate } from "@/lib/utils/date-utils";
import { formatCurrency } from "@/lib/utils/format-currency";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Income, Expense } from "@shared/schema";

const IncomeExpense = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("income");
  const [isNewIncomeDialogOpen, setIsNewIncomeDialogOpen] = useState(false);
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: incomes, isLoading: isLoadingIncomes } = useQuery<Income[]>({
    queryKey: ['/api/incomes'],
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  // Filter and sort incomes
  const filteredIncomes = incomes 
    ? incomes
        .filter(income => 
          categoryFilter === "all" || income.category === categoryFilter
        )
        .filter(income => 
          income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (income.reference && income.reference.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Filter and sort expenses
  const filteredExpenses = expenses 
    ? expenses
        .filter(expense => 
          categoryFilter === "all" || expense.category === categoryFilter
        )
        .filter(expense => 
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.reference && expense.reference.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Paginate
  const paginatedIncomes = filteredIncomes
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginatedExpenses = filteredExpenses
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalIncomePages = Math.ceil(filteredIncomes.length / itemsPerPage);
  const totalExpensePages = Math.ceil(filteredExpenses.length / itemsPerPage);

  // Prepare chart data
  const prepareChartData = () => {
    if (!incomes || !expenses) return [];

    // Group by month
    const monthlyData = new Map();
    
    // Process incomes
    incomes.forEach(income => {
      const date = new Date(income.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { month: monthYear, income: 0, expense: 0 });
      }
      
      monthlyData.get(monthYear).income += income.amount;
    });
    
    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, { month: monthYear, income: 0, expense: 0 });
      }
      
      monthlyData.get(monthYear).expense += expense.amount;
    });
    
    // Convert to array and sort by date
    return Array.from(monthlyData.values())
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      })
      .slice(-6); // Last 6 months
  };

  const chartData = prepareChartData();

  if (isLoadingIncomes || isLoadingExpenses) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white shadow rounded-lg p-4 h-20"></div>
        <div className="bg-white shadow rounded-lg p-4 h-80"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg">Gelir ve Gider Yönetimi</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isNewIncomeDialogOpen} onOpenChange={setIsNewIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-success hover:bg-success/90">
                  <i className="fas fa-plus mr-2"></i>
                  Gelir Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Yeni Gelir Kaydı</DialogTitle>
                </DialogHeader>
                <NewIncomeForm onSuccess={() => {
                  setIsNewIncomeDialogOpen(false);
                  toast({
                    title: "Başarılı",
                    description: "Gelir kaydı başarıyla oluşturuldu.",
                  });
                }} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-danger hover:bg-danger/90">
                  <i className="fas fa-plus mr-2"></i>
                  Gider Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Kaydı</DialogTitle>
                </DialogHeader>
                <NewExpenseForm onSuccess={() => {
                  setIsNewExpenseDialogOpen(false);
                  toast({
                    title: "Başarılı",
                    description: "Gider kaydı başarıyla oluşturuldu.",
                  });
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Gelir/Gider Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`₺${value}`, ""]}
                  labelFormatter={(label) => `Ay: ${label}`}
                />
                <Legend />
                <Bar dataKey="income" name="Gelir" fill="#107C10" />
                <Bar dataKey="expense" name="Gider" fill="#D13438" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="income">Gelirler</TabsTrigger>
              <TabsTrigger value="expense">Giderler</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <Input
                placeholder={activeTab === "income" ? "Gelir ara..." : "Gider ara..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex items-center gap-2 ml-auto">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kategori Filtresi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {activeTab === "income" 
                      ? INCOME_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))
                      : EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}>
                  <i className="fas fa-sync-alt mr-2"></i>
                  Sıfırla
                </Button>
              </div>
            </div>
            
            <TabsContent value="income">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referans</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-center">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIncomes.length > 0 ? (
                      paginatedIncomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.reference || "-"}</TableCell>
                          <TableCell>{formatDate(income.date)}</TableCell>
                          <TableCell>{income.description}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs rounded">
                              {income.category}
                            </span>
                          </TableCell>
                          <TableCell>{income.paymentMethod}</TableCell>
                          <TableCell className="text-right text-success font-medium">
                            {formatCurrency(income.amount, income.currency)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button variant="ghost" size="icon">
                                <i className="fas fa-edit text-primary"></i>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <i className="fas fa-trash-alt text-danger"></i>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Gelir kaydı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalIncomePages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalIncomePages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalIncomePages))}
                          className={currentPage === totalIncomePages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="expense">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referans</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-center">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExpenses.length > 0 ? (
                      paginatedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.reference || "-"}</TableCell>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-danger bg-opacity-10 text-danger text-xs rounded">
                              {expense.category}
                            </span>
                          </TableCell>
                          <TableCell>{expense.paymentMethod}</TableCell>
                          <TableCell className="text-right text-danger font-medium">
                            {formatCurrency(expense.amount, expense.currency)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button variant="ghost" size="icon">
                                <i className="fas fa-edit text-primary"></i>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <i className="fas fa-trash-alt text-danger"></i>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Gider kaydı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalExpensePages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalExpensePages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalExpensePages))}
                          className={currentPage === totalExpensePages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default IncomeExpense;
