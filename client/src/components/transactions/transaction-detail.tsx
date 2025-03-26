import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/ui/status-badge";
import CurrencyFormatter from "@/components/ui/currency-formatter";
import DateFormatter from "@/components/ui/date-formatter";

interface TransactionDetailProps {
  transaction: any;
  getCategoryName: (categoryId: number) => string;
}

const TransactionDetail = ({
  transaction,
  getCategoryName,
}: TransactionDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            İşlem #{transaction.transactionNumber}
          </h2>
          <p className="text-sm text-neutral-500">
            <DateFormatter date={transaction.date} formatStr="dd MMMM yyyy" />
          </p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">İşlem Tipi</h3>
          <p className="font-medium">
            {transaction.type === "income" ? "Gelir" : "Gider"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Kategori</h3>
          <p>{getCategoryName(transaction.categoryId)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-neutral-500 mb-1">Açıklama</h3>
        <p>{transaction.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Tutar</h3>
          <p className={`text-xl font-bold ${
            transaction.type === 'income' ? 'text-[#107C10]' : 'text-[#D13438]'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            <CurrencyFormatter amount={transaction.amount} />
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Ödeme Yöntemi</h3>
          <p className="capitalize">
            {transaction.paymentMethod === 'cash' ? 'Nakit' : 
             transaction.paymentMethod === 'bank' ? 'Banka' : 
             transaction.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 
             transaction.paymentMethod}
          </p>
        </div>
      </div>

      {transaction.customerId && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Müşteri ID</h3>
          <p>{transaction.customerId}</p>
        </div>
      )}

      {transaction.supplierId && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Tedarikçi ID</h3>
          <p>{transaction.supplierId}</p>
        </div>
      )}

      {transaction.invoiceId && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Fatura ID</h3>
          <p>{transaction.invoiceId}</p>
        </div>
      )}

      {transaction.notes && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Notlar</h3>
          <p className="text-sm">{transaction.notes}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;
