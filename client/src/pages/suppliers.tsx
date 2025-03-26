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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Supplier, InsertSupplier } from "@shared/schema";
import { insertSupplierSchema } from "@shared/schema";
import { z } from "zod";

// Extend the schema with any additional validation
const supplierFormSchema = insertSupplierSchema.extend({
  name: z.string().min(3, { message: "Tedarikçi adı en az 3 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

const Suppliers = () => {
  const { toast } = useToast();
  const [isNewSupplierDialogOpen, setIsNewSupplierDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      taxId: "",
      notes: "",
    },
  });

  const { data: suppliers, isLoading, error } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const response = await apiRequest("POST", "/api/suppliers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Başarılı",
        description: "Tedarikçi başarıyla eklendi.",
      });
      setIsNewSupplierDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Tedarikçi eklenirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Başarılı",
        description: "Tedarikçi başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Tedarikçi silinirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof supplierFormSchema>) => {
    createSupplierMutation.mutate(data);
  };

  // Filter and sort suppliers
  const filteredSuppliers = suppliers 
    ? suppliers
        .filter(supplier => 
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Paginate
  const paginatedSuppliers = filteredSuppliers
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const handleDeleteClick = (id: number) => {
    setSupplierToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete !== null) {
      deleteSupplierMutation.mutate(supplierToDelete);
      setIsDeleteAlertOpen(false);
      setSupplierToDelete(null);
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
        <h3 className="text-lg font-medium mb-2">Tedarikçiler yüklenirken bir hata oluştu</h3>
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
          <CardTitle className="text-lg">Tedarikçi Yönetimi</CardTitle>
          <Dialog open={isNewSupplierDialogOpen} onOpenChange={setIsNewSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-truck mr-2"></i>
                Yeni Tedarikçi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Tedarikçi Ekle</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tedarikçi Adı *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tedarikçi adını giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vergi No</FormLabel>
                          <FormControl>
                            <Input placeholder="Vergi numarasını giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="Telefon numarası giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input placeholder="E-posta adresi giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Input placeholder="Adres giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şehir</FormLabel>
                          <FormControl>
                            <Input placeholder="Şehir giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notlar</FormLabel>
                        <FormControl>
                          <Input placeholder="Ek notlar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewSupplierDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSupplierMutation.isPending}
                    >
                      {createSupplierMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Kaydediliyor...
                        </>
                      ) : "Kaydet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <Input
            placeholder="Tedarikçi ara..."
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
                  <TableHead>Tedarikçi Adı</TableHead>
                  <TableHead>Vergi No</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSuppliers.length > 0 ? (
                  paginatedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.taxId || "-"}</TableCell>
                      <TableCell>{supplier.phone || "-"}</TableCell>
                      <TableCell>{supplier.email || "-"}</TableCell>
                      <TableCell>{supplier.city || "-"}</TableCell>
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
                            onClick={() => handleDeleteClick(supplier.id)}
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
                      Tedarikçi bulunamadı.
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
            <AlertDialogTitle>Tedarikçiyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default Suppliers;
