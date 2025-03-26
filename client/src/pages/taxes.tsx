import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileDown, 
  Calendar,
  FileText,
  Printer,
  Calculator,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import CurrencyFormatter from "@/components/ui/currency-formatter";

// Mock tax data
const taxTypes = [
  { 
    id: 1, 
    name: "KDV-1", 
    description: "Katma Değer Vergisi 1", 
    dueDate: new Date(2023, 6, 25), 
    amount: 8400,
    isPaid: false,
    period: "Haziran 2023"
  },
  { 
    id: 2, 
    name: "Gelir Vergisi", 
    description: "Gelir Vergisi Beyannamesi", 
    dueDate: new Date(2023, 6, 28), 
    amount: 12500,
    isPaid: false,
    period: "2. Çeyrek 2023"
  },
  { 
    id: 3, 
    name: "SGK", 
    description: "Sosyal Güvenlik Primi", 
    dueDate: new Date(2023, 6, 15), 
    amount: 3800,
    isPaid: true,
    period: "Haziran 2023"
  },
  { 
    id: 4, 
    name: "Muhtasar", 
    description: "Muhtasar ve Prim Hizmet Beyannamesi", 
    dueDate: new Date(2023, 6, 26), 
    amount: 6200,
    isPaid: false,
    period: "Haziran 2023"
  },
  { 
    id: 5, 
    name: "Damga Vergisi", 
    description: "Damga Vergisi", 
    dueDate: new Date(2023, 6, 23), 
    amount: 820,
    isPaid: false,
    period: "Haziran 2023"
  }
];

// Tax calculation examples
const taxCalculations = [
  { 
    id: 1, 
    name: "KDV Hesaplama", 
    description: "Satış tutarı üzerinden KDV hesaplama"
  },
  { 
    id: 2, 
    name: "Gelir Vergisi Hesaplama", 
    description: "Gelir dilimine göre gelir vergisi hesaplama"
  },
  { 
    id: 3, 
    name: "Kurumlar Vergisi Hesaplama", 
    description: "Kurum kazancı üzerinden kurumlar vergisi hesaplama"
  },
  { 
    id: 4, 
    name: "SGK Primi Hesaplama", 
    description: "İşçi ve işveren SGK primi hesaplama"
  }
];

const Taxes = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  
  const { toast } = useToast();
  
  // Calculate days until due
  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleTaxPay = (taxId: number) => {
    toast({
      title: "Ödeme Onaylandı",
      description: "Vergi ödemesi işlemi başlatıldı",
    });
  };
  
  const handleTaxReport = () => {
    toast({
      title: "Rapor oluşturuluyor",
      description: "Vergi raporu hazırlanıyor, lütfen bekleyin...",
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Rapor hazır",
        description: "Vergi raporu başarıyla oluşturuldu",
      });
    }, 1500);
  };
  
  const handleCalculator = (calculatorId: number) => {
    toast({
      title: "Hesaplama Aracı",
      description: "Hesaplama aracı açılıyor...",
    });
  };

  return (
    <>
      <Header 
        title="Vergi Raporları ve Hesaplamaları" 
        subtitle="Vergi beyannamelerini, ödemelerini ve hesaplamalarını yönet" 
        showNewButton={false}
      />
      
      <main className="flex-1 overflow-y-auto bg-[#FAF9F8] pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Vergi Raporu</CardTitle>
              <CardDescription>
                Vergi raporlarını görüntülemek için tarih aralığı ve diğer filtreleri seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Dönem</label>
                  <Select 
                    value={selectedPeriod} 
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dönem seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Aylık</SelectItem>
                      <SelectItem value="quarter">3 Aylık</SelectItem>
                      <SelectItem value="year">Yıllık</SelectItem>
                      <SelectItem value="custom">Özel Aralık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Tarih Aralığı</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="h-4 w-4 mr-2 opacity-50" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                              {format(dateRange.to, "dd.MM.yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd.MM.yyyy")
                          )
                        ) : (
                          "Tarih aralığı seçin"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange as any}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Vergi Türü</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Vergi türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Vergiler</SelectItem>
                      <SelectItem value="kdv">KDV</SelectItem>
                      <SelectItem value="income">Gelir Vergisi</SelectItem>
                      <SelectItem value="withholding">Muhtasar</SelectItem>
                      <SelectItem value="sgk">SGK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleTaxReport}
                    className="w-full bg-[#0078D4] hover:bg-[#005A9E]"
                  >
                    Raporu Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Report Actions */}
          <div className="flex justify-end mb-6 gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Yazdır
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileDown className="h-4 w-4" />
              Excel'e Aktar
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-4 w-4" />
              PDF İndir
            </Button>
          </div>
          
          {/* Upcoming Tax Payments */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Yaklaşan Vergi Ödemeleri</CardTitle>
              <CardDescription>
                Yaklaşan vergi beyanname ve ödeme tarihleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxTypes
                  .filter(tax => !tax.isPaid)
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .map(tax => {
                    const daysUntil = getDaysUntilDue(tax.dueDate);
                    const isUrgent = daysUntil <= 3;
                    const isNear = daysUntil <= 7;
                    
                    return (
                      <div key={tax.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{tax.name}</h3>
                            <p className="text-sm text-neutral-500">{tax.description}</p>
                            <p className="text-sm mt-1">
                              <span className="text-neutral-600">Dönem:</span> {tax.period}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg"><CurrencyFormatter amount={tax.amount} /></p>
                            <p className="text-sm text-neutral-500">Son Ödeme: {format(tax.dueDate, "dd.MM.yyyy")}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={isUrgent ? "text-[#D13438]" : isNear ? "text-[#FFB900]" : "text-neutral-600"}>
                              {daysUntil > 0 ? `${daysUntil} gün kaldı` : "Bugün son gün!"}
                            </span>
                            <span>Son ödeme tarihine</span>
                          </div>
                          <Progress 
                            value={Math.min(100, 100 - (daysUntil / 30) * 100)} 
                            className={`h-2 ${
                              isUrgent ? "bg-[#D13438]/20" : 
                              isNear ? "bg-[#FFB900]/20" : 
                              "bg-neutral-100"}`}
                            indicatorClassName={
                              isUrgent ? "bg-[#D13438]" : 
                              isNear ? "bg-[#FFB900]" : 
                              "bg-[#0078D4]"
                            }
                          />
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                          >
                            Detayları Gör
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleTaxPay(tax.id)}
                            className="bg-[#0078D4] hover:bg-[#005A9E]"
                          >
                            Öde
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                
                {taxTypes.filter(tax => !tax.isPaid).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">Yaklaşan vergi ödemesi bulunmuyor.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tax Calculators */}
          <Card>
            <CardHeader>
              <CardTitle>Vergi Hesaplama Araçları</CardTitle>
              <CardDescription>
                Çeşitli vergi hesaplamalarını yapabileceğiniz araçlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxCalculations.map(calculator => (
                  <div 
                    key={calculator.id} 
                    className="border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={() => handleCalculator(calculator.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-4 bg-[#0078D4]/10 w-10 h-10 rounded-full flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-[#0078D4]" />
                      </div>
                      <div>
                        <h3 className="font-medium">{calculator.name}</h3>
                        <p className="text-sm text-neutral-500">{calculator.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Taxes;
