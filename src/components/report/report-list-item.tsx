import { ChevronRight, ArrowBigUp, MessageSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CategoryBadge } from "@/components/report/category-badge";
import { timeAgo } from "@/lib/format";
import type { MapReport } from "@/lib/data/reports";

export async function ReportListItem({
  report,
  locale,
}: {
  report: MapReport;
  locale: string;
}) {
  const t = await getTranslations("categories");

  return (
    <Link
      href={`/report/${report.id}`}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-hover"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <CategoryBadge category={report.category} label={t(report.category)} />
        <p className="line-clamp-1 text-sm font-medium">{report.title}</p>
        {report.address && (
          <p className="line-clamp-1 text-xs text-text-muted">
            {report.address}
          </p>
        )}
        <p className="flex items-center gap-2 text-[11px] text-text-muted">
          <span>{timeAgo(report.created_at, locale)}</span>
          <span className="inline-flex items-center gap-0.5">
            <ArrowBigUp className="size-3" />
            {report.upvote_count}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MessageSquare className="size-3" />
            {report.comment_count}
          </span>
        </p>
      </div>
      <ChevronRight className="mt-0.5 size-4 shrink-0 text-text-muted" />
    </Link>
  );
}
