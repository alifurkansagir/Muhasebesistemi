import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTransactionSchema } from "@shared/schema";
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
import { Loader2 } from "lucide-react";

const transactionFormSchema = insertTransactionSchema.extend({
  date: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === "string") return new Date(val);
    return val;
  }),
  amount: z.coerce.number().min(0, "Tutar sıfırdan büyük olmalıdır"),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transactionId?: number;
  onSuccess?: () => void;
  defaultValues?: Partial<TransactionFormValues>;
  type?: "income" | "expense";
}

const TransactionForm = ({
  transactionId,
  onSuccess,
  defaultValues,
  type = "income",
}: TransactionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!transactionId;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionNumber: "",
      date: new Date(),
      description: "",
      amount: 0,
      type,
      categoryId: 0,
      paymentMethod: "cash",
      status: "completed",
      notes: "",
      currencyId: 1,
      ...defaultValues,
    },
  });

  // Fetch transaction if in edit mode
  const { data: transaction } = useQuery({
    queryKey: ["/api/transactions", transactionId],
    enabled: isEditMode,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Set form values when transaction is loaded in edit mode
  useEffect(() => {
    if (isEditMode && transaction) {
      form.reset({
        ...transaction,
        date: new Date(transaction.date),
      });
    }
  }, [isEditMode, transaction, form]);

  const onSubmit = async (values: TransactionFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await apiRequest('PATCH', `/api/transactions/${transactionId}`, values);
        toast({
          title: "İşlem güncellendi",
          description: "İşlem başarıyla güncellendi",
        });
      } else {
        await apiRequest('POST', "/api/transactions", values);
        toast({
          title: "İşlem oluşturuldu",
          description: "Yeni işlem başarıyla oluşturuldu",
        });
        form.reset();
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast({
        title: "Hata",
        description: "İşlem kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories?.filter(
    (category) => category.type === type
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transactionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İşlem No</FormLabel>
                <FormControl>
                  <Input placeholder="TRX-" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tarih</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left font-normal",
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Input placeholder="İşlem açıklaması..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutar</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Yöntemi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank">Banka Transferi</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
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
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea
                  placeholder="Ek notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
