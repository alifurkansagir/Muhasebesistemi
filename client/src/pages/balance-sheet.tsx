import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/date-utils";
import { CHART_PERIODS } from "@/lib/constants";

// Balance sheet data interface
interface BalanceSheetData {
  assets: {
    type: string;
    name: string;
    amount: number;
  }[];
  liabilities: {
    type: string;
    name: string;
    amount: number;
  }[];
  equity: {
    type: string;
    name: string;
    amount: number;
  }[];
  assetTotal: number;
  liabilityTotal: number;
  equityTotal: number;
}

const BalanceSheet = () => {
  const [period, setPeriod] = useState("thisYear");
  
  // API endpoint'ten bilanço verilerini al
  const { data, isLoading } = useQuery<BalanceSheetData>({
    queryKey: ['/api/reports/balance-sheet', period],
    placeholderData: {
      assets: [],
      liabilities: [],
      equity: [],
      assetTotal: 0,
      liabilityTotal: 0,
      equityTotal: 0
    }
  });

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
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div>
            <CardTitle className="text-lg">Bilanço</CardTitle>
            <CardDescription>
              Finansal durum tablosu - {formatDate(new Date())}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dönem Seçin" />
              </SelectTrigger>
              <SelectContent>
                {CHART_PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => {
                if (data) {
                  import('@/lib/utils/pdf-export').then(({ generateBalanceSheetPdf, downloadPdf }) => {
                    const pdf = generateBalanceSheetPdf(
                      data, 
                      CHART_PERIODS.find(p => p.value === period)?.label || period,
                      { companyName: 'Şirketinizin Adı', taxId: '1234567890' }
                    );
                    downloadPdf(pdf, `bilanco-${period}.pdf`);
                  });
                }
              }}
            >
              <i className="fas fa-download mr-2"></i>
              PDF İndir
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader className="p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Finansal Durum Özeti</CardTitle>
            <div className="flex space-x-4">
              <div className="text-center">
                <p className="text-sm text-neutral-500">Toplam Varlıklar</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(data?.assetTotal || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-500">Toplam Kaynaklar</p>
                <p className="text-xl font-bold text-danger">{formatCurrency(data?.liabilityTotal || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-500">Toplam Özkaynaklar</p>
                <p className="text-xl font-bold text-success">{formatCurrency(data?.equityTotal || 0)}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Varlıklar</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Hesap</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium bg-neutral-100">
                    <TableCell>Dönen Varlıklar</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        data?.assets
                          .filter(a => a.type === 'current')
                          .reduce((sum, a) => sum + a.amount, 0) || 0
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {data?.assets
                    .filter(asset => asset.type === 'current')
                    .map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-8">{asset.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.amount)}</TableCell>
                      </TableRow>
                    ))
                  }
                  
                  <TableRow className="font-medium bg-neutral-100">
                    <TableCell>Duran Varlıklar</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        data?.assets
                          .filter(a => a.type === 'non-current')
                          .reduce((sum, a) => sum + a.amount, 0) || 0
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {data?.assets
                    .filter(asset => asset.type === 'non-current')
                    .map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-8">{asset.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.amount)}</TableCell>
                      </TableRow>
                    ))
                  }
                  
                  <TableRow className="font-bold">
                    <TableCell>Toplam Varlıklar</TableCell>
                    <TableCell className="text-right">{formatCurrency(data?.assetTotal || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {/* Liabilities and Equity */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Kaynaklar</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Hesap</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium bg-neutral-100">
                    <TableCell>Kısa Vadeli Yükümlülükler</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        data?.liabilities
                          .filter(l => l.type === 'current')
                          .reduce((sum, l) => sum + l.amount, 0) || 0
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {data?.liabilities
                    .filter(liability => liability.type === 'current')
                    .map((liability, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-8">{liability.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(liability.amount)}</TableCell>
                      </TableRow>
                    ))
                  }
                  
                  <TableRow className="font-medium bg-neutral-100">
                    <TableCell>Uzun Vadeli Yükümlülükler</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        data?.liabilities
                          .filter(l => l.type === 'non-current')
                          .reduce((sum, l) => sum + l.amount, 0) || 0
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {data?.liabilities
                    .filter(liability => liability.type === 'non-current')
                    .map((liability, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-8">{liability.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(liability.amount)}</TableCell>
                      </TableRow>
                    ))
                  }
                  
                  <TableRow className="font-medium bg-neutral-100">
                    <TableCell>Özkaynaklar</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(data?.equityTotal || 0)}
                    </TableCell>
                  </TableRow>
                  
                  {data?.equity.map((equity, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-8">{equity.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(equity.amount)}</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow className="font-bold">
                    <TableCell>Toplam Kaynaklar</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency((data?.liabilityTotal || 0) + (data?.equityTotal || 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Finansal Oranlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-medium mb-2">Likidite Oranları</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Cari Oran</TableCell>
                    <TableCell className="text-right font-medium">
                      {(data?.assets
                        .filter(a => a.type === 'current')
                        .reduce((sum, a) => sum + a.amount, 0) || 0) / 
                        (data?.liabilities
                        .filter(l => l.type === 'current')
                        .reduce((sum, l) => sum + l.amount, 0) || 1)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Asit-Test Oranı</TableCell>
                    <TableCell className="text-right font-medium">
                      {((data?.assets
                        .filter(a => a.type === 'current')
                        .reduce((sum, a) => sum + a.amount, 0) || 0) -
                        (data?.assets
                        .find(a => a.name === 'Stoklar')?.amount || 0)) / 
                        (data?.liabilities
                        .filter(l => l.type === 'current')
                        .reduce((sum, l) => sum + l.amount, 0) || 1)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-medium mb-2">Kaldıraç Oranları</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Borç/Varlık Oranı</TableCell>
                    <TableCell className="text-right font-medium">
                      {((data?.liabilityTotal || 0) / (data?.assetTotal || 1)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Borç/Özkaynak Oranı</TableCell>
                    <TableCell className="text-right font-medium">
                      {((data?.liabilityTotal || 0) / (data?.equityTotal || 1)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-medium mb-2">Karlılık Oranları</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Özkaynak Karlılığı (ROE)</TableCell>
                    <TableCell className="text-right font-medium">
                      {((data?.equity.find(e => e.name === 'Dönem Net Karı')?.amount || 0) / 
                        (data?.equityTotal || 1) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Varlık Karlılığı (ROA)</TableCell>
                    <TableCell className="text-right font-medium">
                      {((data?.equity.find(e => e.name === 'Dönem Net Karı')?.amount || 0) / 
                        (data?.assetTotal || 1) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BalanceSheet;
