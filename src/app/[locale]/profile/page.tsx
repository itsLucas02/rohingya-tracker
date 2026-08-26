import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getUser, getProfile } from "@/lib/supabase/auth";
import { getUserReports } from "@/lib/data/reports";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ReportListItem } from "@/components/report/report-list-item";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect("/auth/login");

  const [profile, t] = await Promise.all([
    getProfile(),
    getTranslations("board"),
  ]);
  if (!profile) redirect("/auth/login");

  const reports = await getUserReports(user.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {profile.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
          )}
          <AvatarFallback>
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">{profile.username}</h1>
          {profile.district && (
            <p className="text-sm text-text-muted">{profile.district}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="divide-y divide-border">
          {reports.length ? (
            reports.map((r) => (
              <ReportListItem key={r.id} report={r} locale={locale} />
            ))
          ) : (
            <p className="py-10 text-center text-sm text-text-muted">
              {t("empty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
