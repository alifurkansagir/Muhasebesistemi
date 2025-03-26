import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import NewCustomerForm from "@/components/forms/new-customer-form";
import type { Customer } from "@shared/schema";

const Customers = () => {
  const { toast } = useToast();
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customers, isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Müşteri silinirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort customers
  const filteredCustomers = customers 
    ? customers
        .filter(customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Paginate
  const paginatedCustomers = filteredCustomers
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleDeleteClick = (id: number) => {
    setCustomerToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete !== null) {
      deleteCustomerMutation.mutate(customerToDelete);
      setIsDeleteAlertOpen(false);
      setCustomerToDelete(null);
    }
  };

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
        <h3 className="text-lg font-medium mb-2">Müşteriler yüklenirken bir hata oluştu</h3>
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
          <CardTitle className="text-lg">Müşteri Yönetimi</CardTitle>
          <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-user-plus mr-2"></i>
                Yeni Müşteri
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              </DialogHeader>
              <NewCustomerForm onSuccess={() => {
                setIsNewCustomerDialogOpen(false);
                toast({
                  title: "Başarılı",
                  description: "Müşteri başarıyla eklendi.",
                });
              }} />
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <Input
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <i className="fas fa-sync-alt mr-2"></i>
              Sıfırla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri Adı</TableHead>
                  <TableHead>Vergi No</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.taxId || "-"}</TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.city || "-"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <i className="fas fa-eye text-primary"></i>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(customer.id)}
                          >
                            <i className="fas fa-trash-alt text-danger"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Müşteri bulunamadı.
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
                  {[...Array(totalPages)].map((_, i) => (
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-danger hover:bg-danger/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Customers;
