import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  FileDown, 
  TrendingUp, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import CurrencyFormatter from "@/components/ui/currency-formatter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBudgetSchema } from "@shared/schema";

// Mock budget data
const mockBudgets = [
  {
    id: 1,
    name: "2023 Genel Bütçe",
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 11, 31),
    totalIncome: 550000,
    totalExpense: 410000,
    details: {
      income: [
        { categoryId: 1, name: "Satış", budget: 400000 },
        { categoryId: 2, name: "Hizmet Geliri", budget: 120000 },
        { categoryId: 3, name: "Faiz Geliri", budget: 15000 },
        { categoryId: 4, name: "Kira Geliri", budget: 15000 }
      ],
      expense: [
        { categoryId: 6, name: "Kira", budget: 60000 },
        { categoryId: 7, name: "Maaşlar", budget: 240000 },
        { categoryId: 8, name: "Elektrik", budget: 18000 },
        { categoryId: 9, name: "Su", budget: 6000 },
        { categoryId: 10, name: "İnternet", budget: 7200 },
        { categoryId: 11, name: "Telefon", budget: 4800 },
        { categoryId: 12, name: "Ofis Malzemeleri", budget: 12000 },
        { categoryId: 13, name: "Ulaşım", budget: 18000 },
        { categoryId: 14, name: "Yemek", budget: 24000 },
        { categoryId: 15, name: "Vergiler", budget: 20000 }
      ]
    },
    currencyId: 1
  },
  {
    id: 2,
    name: "2023 2. Çeyrek",
    startDate: new Date(2023, 3, 1),
    endDate: new Date(2023, 5, 30),
    totalIncome: 150000,
    totalExpense: 110000,
    details: {
      income: [
        { categoryId: 1, name: "Satış", budget: 110000 },
        { categoryId: 2, name: "Hizmet Geliri", budget: 30000 },
        { categoryId: 3, name: "Faiz Geliri", budget: 5000 },
        { categoryId: 4, name: "Kira Geliri", budget: 5000 }
      ],
      expense: [
        { categoryId: 6, name: "Kira", budget: 15000 },
        { categoryId: 7, name: "Maaşlar", budget: 60000 },
        { categoryId: 8, name: "Elektrik", budget: 4500 },
        { categoryId: 9, name: "Su", budget: 1500 },
        { categoryId: 10, name: "İnternet", budget: 1800 },
        { categoryId: 11, name: "Telefon", budget: 1200 },
        { categoryId: 12, name: "Ofis Malzemeleri", budget: 3000 },
        { categoryId: 13, name: "Ulaşım", budget: 4500 },
        { categoryId: 14, name: "Yemek", budget: 6000 },
        { categoryId: 15, name: "Vergiler", budget: 12500 }
      ]
    },
    currencyId: 1
  }
];

// Mock actual data for comparison
const actualData = {
  income: {
    "Satış": 415000,
    "Hizmet Geliri": 115000,
    "Faiz Geliri": 14000,
    "Kira Geliri": 15000
  },
  expense: {
    "Kira": 60000,
    "Maaşlar": 250000,
    "Elektrik": 19500,
    "Su": 5800,
    "İnternet": 7200,
    "Telefon": 4500,
    "Ofis Malzemeleri": 10500,
    "Ulaşım": 16800,
    "Yemek": 22000,
    "Vergiler": 21000
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value);
};

// Calculate percentage of actual vs budget
const getPercentage = (actual: number, budget: number) => {
  return (actual / budget) * 100;
};

// Convert budget details to chart data
const getBudgetChartData = (budget: any) => {
  const incomeData = budget.details.income.map((item: any) => ({
    name: item.name,
    budget: item.budget,
    actual: actualData.income[item.name as keyof typeof actualData.income] || 0
  }));
  
  const expenseData = budget.details.expense.map((item: any) => ({
    name: item.name,
    budget: item.budget,
    actual: actualData.expense[item.name as keyof typeof actualData.expense] || 0
  }));
  
  const incomePieData = budget.details.income.map((item: any) => ({
    name: item.name,
    value: item.budget
  }));
  
  const expensePieData = budget.details.expense.map((item: any) => ({
    name: item.name,
    value: item.budget
  }));
  
  return { incomeData, expenseData, incomePieData, expensePieData };
};

const BudgetForm = ({ onSuccess, defaultValues, budgetId }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!budgetId;

  const formSchema = insertBudgetSchema.extend({
    name: z.string().min(2, { message: "Bütçe adı en az 2 karakter olmalıdır" }),
    startDate: z.union([z.date(), z.string()]).transform((val) => {
      if (typeof val === "string") return new Date(val);
      return val;
    }),
    endDate: z.union([z.date(), z.string()]).transform((val) => {
      if (typeof val === "string") return new Date(val);
      return val;
    }),
    totalIncome: z.coerce.number().min(0, { message: "Toplam gelir 0 veya daha büyük olmalıdır" }),
    totalExpense: z.coerce.number().min(0, { message: "Toplam gider 0 veya daha büyük olmalıdır" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().getFullYear(), 11, 31),
      totalIncome: 0,
      totalExpense: 0,
      details: "{}",
      currencyId: 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await apiRequest('PATCH', `/api/budgets/${budgetId}`, values);
        toast({
          title: "Bütçe güncellendi",
          description: "Bütçe bilgileri başarıyla güncellendi",
        });
      } else {
        await apiRequest('POST', "/api/budgets", values);
        toast({
          title: "Bütçe oluşturuldu",
          description: "Yeni bütçe başarıyla oluşturuldu",
        });
        form.reset();
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting budget:", error);
      toast({
        title: "Hata",
        description: "Bütçe kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bütçe Adı</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlangıç Tarihi</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bitiş Tarihi</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toplam Gelir Hedefi</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalExpense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toplam Gider Hedefi</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <p className="text-sm text-neutral-500 mt-2">
          Not: Detaylı kategori bazlı bütçeleme için lütfen bütçeyi oluşturduktan sonra düzenleme ekranını kullanın.
        </p>
        
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const Budget = () => {
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(1); // Default to first budget
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { toast } = useToast();
  
  // In a real implementation, this would fetch from the API
  const budgets = mockBudgets;
  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
  
  const handleNewBudget = () => {
    setIsNewDialogOpen(true);
  };
  
  const handleEditBudget = (id: number) => {
    setSelectedBudgetId(id);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteBudget = () => {
    toast({
      title: "Bütçe silindi",
      description: "Bütçe başarıyla silindi",
    });
    setIsDeleteDialogOpen(false);
  };
  
  const handleConfirmDelete = (id: number) => {
    setSelectedBudgetId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Get chart data for the selected budget
  const chartData = selectedBudget ? getBudgetChartData(selectedBudget) : { incomeData: [], expenseData: [], incomePieData: [], expensePieData: [] };
  
  // Calculate total actual amounts
  const calculateActualTotal = (type: 'income' | 'expense') => {
    if (!selectedBudget) return 0;
    
    return selectedBudget.details[type].reduce((sum, item) => {
      const actual = type === 'income' 
        ? actualData.income[item.name as keyof typeof actualData.income] || 0
        : actualData.expense[item.name as keyof typeof actualData.expense] || 0;
      return sum + actual;
    }, 0);
  };
  
  const actualIncome = calculateActualTotal('income');
  const actualExpense = calculateActualTotal('expense');
  const actualProfit = actualIncome - actualExpense;
  const budgetProfit = selectedBudget ? selectedBudget.totalIncome - selectedBudget.totalExpense : 0;

  return (
    <>
      <Header 
        title="Bütçe Planlaması" 
        subtitle="Finansal hedeflerinizi planlayın ve takip edin" 
        onClickNew={handleNewBudget}
        newButtonText="Yeni Bütçe"
      />
      
      <main className="flex-1 overflow-y-auto bg-[#FAF9F8] pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          {/* Budget Selector */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex-1 max-w-sm">
              <label className="block text-sm font-medium mb-1">Aktif Bütçe</label>
              <select 
                className="w-full border border-neutral-300 rounded-md px-3 py-2"
                value={selectedBudgetId || ''}
                onChange={e => setSelectedBudgetId(Number(e.target.value))}
              >
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} ({format(budget.startDate, "dd.MM.yyyy")} - {format(budget.endDate, "dd.MM.yyyy")})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => selectedBudgetId && handleEditBudget(selectedBudgetId)}
              >
                <Edit className="h-4 w-4" />
                Düzenle
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => selectedBudgetId && handleConfirmDelete(selectedBudgetId)}
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileDown className="h-4 w-4" />
                Dışa Aktar
              </Button>
            </div>
          </div>
          
          {selectedBudget ? (
            <>
              {/* Budget Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Gelir Hedefi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#0078D4]">
                      <CurrencyFormatter amount={selectedBudget.totalIncome} />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          <CurrencyFormatter amount={actualIncome} />
                        </span>
                        <span className={actualIncome >= selectedBudget.totalIncome ? "text-[#107C10]" : "text-neutral-500"}>
                          {Math.round(getPercentage(actualIncome, selectedBudget.totalIncome))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, getPercentage(actualIncome, selectedBudget.totalIncome))} 
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs flex items-center mt-2">
                      {actualIncome >= selectedBudget.totalIncome ? (
                        <>
                          <ArrowUpRight className="text-[#107C10] h-3 w-3 mr-1" />
                          <span className="text-[#107C10]">Hedefe ulaşıldı</span>
                        </>
                      ) : (
                        <>
                          <span className="text-neutral-500">
                            <CurrencyFormatter amount={selectedBudget.totalIncome - actualIncome} /> kaldı
                          </span>
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Gider Hedefi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#D13438]">
                      <CurrencyFormatter amount={selectedBudget.totalExpense} />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          <CurrencyFormatter amount={actualExpense} />
                        </span>
                        <span className={actualExpense <= selectedBudget.totalExpense ? "text-[#107C10]" : "text-[#D13438]"}>
                          {Math.round(getPercentage(actualExpense, selectedBudget.totalExpense))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, getPercentage(actualExpense, selectedBudget.totalExpense))} 
                        className="h-2"
                        indicatorClassName={actualExpense > selectedBudget.totalExpense ? "bg-[#D13438]" : undefined}
                      />
                    </div>
                    <p className="text-xs flex items-center mt-2">
                      {actualExpense > selectedBudget.totalExpense ? (
                        <>
                          <ArrowUpRight className="text-[#D13438] h-3 w-3 mr-1" />
                          <span className="text-[#D13438]">
                            <CurrencyFormatter amount={actualExpense - selectedBudget.totalExpense} /> hedefi aştı
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-neutral-500">
                            <CurrencyFormatter amount={selectedBudget.totalExpense - actualExpense} /> kaldı
                          </span>
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Net Kâr Hedefi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#107C10]">
                      <CurrencyFormatter amount={budgetProfit} />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          <CurrencyFormatter amount={actualProfit} />
                        </span>
                        <span className={actualProfit >= budgetProfit ? "text-[#107C10]" : "text-[#D13438]"}>
                          {budgetProfit > 0 
                            ? Math.round(getPercentage(actualProfit, budgetProfit)) 
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={budgetProfit > 0 ? Math.min(100, getPercentage(actualProfit, budgetProfit)) : 0} 
                        className="h-2"
                        indicatorClassName={actualProfit < budgetProfit ? "bg-[#FFB900]" : undefined}
                      />
                    </div>
                    <p className="text-xs flex items-center mt-2">
                      {actualProfit >= budgetProfit ? (
                        <>
                          <ArrowUpRight className="text-[#107C10] h-3 w-3 mr-1" />
                          <span className="text-[#107C10]">Hedefe ulaşıldı</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="text-[#D13438] h-3 w-3 mr-1" />
                          <span className="text-[#D13438]">
                            <CurrencyFormatter amount={budgetProfit - actualProfit} /> altında
                          </span>
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Bütçe Dönemi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-base font-medium">
                      {format(selectedBudget.startDate, "dd.MM.yyyy")} - {format(selectedBudget.endDate, "dd.MM.yyyy")}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>İlerleme</span>
                        <span>
                          {Math.min(100, Math.round(
                            ((new Date().getTime() - selectedBudget.startDate.getTime()) / 
                             (selectedBudget.endDate.getTime() - selectedBudget.startDate.getTime())) * 100
                          ))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, ((new Date().getTime() - selectedBudget.startDate.getTime()) / 
                                            (selectedBudget.endDate.getTime() - selectedBudget.startDate.getTime())) * 100)} 
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date() > selectedBudget.endDate 
                        ? "Bütçe dönemi tamamlandı" 
                        : `${Math.ceil((selectedBudget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı`}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedBudget.name}</CardTitle>
                      <TabsList>
                        <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                        <TabsTrigger value="income">Gelir Detayları</TabsTrigger>
                        <TabsTrigger value="expense">Gider Detayları</TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-base font-medium mb-4">Gelir Dağılımı</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={chartData.incomePieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {chartData.incomePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number) => [formatCurrency(value), '']}
                                  contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.375rem'
                                  }}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-base font-medium mb-4">Gider Dağılımı</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={chartData.expensePieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {chartData.expensePieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number) => [formatCurrency(value), '']}
                                  contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.375rem'
                                  }}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="income">
                      <h3 className="text-base font-medium mb-4">Gelir Kategorileri Detayı</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.incomeData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), '']}
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="budget" name="Bütçelenen" fill="#0078D4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" name="Gerçekleşen" fill="#107C10" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-6">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Bütçelenen</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Gerçekleşen</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Fark</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">İlerleme</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {selectedBudget.details.income.map((item: any) => {
                              const actual = actualData.income[item.name as keyof typeof actualData.income] || 0;
                              const diff = actual - item.budget;
                              const percentage = getPercentage(actual, item.budget);
                              
                              return (
                                <tr key={item.categoryId}>
                                  <td className="px-4 py-3 text-sm text-neutral-700">{item.name}</td>
                                  <td className="px-4 py-3 text-sm text-right text-neutral-700"><CurrencyFormatter amount={item.budget} /></td>
                                  <td className="px-4 py-3 text-sm text-right text-neutral-700"><CurrencyFormatter amount={actual} /></td>
                                  <td className={`px-4 py-3 text-sm text-right ${diff >= 0 ? 'text-[#107C10]' : 'text-[#D13438]'}`}>
                                    {diff >= 0 ? '+' : ''}<CurrencyFormatter amount={diff} />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end">
                                      <span className={`mr-2 ${percentage >= 100 ? 'text-[#107C10]' : 'text-neutral-500'}`}>
                                        {Math.round(percentage)}%
                                      </span>
                                      <div className="w-16 bg-neutral-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className={`h-full ${percentage >= 100 ? 'bg-[#107C10]' : 'bg-[#0078D4]'}`}
                                          style={{ width: `${Math.min(100, percentage)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-neutral-50">
                              <td className="px-4 py-3 text-sm font-medium">Toplam</td>
                              <td className="px-4 py-3 text-sm font-medium text-right"><CurrencyFormatter amount={selectedBudget.totalIncome} /></td>
                              <td className="px-4 py-3 text-sm font-medium text-right"><CurrencyFormatter amount={actualIncome} /></td>
                              <td className={`px-4 py-3 text-sm font-medium text-right ${actualIncome - selectedBudget.totalIncome >= 0 ? 'text-[#107C10]' : 'text-[#D13438]'}`}>
                                {actualIncome - selectedBudget.totalIncome >= 0 ? '+' : ''}
                                <CurrencyFormatter amount={actualIncome - selectedBudget.totalIncome} />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-right">
                                <span className={actualIncome >= selectedBudget.totalIncome ? 'text-[#107C10]' : 'text-neutral-500'}>
                                  {Math.round(getPercentage(actualIncome, selectedBudget.totalIncome))}%
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="expense">
                      <h3 className="text-base font-medium mb-4">Gider Kategorileri Detayı</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.expenseData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), '']}
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="budget" name="Bütçelenen" fill="#D13438" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" name="Gerçekleşen" fill="#FFB900" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-6">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Bütçelenen</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Gerçekleşen</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Fark</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">İlerleme</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {selectedBudget.details.expense.map((item: any) => {
                              const actual = actualData.expense[item.name as keyof typeof actualData.expense] || 0;
                              const diff = item.budget - actual;
                              const percentage = getPercentage(actual, item.budget);
                              
                              return (
                                <tr key={item.categoryId}>
                                  <td className="px-4 py-3 text-sm text-neutral-700">{item.name}</td>
                                  <td className="px-4 py-3 text-sm text-right text-neutral-700"><CurrencyFormatter amount={item.budget} /></td>
                                  <td className="px-4 py-3 text-sm text-right text-neutral-700"><CurrencyFormatter amount={actual} /></td>
                                  <td className={`px-4 py-3 text-sm text-right ${diff >= 0 ? 'text-[#107C10]' : 'text-[#D13438]'}`}>
                                    {diff >= 0 ? '+' : ''}<CurrencyFormatter amount={diff} />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end">
                                      <span className={`mr-2 ${percentage > 100 ? 'text-[#D13438]' : 'text-neutral-500'}`}>
                                        {Math.round(percentage)}%
                                      </span>
                                      <div className="w-16 bg-neutral-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className={`h-full ${percentage > 100 ? 'bg-[#D13438]' : 'bg-[#FFB900]'}`}
                                          style={{ width: `${Math.min(100, percentage)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-neutral-50">
                              <td className="px-4 py-3 text-sm font-medium">Toplam</td>
                              <td className="px-4 py-3 text-sm font-medium text-right"><CurrencyFormatter amount={selectedBudget.totalExpense} /></td>
                              <td className="px-4 py-3 text-sm font-medium text-right"><CurrencyFormatter amount={actualExpense} /></td>
                              <td className={`px-4 py-3 text-sm font-medium text-right ${selectedBudget.totalExpense - actualExpense >= 0 ? 'text-[#107C10]' : 'text-[#D13438]'}`}>
                                {selectedBudget.totalExpense - actualExpense >= 0 ? '+' : ''}
                                <CurrencyFormatter amount={selectedBudget.totalExpense - actualExpense} />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-right">
                                <span className={actualExpense > selectedBudget.totalExpense ? 'text-[#D13438]' : 'text-neutral-500'}>
                                  {Math.round(getPercentage(actualExpense, selectedBudget.totalExpense))}%
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <TrendingUp className="h-8 w-8 text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">Henüz Bütçe Bulunmuyor</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                Finansal hedeflerinizi takip etmek için bir bütçe oluşturun. 
                Gelir ve gider hedeflerinizi belirleyip ilerlemenizi izleyebilirsiniz.
              </p>
              <Button onClick={handleNewBudget}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bütçe Oluştur
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Yeni Bütçe Ekleme Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Bütçe Oluştur</DialogTitle>
          </DialogHeader>
          <BudgetForm onSuccess={() => setIsNewDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Bütçe Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bütçeyi Düzenle</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <BudgetForm
              budgetId={selectedBudget.id}
              defaultValues={selectedBudget}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bütçe Silme Onay Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bütçeyi Sil</DialogTitle>
            <DialogDescription>
              Bu bütçeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Budget;
