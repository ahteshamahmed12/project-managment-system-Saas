import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  // Projects
  Active: "bg-green-100 text-green-700 border-green-200",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",

  // Users
  Inactive: "bg-gray-100 text-gray-700 border-gray-200",
  Suspended: "bg-red-100 text-red-700 border-red-200",

  // Tasks (future)
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Done: "bg-green-100 text-green-700 border-green-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 font-medium",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200",
      )}
    >
      {status}
    </Badge>
  );
}
