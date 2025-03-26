import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NewInvoiceForm from "@/components/forms/new-invoice-form";
import NewIncomeForm from "@/components/forms/new-income-form";
import NewExpenseForm from "@/components/forms/new-expense-form";
import NewCustomerForm from "@/components/forms/new-customer-form";
import { QuickActionProps } from "@/lib/types";

const QuickActionButton = ({ icon, label, colorClass, onClick }: QuickActionProps) => {
  return (
    <button 
      className="bg-white shadow rounded-lg p-4 flex items-center justify-center hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center mr-3`}>
        <i className={`fas fa-${icon}`}></i>
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const QuickActions = () => {
  const { toast } = useToast();
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Yeni Fatura */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <QuickActionButton 
              icon="plus" 
              label="Yeni Fatura" 
              colorClass="bg-primary bg-opacity-10 text-primary" 
              onClick={() => setIsInvoiceDialogOpen(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Fatura Oluştur</DialogTitle>
          </DialogHeader>
          <NewInvoiceForm onSuccess={() => {
            setIsInvoiceDialogOpen(false);
            toast({
              title: "Başarılı",
              description: "Fatura başarıyla oluşturuldu.",
            });
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Gelir Ekle */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <QuickActionButton 
              icon="arrow-down" 
              label="Gelir Ekle" 
              colorClass="bg-success bg-opacity-10 text-success" 
              onClick={() => setIsIncomeDialogOpen(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Gelir Kaydı</DialogTitle>
          </DialogHeader>
          <NewIncomeForm onSuccess={() => {
            setIsIncomeDialogOpen(false);
            toast({
              title: "Başarılı",
              description: "Gelir kaydı başarıyla oluşturuldu.",
            });
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Gider Ekle */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <QuickActionButton 
              icon="arrow-up" 
              label="Gider Ekle" 
              colorClass="bg-danger bg-opacity-10 text-danger" 
              onClick={() => setIsExpenseDialogOpen(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Gider Kaydı</DialogTitle>
          </DialogHeader>
          <NewExpenseForm onSuccess={() => {
            setIsExpenseDialogOpen(false);
            toast({
              title: "Başarılı",
              description: "Gider kaydı başarıyla oluşturuldu.",
            });
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Müşteri Ekle */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <QuickActionButton 
              icon="user-plus" 
              label="Müşteri Ekle" 
              colorClass="bg-accent bg-opacity-10 text-accent" 
              onClick={() => setIsCustomerDialogOpen(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          </DialogHeader>
          <NewCustomerForm onSuccess={() => {
            setIsCustomerDialogOpen(false);
            toast({
              title: "Başarılı",
              description: "Müşteri başarıyla eklendi.",
            });
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions;
