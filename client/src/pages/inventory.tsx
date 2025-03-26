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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils/format-currency";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "@/lib/constants";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

// Extend the schema with any additional validation
const productFormSchema = insertProductSchema.extend({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır" }),
  purchasePrice: z.coerce.number().min(0, { message: "Alış fiyatı 0 veya daha büyük olmalıdır" }),
  sellingPrice: z.coerce.number().min(0, { message: "Satış fiyatı 0 veya daha büyük olmalıdır" }),
  stockQuantity: z.coerce.number().int().min(0, { message: "Stok miktarı 0 veya daha büyük olmalıdır" }),
  alertThreshold: z.coerce.number().int().min(0, { message: "Uyarı eşiği 0 veya daha büyük olmalıdır" }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const Inventory = () => {
  const { toast } = useToast();
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      purchasePrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      unit: "Adet",
      category: "",
      alertThreshold: 5,
    },
  });

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi.",
      });
      setIsNewProductDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ürün eklenirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ürün silinirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  // Filter and sort products
  const filteredProducts = products 
    ? products
        .filter(product => 
          (categoryFilter === "all" || product.category === categoryFilter) &&
          (stockFilter === "all" || 
           (stockFilter === "low" && product.stockQuantity <= product.alertThreshold) ||
           (stockFilter === "out" && product.stockQuantity === 0))
        )
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Paginate
  const paginatedProducts = filteredProducts
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get stock status
  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return {
        label: "Stokta Yok",
        className: "bg-danger bg-opacity-10 text-danger"
      };
    } else if (product.stockQuantity <= product.alertThreshold) {
      return {
        label: "Düşük Stok",
        className: "bg-accent bg-opacity-10 text-accent"
      };
    } else {
      return {
        label: "Stokta Var",
        className: "bg-success bg-opacity-10 text-success"
      };
    }
  };

  // Calculate stock ratio for progress bar
  const getStockRatio = (current: number, threshold: number) => {
    if (threshold === 0) return 100;
    if (current === 0) return 0;
    
    const ratio = (current / (threshold * 2)) * 100;
    return Math.min(Math.max(ratio, 0), 100);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete !== null) {
      deleteProductMutation.mutate(productToDelete);
      setIsDeleteAlertOpen(false);
      setProductToDelete(null);
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
        <h3 className="text-lg font-medium mb-2">Ürünler yüklenirken bir hata oluştu</h3>
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
          <CardTitle className="text-lg">Stok Yönetimi</CardTitle>
          <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Yeni Ürün
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ürün Adı *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ürün adını giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok Kodu</FormLabel>
                          <FormControl>
                            <Input placeholder="Stok kodu giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alış Fiyatı</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Satış Fiyatı</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok Miktarı</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birim</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Birim seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRODUCT_UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alertThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok Uyarı Eşiği</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Input placeholder="Ürün açıklaması giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewProductDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? (
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
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stok Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Stok</SelectItem>
                <SelectItem value="low">Düşük Stok</SelectItem>
                <SelectItem value="out">Stokta Yok</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setStockFilter("all");
            }}>
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
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Stok Kodu</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Alış Fiyatı</TableHead>
                  <TableHead>Satış Fiyatı</TableHead>
                  <TableHead>Stok Durumu</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const stockRatio = getStockRatio(product.stockQuantity, product.alertThreshold);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku || "-"}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>{formatCurrency(product.purchasePrice || 0)}</TableCell>
                        <TableCell>{formatCurrency(product.sellingPrice || 0)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={stockRatio} className="w-20 h-2" />
                            <span className={`px-2 py-1 ${stockStatus.className} text-xs rounded`}>
                              {product.stockQuantity} {product.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="ghost" size="icon">
                              <i className="fas fa-edit text-primary"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(product.id)}
                            >
                              <i className="fas fa-trash-alt text-danger"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Ürün bulunamadı.
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
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default Inventory;
