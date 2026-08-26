import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/categories";
import type { ReportCategory } from "@/types/database";

export function CategoryBadge({
  category,
  label,
  className,
  showIcon = true,
}: {
  category: ReportCategory;
  label: string;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground",
        className,
      )}
    >
      {showIcon && <Icon className="size-3" />}
      {label}
    </span>
  );
}
