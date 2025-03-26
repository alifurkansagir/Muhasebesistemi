import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface TransactionListProps {
  transactions: any[];
  isLoading: boolean;
  getCategoryName: (categoryId: number) => string;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TransactionList = ({
  transactions,
  isLoading,
  getCategoryName,
  onView,
  onEdit,
  onDelete,
}: TransactionListProps) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşlem No</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Ödeme Yöntemi</TableHead>
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
            ) : transactions?.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                  <TableCell>
                    <DateFormatter date={transaction.date} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-[#107C10]' : 'text-[#D13438]'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    <CurrencyFormatter amount={transaction.amount} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {transaction.paymentMethod === 'cash' ? 'Nakit' : 
                       transaction.paymentMethod === 'bank' ? 'Banka' : 
                       transaction.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 
                       transaction.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4 text-[#0078D4]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4 text-[#0078D4]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
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
                  İşlem bulunamadı
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default TransactionList;
