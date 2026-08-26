import { Plus } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMapReports } from "@/lib/data/reports";
import { ReportMap } from "@/components/map/report-map";
import { ReportListItem } from "@/components/report/report-list-item";
import { GlassPanel } from "@/components/layout/glass-panel";
import { BottomSheet } from "@/components/layout/bottom-sheet";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [reports, t] = await Promise.all([
    getMapReports(),
    getTranslations(),
  ]);

  const recent = reports.slice(0, 30);
  const list = recent.map((r) => (
    <ReportListItem key={r.id} report={r} locale={locale} />
  ));
  // Trim the payload sent into the client Map — it only needs the geometry +
  // display bits, not description/author/upvote counts. Rule: server-serialization.
  const mapPoints = reports.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    latitude: r.latitude,
    longitude: r.longitude,
    address: r.address,
    created_at: r.created_at,
    upvote_count: r.upvote_count,
    comment_count: r.comment_count,
    thumbnail_urls: r.thumbnail_urls?.slice(0, 1) ?? [],
  }));
  const empty = (
    <p className="px-4 py-8 text-center text-sm text-text-muted">
      {t("board.empty")}
    </p>
  );

  return (
    <div className="relative min-h-0 w-full flex-1">
      <div className="absolute inset-0">
        <ReportMap reports={mapPoints} />
      </div>

      {/* Desktop floating panel */}
      <GlassPanel
        elevated
        className="absolute bottom-4 left-4 top-4 z-10 hidden w-80 flex-col overflow-hidden p-0 lg:flex"
      >
        <div className="border-b border-border px-4 py-3">
          <p className="text-[11px] tracking-widest text-text-muted">
            {t("app.tagline")}
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {t("map.activeReports", { count: reports.length })}
          </p>
        </div>
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {list.length ? list : empty}
        </div>
      </GlassPanel>

      {/* Desktop report FAB */}
      <Link
        href="/report/new"
        className="absolute bottom-6 right-6 z-10 hidden size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
        aria-label={t("report.new")}
      >
        <Plus className="size-6" />
      </Link>

      {/* Mobile bottom sheet */}
      <BottomSheet
        header={
          <span className="text-sm font-semibold">
            {t("map.activeReports", { count: reports.length })}
          </span>
        }
      >
        {list.length ? list : empty}
      </BottomSheet>
    </div>
  );
}
