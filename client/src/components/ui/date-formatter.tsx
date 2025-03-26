import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DateFormatterProps {
  date: string | Date;
  formatStr?: string;
}

const DateFormatter = ({ date, formatStr = "dd MMM yyyy" }: DateFormatterProps) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return (
    <span>{format(dateObj, formatStr, { locale: tr })}</span>
  );
};

export default DateFormatter;
