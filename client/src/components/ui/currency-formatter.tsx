interface CurrencyFormatterProps {
  amount: number;
  currency?: string;
  locale?: string;
}

const CurrencyFormatter = ({ 
  amount, 
  currency = "TRY", 
  locale = "tr-TR" 
}: CurrencyFormatterProps) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return <span>{formatter.format(amount)}</span>;
};

export default CurrencyFormatter;
