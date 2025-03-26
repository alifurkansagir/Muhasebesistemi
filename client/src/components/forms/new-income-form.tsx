import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import { insertIncomeSchema } from "@shared/schema";
import { CURRENCY_OPTIONS, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";

// Extend the schema with any additional validation
const incomeFormSchema = insertIncomeSchema.extend({
  amount: z.coerce.number().positive({ message: "Tutar pozitif bir değer olmalıdır" }),
  description: z.string().min(3, { message: "Açıklama en az 3 karakter olmalıdır" }),
  date: z.date({ required_error: "Tarih seçiniz" }),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface NewIncomeFormProps {
  onSuccess?: () => void;
}

const NewIncomeForm = ({ onSuccess }: NewIncomeFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      description: "",
      category: "Hizmet",
      currency: "TRY",
      paymentMethod: "Banka Havalesi",
      reference: "",
      notes: "",
    },
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormValues) => {
      const response = await apiRequest("POST", "/api/incomes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Başarılı",
        description: "Gelir kaydı başarıyla oluşturuldu.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Gelir kaydı oluşturulamadı: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncomeFormValues) => {
    createIncomeMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tarih *</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
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
                        setOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutar *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Tutarı girin"
                    step="0.01"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama *</FormLabel>
                <FormControl>
                  <Input placeholder="Açıklama girin" {...field} />
                </FormControl>
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
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INCOME_CATEGORIES.map((category) => (
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
            name="customerId"
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

          <FormField
            control={form.control}
            name="currency"
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

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödeme Yöntemi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
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
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referans</FormLabel>
                <FormControl>
                  <Input placeholder="Referans numarası" {...field} />
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
                <Textarea
                  placeholder="Ek notlar"
                  className="resize-none h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            disabled={createIncomeMutation.isPending}
          >
            {createIncomeMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewIncomeForm;
