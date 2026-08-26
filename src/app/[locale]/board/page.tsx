import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getBoardReports,
  getBoardStats,
  type BoardSort,
} from "@/lib/data/reports";
import { ReportListItem } from "@/components/report/report-list-item";
import { BoardControls } from "@/components/board/board-controls";
import type { ReportCategory } from "@/types/database";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    sort?: string;
    category?: string;
    q?: string;
    limit?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const sort: BoardSort = sp.sort === "trending" ? "trending" : "newest";
  const category = sp.category as ReportCategory | undefined;
  const q = sp.q?.trim() || undefined;
  const limit = Math.min(Number(sp.limit) || 20, 100);

  const [reports, stats, t] = await Promise.all([
    getBoardReports({ sort, category, q, limit }),
    getBoardStats(),
    getTranslations(),
  ]);

  const statItems = [
    { value: stats.active, label: t("board.stats.active") },
    { value: stats.total, label: t("board.stats.total") },
    { value: stats.resolvedThisWeek, label: t("board.stats.resolved") },
  ];

  const nextParams = new URLSearchParams();
  nextParams.set("sort", sort);
  if (category) nextParams.set("category", category);
  if (q) nextParams.set("q", q);
  nextParams.set("limit", String(limit + 20));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      <h1 className="text-lg font-semibold">{t("board.title")}</h1>

      <div className="grid grid-cols-3 gap-4">
        {statItems.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-[11px] text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4">
        <BoardControls sort={sort} category={category} />
      </div>

      <div className="divide-y divide-border">
        {reports.length ? (
          reports.map((r) => (
            <ReportListItem key={r.id} report={r} locale={locale} />
          ))
        ) : (
          <p className="py-10 text-center text-sm text-text-muted">
            {t("board.empty")}
          </p>
        )}
      </div>

      {reports.length >= limit && (
        <div className="flex justify-center">
          <Link
            href={`/board?${nextParams.toString()}`}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-selected"
          >
            {t("board.loadMore")}
          </Link>
        </div>
      )}
    </div>
  );
}
