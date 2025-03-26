import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "completed" | "pending" | "cancelled" | "draft" | "sent" | "paid" | "overdue";

interface StatusBadgeProps {
  status: StatusType;
  size?: "default" | "sm";
}

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  completed: { label: "Tamamlandı", classes: "bg-green-100 text-green-800" },
  pending: { label: "Beklemede", classes: "bg-yellow-100 text-yellow-800" },
  cancelled: { label: "İptal Edildi", classes: "bg-red-100 text-red-800" },
  draft: { label: "Taslak", classes: "bg-gray-100 text-gray-800" },
  sent: { label: "Gönderildi", classes: "bg-blue-100 text-blue-800" },
  paid: { label: "Ödendi", classes: "bg-green-100 text-green-800" },
  overdue: { label: "Gecikmiş", classes: "bg-red-100 text-red-800" },
};

const StatusBadge = ({ status, size = "default" }: StatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, classes: "bg-gray-100 text-gray-800" };
  
  return (
    <Badge 
      className={cn(
        config.classes,
        "rounded-full font-normal border-0",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1"
      )}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
