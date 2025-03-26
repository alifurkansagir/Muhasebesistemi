import { ArrowUp, ArrowDown } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    text?: string;
    isPositive?: boolean;
  };
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  borderClass: string;
}

const SummaryCard = ({
  title,
  value,
  change,
  icon,
  iconBgClass,
  iconTextClass,
  borderClass,
}: SummaryCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${borderClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-neutral-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-neutral-700">{value}</p>
          {change && (
            <p className={`text-xs flex items-center mt-1 ${change.isPositive ? "text-[#107C10]" : "text-[#D13438]"}`}>
              {change.isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {change.value}% {change.text || ""}
            </p>
          )}
        </div>
        <div className={`${iconBgClass} p-2 rounded-md`}>
          <div className={`h-6 w-6 ${iconTextClass}`}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
