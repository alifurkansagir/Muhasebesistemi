import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Customer, Supplier, Product, Tax } from "@shared/schema";
import { insertInvoiceSchema, insertInvoiceItemSchema } from "@shared/schema";
import { CURRENCY_OPTIONS, INVOICE_STATUS_OPTIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format-currency";

// Define the line item schema
const invoiceLineItemSchema = insertInvoiceItemSchema.omit({ invoiceId: true }).extend({
  quantity: z.coerce.number().positive({ message: "Miktar pozitif olmalıdır" }),
  unitPrice: z.coerce.number().nonnegative({ message: "Birim fiyat negatif olamaz" }),
  taxRate: z.coerce.number().nonnegative({ message: "Vergi oranı negatif olamaz" }),
  productId: z.number().optional(),
});

// Define the invoice schema with line items
const invoiceFormSchema = z.object({
  invoice: insertInvoiceSchema.omit({ id: true }).extend({
    date: z.date({ required_error: "Tarih seçiniz" }),
    dueDate: z.date({ required_error: "Vade tarihi seçiniz" }).optional(),
    customerId: z.number().optional(),
    supplierId: z.number().optional(),
    totalAmount: z.coerce.number().nonnegative({ message: "Toplam tutar negatif olamaz" }),
    taxAmount: z.coerce.number().nonnegative({ message: "Vergi tutarı negatif olamaz" }),
  }),
  items: z.array(invoiceLineItemSchema).min(1, { message: "En az bir kalem girilmelidir" }),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface NewInvoiceFormProps {
  onSuccess?: () => void;
}

const NewInvoiceForm = ({ onSuccess }: NewInvoiceFormProps) => {
  const { toast } = useToast();
  const [dateOpen, setDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'income' | 'expense'>('income');

  // Setup form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice: {
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date(),
        totalAmount: 0,
        taxAmount: 0,
        status: "draft",
        type: "income",
        currency: "TRY",
      },
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 18, // Default KDV in Turkey
          totalPrice: 0,
        },
      ],
    },
  });

  // Setup field array for invoice items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Set invoice type
  const handleInvoiceTypeChange = (type: 'income' | 'expense') => {
    setInvoiceType(type);
    form.setValue("invoice.type", type);
    
    // Update invoice number prefix based on type
    const currentNumber = form.getValues("invoice.invoiceNumber").split('-').pop();
    form.setValue(
      "invoice.invoiceNumber", 
      type === 'income' ? `INV-${new Date().getFullYear()}-${currentNumber}` : `EXP-${new Date().getFullYear()}-${currentNumber}`
    );
    
    // Clear counter party
    if (type === 'income') {
      form.setValue("invoice.supplierId", undefined);
    } else {
      form.setValue("invoice.customerId", undefined);
    }
  };

  // Fetch needed data
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: taxes } = useQuery<Tax[]>({
    queryKey: ['/api/taxes'],
  });

  // Calculate line item totals
  const calculateLineTotal = (quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // Update line item totals when inputs change
  const updateLineTotal = (index: number) => {
    const items = form.getValues("items");
    const item = items[index];
    
    if (item && item.quantity && item.unitPrice) {
      const { total } = calculateLineTotal(item.quantity, item.unitPrice, item.taxRate || 0);
      form.setValue(`items.${index}.totalPrice`, total);
      
      // Recalculate invoice totals
      updateInvoiceTotals();
    }
  };

  // Update invoice totals
  const updateInvoiceTotals = () => {
    const items = form.getValues("items");
    
    let subtotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;
    
    items.forEach(item => {
      if (item.quantity && item.unitPrice) {
        const { subtotal: lineSubtotal, taxAmount, total } = calculateLineTotal(
          item.quantity, 
          item.unitPrice, 
          item.taxRate || 0
        );
        
        subtotal += lineSubtotal;
        taxTotal += taxAmount;
        grandTotal += total;
      }
    });
    
    form.setValue("invoice.taxAmount", taxTotal);
    form.setValue("invoice.totalAmount", grandTotal);
  };

  // Handle product selection
  const handleProductSelection = (value: string, index: number) => {
    const productId = parseInt(value);
    const selectedProduct = products?.find(p => p.id === productId);
    
    if (selectedProduct) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.description`, selectedProduct.name);
      form.setValue(`items.${index}.unitPrice`, selectedProduct.sellingPrice || 0);
      
      updateLineTotal(index);
    }
  };

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: "Fatura başarıyla oluşturuldu.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Fatura oluşturulamadı: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoiceMutation.mutate(data);
  };

  // Add new line item
  const addLineItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      totalPrice: 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice Type Selection */}
        <div className="flex space-x-4 mb-2">
          <Button
            type="button"
            variant={invoiceType === 'income' ? "default" : "outline"}
            className={invoiceType === 'income' ? "bg-success hover:bg-success/90" : ""}
            onClick={() => handleInvoiceTypeChange('income')}
          >
            <i className="fas fa-arrow-down mr-2"></i>
            Satış Faturası
          </Button>
          
          <Button
            type="button"
            variant={invoiceType === 'expense' ? "default" : "outline"}
            className={invoiceType === 'expense' ? "bg-danger hover:bg-danger/90" : ""}
            onClick={() => handleInvoiceTypeChange('expense')}
          >
            <i className="fas fa-arrow-up mr-2"></i>
            Alış Faturası
          </Button>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="invoice.invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatura No *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatura Tarihi *</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy", { locale: tr })
                            ) : (
                              <span>Tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDateOpen(false);
                          }}
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
                name="invoice.dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vade Tarihi</FormLabel>
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy", { locale: tr })
                            ) : (
                              <span>Tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDueDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {invoiceType === 'income' ? (
                <FormField
                  control={form.control}
                  name="invoice.customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Müşteri</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Müşteri seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Müşteri yok</SelectItem>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="invoice.supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tedarikçi</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tedarikçi seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Tedarikçi yok</SelectItem>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="invoice.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVOICE_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
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
                name="invoice.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Para birimi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Fatura Kalemleri</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>KDV %</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Select
                        onValueChange={(value) => handleProductSelection(value, index)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Ürün seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Manuel Giriş</SelectItem>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Kalem açıklaması"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="1"
                                className="w-20"
                                onChange={(e) => {
                                  field.onChange(e);
                                  updateLineTotal(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-28"
                                onChange={(e) => {
                                  field.onChange(e);
                                  updateLineTotal(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(parseFloat(value));
                                  updateLineTotal(index);
                                }}
                                value={field.value?.toString()}
                                defaultValue="18"
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue placeholder="KDV" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">%0</SelectItem>
                                  <SelectItem value="1">%1</SelectItem>
                                  <SelectItem value="8">%8</SelectItem>
                                  <SelectItem value="18">%18</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.totalPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                readOnly
                                className="w-28 bg-neutral-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            remove(index);
                            updateInvoiceTotals();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
              >
                <i className="fas fa-plus mr-2"></i>
                Kalem Ekle
              </Button>
            </div>

            {/* Invoice Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Ara Toplam:</span>
                  <span className="font-medium">
                    {formatCurrency((form.watch("invoice.totalAmount") || 0) - (form.watch("invoice.taxAmount") || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">KDV Toplam:</span>
                  <span className="font-medium">
                    {formatCurrency(form.watch("invoice.taxAmount") || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2">
                  <span className="font-medium">Genel Toplam:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(form.watch("invoice.totalAmount") || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="invoice.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fatura ile ilgili notlar"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={createInvoiceMutation.isPending}
          >
            {createInvoiceMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Kaydediliyor...
              </>
            ) : (
              "Faturayı Kaydet"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewInvoiceForm;
