import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import { insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

// Extend the schema with any additional validation
const settingsFormSchema = insertSettingsSchema.extend({
  companyName: z.string().min(3, { message: "Şirket adı en az 3 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const SystemSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [uploading, setUploading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      companyName: "",
      taxId: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
      defaultCurrency: "TRY",
      fiscalYear: "01-01",
      invoicePrefix: "INV",
      expensePrefix: "EXP",
    },
  });

  // Settings query
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    onSuccess: (data) => {
      // Set form values when settings are loaded
      if (data) {
        Object.keys(data).forEach((key) => {
          if (key in form.getValues()) {
            form.setValue(key as any, data[key as keyof typeof data]);
          }
        });
      }
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Başarılı",
        description: "Sistem ayarları başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Ayarlar güncellenirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  // Simulated file upload function
  const handleLogoUpload = () => {
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      form.setValue("logo", "/uploaded-logo-placeholder.png");
      
      toast({
        title: "Başarılı",
        description: "Logo yüklendi.",
      });
    }, 1500);
  };

  // Backup database simulation
  const handleBackupDatabase = () => {
    toast({
      title: "Başarılı",
      description: "Veritabanı yedeklemesi başarıyla tamamlandı.",
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white shadow rounded-lg p-4 h-20"></div>
        <div className="bg-white shadow rounded-lg p-4 h-80"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Sistem Ayarları</CardTitle>
          <CardDescription>
            Muhasebe sistemi genel ayarlarını burada yapılandırabilirsiniz.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
              <TabsTrigger value="invoice">Fatura Ayarları</TabsTrigger>
              <TabsTrigger value="backup">Yedekleme</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="company">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şirket Adı *</FormLabel>
                            <FormControl>
                              <Input placeholder="Şirket adını giriniz" {...field} />
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
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Şirket adresini giriniz"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şirket Logosu</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              <div>
                                {field.value ? (
                                  <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-neutral-100 flex items-center justify-center">
                                      <i className="fas fa-image text-4xl text-neutral-400"></i>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border border-dashed border-neutral-300 rounded-lg p-4 flex items-center justify-center">
                                    <div className="w-32 h-32 flex items-center justify-center">
                                      <i className="fas fa-cloud-upload-alt text-4xl text-neutral-400"></i>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={handleLogoUpload}
                                  disabled={uploading}
                                >
                                  {uploading ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin mr-2"></i>
                                      Yükleniyor...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-upload mr-2"></i>
                                      Logo Yükle
                                    </>
                                  )}
                                </Button>
                                <p className="text-xs text-neutral-500 mt-2">
                                  Önerilen boyut: 200x200 piksel, maksimum 2MB
                                </p>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="defaultCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Varsayılan Para Birimi</FormLabel>
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
                  </div>
                </TabsContent>
                
                <TabsContent value="invoice">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="invoicePrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fatura No Ön Eki</FormLabel>
                            <FormControl>
                              <Input placeholder="Fatura no ön eki giriniz" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-neutral-500 mt-1">
                              Örnek: {field.value}-2023-0001
                            </p>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expensePrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gider No Ön Eki</FormLabel>
                            <FormControl>
                              <Input placeholder="Gider no ön eki giriniz" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-neutral-500 mt-1">
                              Örnek: {field.value}-2023-0001
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fiscalYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mali Yıl Başlangıcı</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Mali yıl başlangıcı seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="01-01">1 Ocak (01-01)</SelectItem>
                                <SelectItem value="04-01">1 Nisan (04-01)</SelectItem>
                                <SelectItem value="07-01">1 Temmuz (07-01)</SelectItem>
                                <SelectItem value="10-01">1 Ekim (10-01)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="border rounded-lg p-4 mt-4">
                        <h3 className="font-medium mb-2">Fatura Şablonu</h3>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm">Varsayılan fatura şablonu</div>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-pencil-alt mr-2"></i>
                            Düzenle
                          </Button>
                        </div>
                        <div className="border border-dashed border-neutral-300 rounded-lg p-8 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-file-invoice text-4xl text-neutral-400 mb-2"></i>
                            <p className="text-sm">Fatura Önizleme</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="backup">
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Veritabanı Yedekleme</h3>
                      <p className="text-sm mb-4">
                        Tüm verilerinizin bir yedeğini oluşturun ve indirin. Yedekler, 
                        verilerinizi kaybetme durumunda kritik öneme sahiptir.
                      </p>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleBackupDatabase}
                        >
                          <i className="fas fa-database mr-2"></i>
                          Veritabanını Yedekle
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                        >
                          <i className="fas fa-upload mr-2"></i>
                          Yedekten Geri Yükle
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Otomatik Yedekleme</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium">Günlük Yedekleme</p>
                          <p className="text-sm text-neutral-500">Her gün gece yarısı otomatik olarak yedeklenir</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="dailyBackup" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="dailyBackup" className="ml-2 text-sm">Aktif</label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Haftalık Yedekleme</p>
                          <p className="text-sm text-neutral-500">Her Pazar günü tam yedekleme yapılır</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="weeklyBackup" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="weeklyBackup" className="ml-2 text-sm">Aktif</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Veri Temizleme</h3>
                      <p className="text-sm text-neutral-500 mb-4">
                        Eski verileri temizlemek, sistemin performansını artırabilir. Bu işlem geri alınamaz.
                      </p>
                      
                      <Button variant="outline" className="bg-danger text-white hover:bg-danger/90">
                        <i className="fas fa-trash-alt mr-2"></i>
                        Eski İşlemleri Temizle
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Sıfırla
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Kaydediliyor...
                      </>
                    ) : (
                      "Değişiklikleri Kaydet"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default SystemSettings;
