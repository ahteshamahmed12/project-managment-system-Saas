import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
      <div className="mb-4 rounded-full bg-orange-100 p-4">
        <Icon className="h-8 w-8 text-orange-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
