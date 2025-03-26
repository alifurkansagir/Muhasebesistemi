import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PaymentSchedule } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils/format-currency";
import { daysLeft, formatDate } from "@/lib/utils/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PaymentSchedules = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: 0,
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    category: "Kira",
    currency: "TRY",
    notes: "",
    recurring: false,
    recurringPeriod: "monthly"
  });
  
  const itemsPerPage = 10;

  const { data: paymentSchedules, isLoading } = useQuery<PaymentSchedule[]>({
    queryKey: ['/api/payment-schedules'],
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/payment-schedules", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: "Ödeme planı başarıyla oluşturuldu.",
      });
      
      setIsNewPaymentDialogOpen(false);
      setNewPayment({
        description: "",
        amount: 0,
        dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
        category: "Kira",
        currency: "TRY",
        notes: "",
        recurring: false,
        recurringPeriod: "monthly"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ödeme planı oluşturulamadı: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/payment-schedules/${id}`, { 
        isPaid: true,
        paymentDate: new Date()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: "Ödeme başarıyla gerçekleştirildi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ödeme işlemi başarısız: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/payment-schedules/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: "Ödeme planı başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ödeme planı silinemedi: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const handlePayment = (id: number) => {
    markAsPaidMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu ödeme planını silmek istediğinize emin misiniz?")) {
      deletePaymentMutation.mutate(id);
    }
  };

  const handleAddPayment = () => {
    const data = {
      ...newPayment,
      amount: Number(newPayment.amount),
      dueDate: new Date(newPayment.dueDate),
      recurring: Boolean(newPayment.recurring)
    };
    
    addPaymentMutation.mutate(data);
  };

  // Filter payment schedules
  const filteredPayments = paymentSchedules 
    ? paymentSchedules
        .filter(payment => {
          if (activeTab === "upcoming") {
            return !payment.isPaid;
          } else if (activeTab === "paid") {
            return payment.isPaid;
          } else {
            return true;
          }
        })
        .filter(payment => 
          categoryFilter === "all" || payment.category === categoryFilter
        )
        .filter(payment => 
          payment.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    : [];

  // Paginate
  const paginatedPayments = filteredPayments
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  if (isLoading) {
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
          <CardTitle className="text-lg">Ödeme Planları</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isNewPaymentDialogOpen} onOpenChange={setIsNewPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <i className="fas fa-plus mr-2"></i>
                  Yeni Ödeme Planla
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yeni Ödeme Planı Oluştur</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment-description">Açıklama</Label>
                    <Input
                      id="payment-description"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                      placeholder="Ödeme açıklaması"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-amount">Tutar</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-currency">Para Birimi</Label>
                    <Select 
                      value={newPayment.currency}
                      onValueChange={(value) => setNewPayment({...newPayment, currency: value})}
                    >
                      <SelectTrigger id="payment-currency">
                        <SelectValue placeholder="Para birimi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                        <SelectItem value="USD">Amerikan Doları ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">İngiliz Sterlini (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-due-date">Son Ödeme Tarihi</Label>
                    <Input
                      id="payment-due-date"
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment({...newPayment, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-category">Kategori</Label>
                    <Select 
                      value={newPayment.category}
                      onValueChange={(value) => setNewPayment({...newPayment, category: value})}
                    >
                      <SelectTrigger id="payment-category">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kira">Kira</SelectItem>
                        <SelectItem value="Fatura">Fatura</SelectItem>
                        <SelectItem value="Maaş">Maaş</SelectItem>
                        <SelectItem value="Vergi">Vergi</SelectItem>
                        <SelectItem value="Taksit">Taksit</SelectItem>
                        <SelectItem value="Sigorta">Sigorta</SelectItem>
                        <SelectItem value="Kredi">Kredi</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-notes">Notlar</Label>
                    <Textarea
                      id="payment-notes"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                      placeholder="Ödeme hakkında ek notlar"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="payment-recurring"
                      checked={newPayment.recurring}
                      onChange={(e) => setNewPayment({...newPayment, recurring: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="payment-recurring">Düzenli Tekrarlanan Ödeme</Label>
                  </div>
                  {newPayment.recurring && (
                    <div className="grid gap-2">
                      <Label htmlFor="payment-recurring-period">Tekrarlama Periyodu</Label>
                      <Select 
                        value={newPayment.recurringPeriod}
                        onValueChange={(value) => setNewPayment({...newPayment, recurringPeriod: value})}
                      >
                        <SelectTrigger id="payment-recurring-period">
                          <SelectValue placeholder="Periyot seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Haftalık</SelectItem>
                          <SelectItem value="monthly">Aylık</SelectItem>
                          <SelectItem value="quarterly">3 Aylık</SelectItem>
                          <SelectItem value="biannual">6 Aylık</SelectItem>
                          <SelectItem value="yearly">Yıllık</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsNewPaymentDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button 
                    onClick={handleAddPayment}
                    disabled={!newPayment.description || newPayment.amount <= 0 || addPaymentMutation.isPending}
                  >
                    {addPaymentMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Kaydediliyor...
                      </>
                    ) : (
                      "Kaydet"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Gelecek Ödemeler</TabsTrigger>
              <TabsTrigger value="paid">Ödenenler</TabsTrigger>
              <TabsTrigger value="all">Tümü</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <Input
                placeholder="Ödeme planı ara..."
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
                    <SelectItem value="Kira">Kira</SelectItem>
                    <SelectItem value="Fatura">Fatura</SelectItem>
                    <SelectItem value="Maaş">Maaş</SelectItem>
                    <SelectItem value="Vergi">Vergi</SelectItem>
                    <SelectItem value="Taksit">Taksit</SelectItem>
                    <SelectItem value="Sigorta">Sigorta</SelectItem>
                    <SelectItem value="Kredi">Kredi</SelectItem>
                    <SelectItem value="Diğer">Diğer</SelectItem>
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
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Son Ödeme Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tekrarlayan</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.length > 0 ? (
                    paginatedPayments.map((payment) => {
                      const daysRemaining = !payment.isPaid ? daysLeft(payment.dueDate) : 0;
                      const statusColor = !payment.isPaid
                        ? daysRemaining < 0
                          ? "bg-danger text-white"
                          : daysRemaining <= 7
                            ? "bg-warning text-black"
                            : "bg-success text-white"
                        : "bg-neutral-200 text-neutral-700";
                      
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>{formatDate(payment.dueDate)}</TableCell>
                          <TableCell>
                            <Badge className={statusColor}>
                              {payment.isPaid 
                                ? "Ödendi" 
                                : daysRemaining < 0 
                                  ? "Gecikmiş" 
                                  : `${daysRemaining} gün kaldı`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.recurring ? (
                              <Badge variant="secondary">
                                {payment.recurringPeriod === "weekly" && "Haftalık"}
                                {payment.recurringPeriod === "monthly" && "Aylık"}
                                {payment.recurringPeriod === "quarterly" && "3 Aylık"}
                                {payment.recurringPeriod === "biannual" && "6 Aylık"}
                                {payment.recurringPeriod === "yearly" && "Yıllık"}
                              </Badge>
                            ) : (
                              <span className="text-neutral-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <i className="fas fa-ellipsis-h text-neutral-500"></i>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {!payment.isPaid && (
                                  <DropdownMenuItem onClick={() => handlePayment(payment.id)}>
                                    <i className="fas fa-check-circle mr-2 text-success"></i> Öde
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => {}}>
                                  <i className="fas fa-edit mr-2 text-primary"></i> Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(payment.id)}>
                                  <i className="fas fa-trash-alt mr-2 text-danger"></i> Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Ödeme planı bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default PaymentSchedules;