import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface LowStockItemsProps {
  products: Product[];
}

const LowStockItems = ({ products }: LowStockItemsProps) => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(10);
  
  // Function to determine alert level based on stock quantity and threshold
  const getAlertLevel = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return {
        icon: "exclamation-triangle",
        iconClass: "text-danger",
        bgClass: "bg-danger bg-opacity-10"
      };
    } else if (quantity <= threshold / 2) {
      return {
        icon: "exclamation-triangle",
        iconClass: "text-danger",
        bgClass: "bg-danger bg-opacity-10"
      };
    } else {
      return {
        icon: "exclamation-circle",
        iconClass: "text-accent",
        bgClass: "bg-accent bg-opacity-10"
      };
    }
  };

  // Order stock mutation (simulated)
  const orderStockMutation = useMutation({
    mutationFn: async (data: { productId: number, quantity: number }) => {
      // In a real app, this would call an API to create a purchase order
      // For demo, we'll simulate updating the product stock
      const updatedProduct = {
        ...selectedProduct!,
        stockQuantity: (selectedProduct?.stockQuantity || 0) + data.quantity
      };
      
      const response = await apiRequest("PUT", `/api/products/${data.productId}`, updatedProduct);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: `${selectedProduct?.name} için sipariş verildi.`,
      });
      
      setIsDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Sipariş verilirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setOrderQuantity(product.alertThreshold ? product.alertThreshold * 2 : 10);
    setIsDialogOpen(true);
  };

  const submitOrder = () => {
    if (selectedProduct) {
      orderStockMutation.mutate({ 
        productId: selectedProduct.id,
        quantity: orderQuantity
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Düşük Stok Uyarısı</h2>
        <Link href="/inventory">
          <Button variant="link" className="text-primary text-sm p-0 h-auto">
            Stok Yönetimi
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product) => {
            const alertLevel = getAlertLevel(product.stockQuantity || 0, product.alertThreshold || 5);
            
            return (
              <div key={product.id} className="flex justify-between items-center border-b border-neutral-200 pb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${alertLevel.bgClass} flex items-center justify-center mr-3`}>
                    <i className={`fas fa-${alertLevel.icon} ${alertLevel.iconClass}`}></i>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-neutral-500">
                      Kalan: {product.stockQuantity} {product.unit}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="text-primary text-sm p-0 h-auto"
                  onClick={() => handleOrderClick(product)}
                >
                  Sipariş Ver
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <i className="fas fa-box-open text-2xl mb-2"></i>
            <p>Düşük stok uyarısı bulunmamaktadır</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stok Siparişi Ver</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} ürünü için sipariş detaylarını girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Ürün
              </Label>
              <Input
                id="product"
                value={selectedProduct?.name || ''}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-stock" className="text-right">
                Mevcut Stok
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="current-stock"
                  value={selectedProduct?.stockQuantity || 0}
                  className="w-20"
                  disabled
                />
                <span>{selectedProduct?.unit}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Sipariş Miktarı
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span>{selectedProduct?.unit}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Tedarikçi
              </Label>
              <Select defaultValue="1">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ofis Dünyası Ltd. Şti.</SelectItem>
                  <SelectItem value="2">Tekno Bilişim A.Ş.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expected-date" className="text-right">
                Tahmini Teslim
              </Label>
              <Input
                id="expected-date"
                type="date"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={submitOrder} disabled={orderStockMutation.isPending}>
              {orderStockMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  İşleniyor...
                </>
              ) : (
                "Sipariş Ver"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LowStockItems;
