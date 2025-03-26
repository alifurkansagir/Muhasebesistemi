import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils/format-currency";
import { daysLeft, formatDate } from "@/lib/utils/date-utils";
import { PaymentSchedule } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpcomingPaymentsProps {
  payments: PaymentSchedule[];
}

const UpcomingPayments = ({ payments }: UpcomingPaymentsProps) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    description: "",
    amount: 0,
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    category: "Kira",
    currency: "TRY",
    notes: "",
    recurring: false,
    recurringPeriod: "monthly"
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
      
      setIsDialogOpen(false);
      setNewPayment({
        description: "",
        amount: 0,
        dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
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

  const handlePayment = (id: number) => {
    markAsPaidMutation.mutate(id);
  };

  const handleAddPayment = () => {
    // API bekliyor: String tipinde "2025-04-24" değil, Date objesi
    try {
      const data = {
        description: newPayment.description,
        amount: Number(newPayment.amount),
        dueDate: new Date(newPayment.dueDate),
        category: newPayment.category,
        currency: newPayment.currency,
        notes: newPayment.notes,
        recurring: Boolean(newPayment.recurring),
        recurringPeriod: newPayment.recurringPeriod
      };
      
      console.log("Sending payment data:", data);
      addPaymentMutation.mutate(data);
    } catch (error) {
      console.error("Payment data error:", error);
      toast({
        title: "Hata",
        description: "Ödeme planı verisi hazırlanırken hata oluştu",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Yaklaşan Ödemeler</h2>
        <Link href="/payment-schedules">
          <Button variant="link" className="text-primary text-sm p-0 h-auto">
            Tümünü Gör
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {payments && payments.length > 0 ? (
          payments.map((payment) => {
            const daysRemaining = daysLeft(payment.dueDate);
            
            return (
              <div key={payment.id} className="border-b border-neutral-200 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-xs text-neutral-500">Son Ödeme: {formatDate(payment.dueDate)}</p>
                  </div>
                  <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs rounded">
                    {daysRemaining} gün kaldı
                  </span>
                  <Button 
                    variant="link" 
                    className="text-primary text-sm p-0 h-auto"
                    onClick={() => handlePayment(payment.id)}
                    disabled={markAsPaidMutation.isPending}
                  >
                    {markAsPaidMutation.isPending ? 'İşleniyor...' : 'Öde'}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <i className="fas fa-calendar-times text-2xl mb-2"></i>
            <p>Yaklaşan ödeme bulunamadı</p>
          </div>
        )}
        
        <div className="text-center pt-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <i className="fas fa-plus mr-2"></i>
                Yeni Ödeme Planla
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Ödeme Planla</DialogTitle>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
      </div>
    </div>
  );
};

export default UpcomingPayments;
