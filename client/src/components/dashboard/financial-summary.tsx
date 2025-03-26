import { formatCurrency, formatPercentage } from "@/lib/utils/format-currency";
import { FinancialSummaryCardProps } from "@/lib/types";

const FinancialSummaryCard = ({ 
  title, 
  amount, 
  currency = "TRY", 
  percentChange, 
  icon, 
  iconColorClass, 
  amountColorClass 
}: FinancialSummaryCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
          <p className={`text-xl font-bold ${amountColorClass}`}>{formatCurrency(amount, currency)}</p>
        </div>
        <div className={`${iconColorClass} p-2 rounded`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
      </div>
      <div className="text-xs font-medium text-neutral-500">
        <span className={percentChange >= 0 ? "text-success" : "text-danger"}>
          <i className={`fas fa-arrow-${percentChange >= 0 ? 'up' : 'down'}`}></i> {formatPercentage(percentChange)}
        </span> geçen aya göre
      </div>
    </div>
  );
};

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpense: number;
  pendingInvoices: number;
  pendingPayments: number;
  currency?: string;
}

const FinancialSummary = ({
  totalIncome,
  totalExpense,
  pendingInvoices,
  pendingPayments,
  currency = "TRY"
}: FinancialSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <FinancialSummaryCard
        title="Toplam Gelir"
        amount={totalIncome}
        currency={currency}
        percentChange={12.4}
        icon="arrow-up"
        iconColorClass="bg-success bg-opacity-10 text-success"
        amountColorClass="text-success"
      />
      
      <FinancialSummaryCard
        title="Toplam Gider"
        amount={totalExpense}
        currency={currency}
        percentChange={8.2}
        icon="arrow-down"
        iconColorClass="bg-danger bg-opacity-10 text-danger"
        amountColorClass="text-danger"
      />
      
      <FinancialSummaryCard
        title="Alacaklar"
        amount={pendingInvoices}
        currency={currency}
        percentChange={-3.7}
        icon="wallet"
        iconColorClass="bg-primary bg-opacity-10 text-primary"
        amountColorClass="text-primary"
      />
      
      <FinancialSummaryCard
        title="Borçlar"
        amount={pendingPayments}
        currency={currency}
        percentChange={-5.3}
        icon="money-bill-wave"
        iconColorClass="bg-accent bg-opacity-10 text-accent"
        amountColorClass="text-neutral-600"
      />
    </div>
  );
};

export default FinancialSummary;
