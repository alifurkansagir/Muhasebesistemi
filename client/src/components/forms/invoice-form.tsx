import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Minus, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const invoiceFormSchema = insertInvoiceSchema.extend({
  issueDate: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") return new Date(val);
    return val;
  }),
  dueDate: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") return new Date(val);
    return val;
  }),
});

const invoiceItemFormSchema = insertInvoiceItemSchema.extend({
  quantity: z.coerce.number().min(0.01, "Miktar sıfırdan büyük olmalıdır"),
  unitPrice: z.coerce.number().min(0, "Birim fiyat sıfır veya daha büyük olmalıdır"),
  taxRate: z.coerce.number().min(0, "Vergi oranı sıfır veya daha büyük olmalıdır"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;

interface InvoiceFormProps {
  invoiceId?: number;
  onSuccess?: () => void;
  defaultValues?: Partial<InvoiceFormValues>;
  type?: "sales" | "purchase";
}

const InvoiceForm = ({
  invoiceId,
  onSuccess,
  defaultValues,
  type = "sales",
}: InvoiceFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormValues[]>([]);
  const { toast } = useToast();
  const isEditMode = !!invoiceId;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      type,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      status: "draft",
      totalAmount: 0,
      taxAmount: 0,
      notes: "",
      currencyId: 1,
      ...(type === "sales" ? { customerId: undefined, supplierId: undefined } : {}),
      ...(type === "purchase" ? { customerId: undefined, supplierId: undefined } : {}),
      ...defaultValues,
    },
  });

  const itemForm = useForm<InvoiceItemFormValues>({
    resolver: zodResolver(invoiceItemFormSchema),
    defaultValues: {
      invoiceId: 0,
      productId: undefined,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      taxAmount: 0,
      totalAmount: 0,
    },
  });

  // Fetch invoice if in edit mode
  const { data: invoice } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    enabled: isEditMode,
  });

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    enabled: type === "sales",
  });

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ["/api/suppliers"],
    enabled: type === "purchase",
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  // Fetch currencies
  const { data: currencies } = useQuery({
    queryKey: ["/api/currencies"],
  });

  // Set form values when invoice is loaded in edit mode
  useEffect(() => {
    if (isEditMode && invoice) {
      form.reset({
        ...invoice,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
      });
      
      if (invoice.items) {
        setInvoiceItems(invoice.items);
      }
    }
  }, [isEditMode, invoice, form]);

  // Calculate invoice item amounts when any value changes
  useEffect(() => {
    const quantity = itemForm.watch("quantity");
    const unitPrice = itemForm.watch("unitPrice");
    const taxRate = itemForm.watch("taxRate");
    
    if (quantity && unitPrice !== undefined) {
      const subtotal = quantity * unitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;
      
      itemForm.setValue("taxAmount", taxAmount);
      itemForm.setValue("totalAmount", totalAmount);
    }
  }, [itemForm.watch("quantity"), itemForm.watch("unitPrice"), itemForm.watch("taxRate"), itemForm]);

  // Calculate invoice totals
  useEffect(() => {
    if (invoiceItems.length > 0) {
      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const taxAmount = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
      
      form.setValue("totalAmount", totalAmount);
      form.setValue("taxAmount", taxAmount);
    } else {
      form.setValue("totalAmount", 0);
      form.setValue("taxAmount", 0);
    }
  }, [invoiceItems, form]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === parseInt(productId));
    if (product) {
      itemForm.setValue("productId", parseInt(productId));
      itemForm.setValue("description", product.name);
      itemForm.setValue("unitPrice", product.price);
      itemForm.setValue("taxRate", product.taxRate);
      
      // Recalculate item totals
      const quantity = itemForm.watch("quantity");
      const unitPrice = product.price;
      const taxRate = product.taxRate;
      
      const subtotal = quantity * unitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;
      
      itemForm.setValue("taxAmount", taxAmount);
      itemForm.setValue("totalAmount", totalAmount);
    }
  };

  // Add invoice item
  const handleAddItem = () => {
    const validationResult = invoiceItemFormSchema.safeParse(itemForm.getValues());
    
    if (!validationResult.success) {
      for (const error of validationResult.error.errors) {
        toast({
          title: "Hata",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }
    
    const newItem = itemForm.getValues();
    setInvoiceItems([...invoiceItems, newItem]);
    
    itemForm.reset({
      invoiceId: 0,
      productId: undefined,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      taxAmount: 0,
      totalAmount: 0,
    });
  };

  // Remove invoice item
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    if (invoiceItems.length === 0) {
      toast({
        title: "Hata",
        description: "Fatura en az bir kalem içermelidir",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const invoiceData = {
        ...values,
        items: invoiceItems,
      };

      if (isEditMode) {
        await apiRequest('PATCH', `/api/invoices/${invoiceId}`, invoiceData);
        toast({
          title: "Fatura güncellendi",
          description: "Fatura başarıyla güncellendi",
        });
      } else {
        await apiRequest('POST', "/api/invoices", invoiceData);
        toast({
          title: "Fatura oluşturuldu",
          description: "Yeni fatura başarıyla oluşturuldu",
        });
        form.reset();
        setInvoiceItems([]);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      toast({
        title: "Hata",
        description: "Fatura kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fatura No</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={type === "sales" ? "customerId" : "supplierId"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === "sales" ? "Müşteri" : "Tedarikçi"}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={type === "sales" ? "Müşteri seçin" : "Tedarikçi seçin"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {type === "sales" && customers?.map((customer: any) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.name}
                        </SelectItem>
                      ))}
                      {type === "purchase" && suppliers?.map((supplier: any) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durum</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="sent">Gönderildi</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                      <SelectItem value="overdue">Gecikmiş</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fatura Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>Tarih Seçin</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Son Ödeme Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>Tarih Seçin</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para Birimi</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : "1"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Para birimi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies?.map((currency: any) => (
                        <SelectItem
                          key={currency.id}
                          value={currency.id.toString()}
                        >
                          {currency.code} - {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Invoice Items */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Fatura Kalemleri</h3>
              
              {/* Add Item Form */}
              <div className="grid grid-cols-12 gap-3 mb-4">
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ürün</label>
                  <Select onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: any) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Açıklama</label>
                  <Input {...itemForm.register("description")} />
                </div>
                
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Miktar</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    {...itemForm.register("quantity", { valueAsNumber: true })} 
                  />
                </div>
                
                <div className="col-span-8 md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Birim Fiyat</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...itemForm.register("unitPrice", { valueAsNumber: true })} 
                  />
                </div>
                
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">KDV %</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...itemForm.register("taxRate", { valueAsNumber: true })} 
                  />
                </div>
                
                <div className="col-span-8 md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Toplam</label>
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-neutral-100">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(itemForm.watch("totalAmount") || 0)}
                  </div>
                </div>
                
                <div className="col-span-12 md:col-span-1 flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleAddItem}
                    className="w-full bg-[#0078D4] hover:bg-[#005A9E]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                </div>
              </div>
              
              {/* Items Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Açıklama</TableHead>
                      <TableHead className="text-right">Miktar</TableHead>
                      <TableHead className="text-right">Birim Fiyat</TableHead>
                      <TableHead className="text-right">KDV %</TableHead>
                      <TableHead className="text-right">KDV Tutarı</TableHead>
                      <TableHead className="text-right">Toplam</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          Henüz fatura kalemi eklenmedi
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoiceItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            }).format(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">{item.taxRate}%</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            }).format(item.taxAmount)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            }).format(item.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 text-[#D13438]"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Invoice Totals */}
              {invoiceItems.length > 0 && (
                <div className="flex justify-end mt-4">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Ara Toplam:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(form.watch("totalAmount") - form.watch("taxAmount"))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">KDV Toplam:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(form.watch("taxAmount"))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Genel Toplam:</span>
                      <span className="font-bold text-lg">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(form.watch("totalAmount"))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fatura Notları</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ek notlar..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-[#0078D4] hover:bg-[#005A9E]">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InvoiceForm;
