import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/lib/supabase/auth";
import { getNotifications } from "@/lib/data/notifications";
import { timeAgo } from "@/lib/format";
import { MarkReadOnMount } from "@/components/layout/mark-read-on-mount";
import { cn } from "@/lib/utils";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getUser())) redirect("/auth/login");

  const [items, t] = await Promise.all([
    getNotifications(),
    getTranslations("notifications"),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24">
      <MarkReadOnMount />
      <h1 className="text-lg font-semibold">{t("title")}</h1>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">{t("empty")}</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((n) => {
            const actor = n.actor?.username ?? "Someone";
            const body =
              n.type === "new_report_nearby"
                ? t("new_report_nearby")
                : t(n.type, { actor });
            const inner = (
              <div
                className={cn(
                  "flex items-start gap-3 py-3",
                  !n.read && "font-medium",
                )}
              >
                {!n.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-destructive" />
                )}
                <div className={cn("min-w-0", n.read && "pl-5")}>
                  <p className="text-sm">{body}</p>
                  {n.report?.title && (
                    <p className="line-clamp-1 text-xs text-text-muted">
                      {n.report.title}
                    </p>
                  )}
                  <p className="text-[11px] text-text-muted">
                    {timeAgo(n.created_at, locale)}
                  </p>
                </div>
              </div>
            );
            return n.report_id ? (
              <Link key={n.id} href={`/report/${n.report_id}`} className="block hover:bg-hover">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
