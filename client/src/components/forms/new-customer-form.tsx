import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { insertCustomerSchema } from "@shared/schema";

// Extend the schema with any additional validation
const customerFormSchema = insertCustomerSchema.extend({
  name: z.string().min(3, { message: "Müşteri adı en az 3 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface NewCustomerFormProps {
  onSuccess?: () => void;
}

const NewCustomerForm = ({ onSuccess }: NewCustomerFormProps) => {
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      taxId: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      notes: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla eklendi.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Müşteri eklenirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri Adı *</FormLabel>
                <FormControl>
                  <Input placeholder="Müşteri adını giriniz" {...field} />
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
            disabled={createCustomerMutation.isPending}
          >
            {createCustomerMutation.isPending ? (
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

export default NewCustomerForm;
