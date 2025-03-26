import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Edit, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import CurrencyFormatter from "@/components/ui/currency-formatter";
import DateFormatter from "@/components/ui/date-formatter";

interface InvoiceListProps {
  invoices: any[];
  isLoading: boolean;
  getEntityName: (id: number) => string;
  entityType: "customer" | "supplier";
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const InvoiceList = ({
  invoices,
  isLoading,
  getEntityName,
  entityType,
  onView,
  onEdit,
  onDelete,
}: InvoiceListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fatura No</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Vade</TableHead>
            <TableHead>{entityType === "customer" ? "Müşteri" : "Tedarikçi"}</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
            <TableHead className="text-right">Vergi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : invoices?.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  <DateFormatter date={invoice.issueDate} />
                </TableCell>
                <TableCell>
                  <DateFormatter date={invoice.dueDate} />
                </TableCell>
                <TableCell>
                  {entityType === "customer" 
                    ? (invoice.customerId ? getEntityName(invoice.customerId) : "-") 
                    : (invoice.supplierId ? getEntityName(invoice.supplierId) : "-")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <CurrencyFormatter amount={invoice.totalAmount} />
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyFormatter amount={invoice.taxAmount} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(invoice.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4 text-[#0078D4]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(invoice.id)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4 text-[#0078D4]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(invoice.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-[#D13438]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-neutral-500">
                Fatura bulunamadı
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceList;
