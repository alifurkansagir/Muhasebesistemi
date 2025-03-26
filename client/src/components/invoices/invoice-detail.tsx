import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import StatusBadge from "@/components/ui/status-badge";
import CurrencyFormatter from "@/components/ui/currency-formatter";
import DateFormatter from "@/components/ui/date-formatter";

interface InvoiceDetailProps {
  invoice: any;
  getCustomerName: (id: number) => string;
  getSupplierName: (id: number) => string;
}

const InvoiceDetail = ({
  invoice,
  getCustomerName,
  getSupplierName,
}: InvoiceDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            Fatura #{invoice.invoiceNumber}
          </h2>
          <p className="text-sm text-neutral-500">
            <DateFormatter date={invoice.issueDate} formatStr="dd MMMM yyyy" />
          </p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">
            {invoice.type === "sales" ? "Müşteri" : "Tedarikçi"}
          </h3>
          <p className="font-medium">
            {invoice.type === "sales" 
              ? (invoice.customerId ? getCustomerName(invoice.customerId) : "-") 
              : (invoice.supplierId ? getSupplierName(invoice.supplierId) : "-")}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Fatura Tipi</h3>
          <p>{invoice.type === "sales" ? "Satış Faturası" : "Alış Faturası"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Fatura Tarihi</h3>
          <p><DateFormatter date={invoice.issueDate} /></p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Son Ödeme Tarihi</h3>
          <p><DateFormatter date={invoice.dueDate} /></p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Durum</h3>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Miktar</TableHead>
                <TableHead className="text-right">Birim Fiyat</TableHead>
                <TableHead className="text-right">KDV %</TableHead>
                <TableHead className="text-right">KDV Tutarı</TableHead>
                <TableHead className="text-right">Toplam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.length > 0 ? (
                invoice.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyFormatter amount={item.unitPrice} />
                    </TableCell>
                    <TableCell className="text-right">{item.taxRate}%</TableCell>
                    <TableCell className="text-right">
                      <CurrencyFormatter amount={item.taxAmount} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <CurrencyFormatter amount={item.totalAmount} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-neutral-500">
                    Fatura kalemi bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Ara Toplam:</span>
            <span className="font-medium">
              <CurrencyFormatter amount={invoice.totalAmount - invoice.taxAmount} />
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">KDV Toplam:</span>
            <span className="font-medium">
              <CurrencyFormatter amount={invoice.taxAmount} />
            </span>
          </div>
          <Separator />
          <div className="flex justify-between pt-1">
            <span className="font-medium">Genel Toplam:</span>
            <span className="font-bold text-lg">
              <CurrencyFormatter amount={invoice.totalAmount} />
            </span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Notlar</h3>
          <p className="text-sm p-3 bg-neutral-50 rounded-md">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
