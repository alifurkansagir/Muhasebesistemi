import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Save,
  User,
  Key,
  Globe,
  DollarSign,
  FileText,
  Database,
  Bell,
  Shield,
  Languages
} from "lucide-react";

import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const { data: currencies } = useQuery({
    queryKey: ['/api/currencies'],
  });
  
  const handleSaveSettings = () => {
    toast({
      title: "Ayarlar kaydedildi",
      description: "Sistem ayarları başarıyla güncellendi",
    });
  };

  return (
    <>
      <Header 
        title="Sistem Ayarları" 
        subtitle="Sistem tercihlerinizi yapılandırın" 
        showNewButton={false}
      />
      
      <main className="flex-1 overflow-y-auto bg-[#FAF9F8] pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <Card>
                <CardContent className="p-0">
                  <ul className="py-2">
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'profile' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil Bilgileri
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'security' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('security')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Güvenlik
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'general' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('general')}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Genel Ayarlar
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'invoices' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('invoices')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Fatura Ayarları
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'currency' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('currency')}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Para Birimi ve Vergi
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'backup' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('backup')}
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Yedekleme ve Veri
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start px-4 py-2 rounded-none ${activeTab === 'notifications' ? 'bg-neutral-100' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Bildirimler
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <CardDescription>
                      Kişisel ve şirket bilgilerinizi yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Kişisel Bilgiler</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Ad Soyad</Label>
                          <Input id="name" defaultValue="Ahmet Yılmaz" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">E-posta Adresi</Label>
                          <Input id="email" type="email" defaultValue="ahmet@ornek.com" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon Numarası</Label>
                          <Input id="phone" defaultValue="+90 555 123 4567" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Rol</Label>
                          <Select defaultValue="admin">
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Bir rol seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Yönetici</SelectItem>
                              <SelectItem value="manager">Muhasebe Müdürü</SelectItem>
                              <SelectItem value="accountant">Muhasebeci</SelectItem>
                              <SelectItem value="employee">Çalışan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Şirket Bilgileri</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Şirket Adı</Label>
                          <Input id="company_name" defaultValue="Örnek Şirket Ltd. Şti." />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tax_id">Vergi / TC Kimlik No</Label>
                          <Input id="tax_id" defaultValue="1234567890" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company_address">Şirket Adresi</Label>
                        <Textarea id="company_address" rows={3} defaultValue="İstanbul, Kadıköy, Örnek Mah. 123 Sok. No: 45 D: 6" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Güvenlik Ayarları</CardTitle>
                    <CardDescription>
                      Hesap güvenlik ayarlarınızı yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Şifre Değiştirme</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password">Mevcut Şifre</Label>
                          <Input id="current_password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new_password">Yeni Şifre</Label>
                          <Input id="new_password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">Yeni Şifre (Tekrar)</Label>
                          <Input id="confirm_password" type="password" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">İki Faktörlü Doğrulama</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">İki Faktörlü Doğrulama</p>
                          <p className="text-sm text-neutral-500">Hesabınıza giriş yaparken ek güvenlik katmanı ekleyin</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Oturum Ayarları</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Otomatik Oturum Kapatma</p>
                          <p className="text-sm text-neutral-500">Belirli bir süre hareketsiz kaldığınızda oturumu otomatik kapat</p>
                        </div>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Bir süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 dakika</SelectItem>
                            <SelectItem value="30">30 dakika</SelectItem>
                            <SelectItem value="60">1 saat</SelectItem>
                            <SelectItem value="120">2 saat</SelectItem>
                            <SelectItem value="never">Asla</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Genel Ayarlar</CardTitle>
                    <CardDescription>
                      Sistem dili, tarih formatı ve diğer genel ayarları yapılandırın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Dil ve Bölge</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Sistem Dili</Label>
                          <Select defaultValue="tr">
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Dil seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tr">Türkçe</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="date_format">Tarih Formatı</Label>
                          <Select defaultValue="dd.mm.yyyy">
                            <SelectTrigger id="date_format">
                              <SelectValue placeholder="Format seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                              <SelectItem value="mm.dd.yyyy">MM.DD.YYYY</SelectItem>
                              <SelectItem value="yyyy.mm.dd">YYYY.MM.DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Arayüz Ayarları</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Koyu Tema</p>
                            <p className="text-sm text-neutral-500">Sistem arayüzünü koyu renkte görüntüle</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Kompakt Görünüm</p>
                            <p className="text-sm text-neutral-500">Daha fazla içeriği sığdırmak için daha sıkışık bir arayüz kullan</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Invoice Settings */}
              {activeTab === 'invoices' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fatura Ayarları</CardTitle>
                    <CardDescription>
                      Fatura numaralandırma, şablonlar ve diğer fatura ayarlarını yapılandırın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Fatura Numaralandırma</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="invoice_prefix">Fatura Öneki</Label>
                        <Input id="invoice_prefix" defaultValue="INV-" />
                        <p className="text-xs text-neutral-500">Örnek: INV-2023-001</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="next_invoice_number">Sonraki Fatura Numarası</Label>
                        <Input id="next_invoice_number" defaultValue="001" />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="auto_increment" defaultChecked />
                        <label
                          htmlFor="auto_increment"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fatura numaralarını otomatik artır
                        </label>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Fatura Şablonu</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="invoice_template">Varsayılan Şablon</Label>
                        <Select defaultValue="modern">
                          <SelectTrigger id="invoice_template">
                            <SelectValue placeholder="Şablon seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Klasik</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="professional">Profesyonel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="invoice_notes">Varsayılan Fatura Notu</Label>
                        <Textarea 
                          id="invoice_notes" 
                          rows={3} 
                          defaultValue="Ödemeleriniz için teşekkür ederiz. Ödeme vadesi fatura tarihinden itibaren 15 gündür." 
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">E-Fatura Ayarları</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Otomatik E-posta Gönderimi</p>
                          <p className="text-sm text-neutral-500">Fatura oluşturulduğunda otomatik olarak e-posta ile gönder</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">PDF Oluşturma</p>
                          <p className="text-sm text-neutral-500">Tüm faturaların otomatik olarak PDF kopyalarını oluştur</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Currency Settings */}
              {activeTab === 'currency' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Para Birimi ve Vergi Ayarları</CardTitle>
                    <CardDescription>
                      Varsayılan para birimi, vergi oranları ve ilgili ayarları yapılandırın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Para Birimi Ayarları</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="default_currency">Varsayılan Para Birimi</Label>
                        <Select defaultValue="1">
                          <SelectTrigger id="default_currency">
                            <SelectValue placeholder="Para birimi seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies ? currencies.map((currency: any) => (
                              <SelectItem key={currency.id} value={currency.id.toString()}>
                                {currency.code} - {currency.name} ({currency.symbol})
                              </SelectItem>
                            )) : (
                              <>
                                <SelectItem value="1">TRY - Türk Lirası (₺)</SelectItem>
                                <SelectItem value="2">USD - Amerikan Doları ($)</SelectItem>
                                <SelectItem value="3">EUR - Euro (€)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency_format">Para Birimi Formatı</Label>
                        <Select defaultValue="symbol">
                          <SelectTrigger id="currency_format">
                            <SelectValue placeholder="Format seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="symbol">Sembol ile göster (₺)</SelectItem>
                            <SelectItem value="code">Kod ile göster (TRY)</SelectItem>
                            <SelectItem value="both">İkisini de göster (₺ TRY)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Vergi Ayarları</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="default_tax_rate">Varsayılan KDV Oranı (%)</Label>
                        <Input id="default_tax_rate" type="number" defaultValue="18" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Diğer KDV Oranları (%)</Label>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax_rate_1" defaultChecked />
                            <label htmlFor="tax_rate_1" className="text-sm">1%</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax_rate_8" defaultChecked />
                            <label htmlFor="tax_rate_8" className="text-sm">8%</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax_rate_10" />
                            <label htmlFor="tax_rate_10" className="text-sm">10%</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax_rate_18" defaultChecked />
                            <label htmlFor="tax_rate_18" className="text-sm">18%</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tax_rate_20" />
                            <label htmlFor="tax_rate_20" className="text-sm">20%</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Fiyatlara KDV Dahil</p>
                          <p className="text-sm text-neutral-500">Varsayılan olarak fiyatları KDV dahil göster</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Yedekleme ve Veri Ayarları</CardTitle>
                    <CardDescription>
                      Veri yedekleme, içe aktarma ve dışa aktarma işlemlerini yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Otomatik Yedekleme</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Otomatik Yedekleme</p>
                          <p className="text-sm text-neutral-500">Belirlediğiniz aralıklarla verileri otomatik olarak yedekle</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup_frequency">Yedekleme Sıklığı</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger id="backup_frequency">
                            <SelectValue placeholder="Sıklık seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Günlük</SelectItem>
                            <SelectItem value="weekly">Haftalık</SelectItem>
                            <SelectItem value="monthly">Aylık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Manuel Yedekleme ve Geri Yükleme</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline">
                          <span className="flex items-center">
                            <FileDown className="mr-2 h-4 w-4" />
                            Verileri Dışa Aktar
                          </span>
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline">
                            Yedekten Geri Yükle
                          </Button>
                          <Input id="backup_file" type="file" className="hidden" />
                          <Label htmlFor="backup_file" className="cursor-pointer text-sm text-primary">
                            Dosya Seç
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Veri Temizleme</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="data_retention">Veri Saklama Süresi</Label>
                        <Select defaultValue="indefinite">
                          <SelectTrigger id="data_retention">
                            <SelectValue placeholder="Süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1year">1 Yıl</SelectItem>
                            <SelectItem value="2years">2 Yıl</SelectItem>
                            <SelectItem value="5years">5 Yıl</SelectItem>
                            <SelectItem value="indefinite">Süresiz</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-neutral-500">Belirtilen süreden eski veriler otomatik olarak arşivlenir</p>
                      </div>
                      
                      <Button variant="destructive" size="sm">
                        Eski Verileri Arşivle
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bildirim Ayarları</CardTitle>
                    <CardDescription>
                      Sistem bildirimleri ve hatırlatıcıları yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">E-posta Bildirimleri</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Fatura Bildirimleri</p>
                          <p className="text-sm text-neutral-500">Yeni fatura oluşturulduğunda bildirim al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ödeme Bildirimleri</p>
                          <p className="text-sm text-neutral-500">Yeni ödeme alındığında bildirim al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Vade Hatırlatıcıları</p>
                          <p className="text-sm text-neutral-500">Vadesi yaklaşan veya geçen faturalar için hatırlatıcı al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Sistem Bildirimleri</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Stok Uyarıları</p>
                          <p className="text-sm text-neutral-500">Düşük stok seviyesi durumunda bildirim al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Bütçe Uyarıları</p>
                          <p className="text-sm text-neutral-500">Bütçe limitlerine yaklaşıldığında bildirim al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Vergi Bildirimleri</p>
                          <p className="text-sm text-neutral-500">Yaklaşan vergi beyanname ve ödeme tarihleri için hatırlatma al</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Bildirim Zamanları</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notification_days">Vade Hatırlatma Günü</Label>
                        <Select defaultValue="3">
                          <SelectTrigger id="notification_days">
                            <SelectValue placeholder="Gün seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 gün önce</SelectItem>
                            <SelectItem value="3">3 gün önce</SelectItem>
                            <SelectItem value="5">5 gün önce</SelectItem>
                            <SelectItem value="7">7 gün önce</SelectItem>
                            <SelectItem value="14">14 gün önce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notification_time">Bildirim Saati</Label>
                        <Input id="notification_time" type="time" defaultValue="09:00" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
