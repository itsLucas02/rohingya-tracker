import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getReportById,
  getComments,
  hasUpvoted,
} from "@/lib/data/reports";
import { getUser } from "@/lib/supabase/auth";
import { timeAgo } from "@/lib/format";
import { CategoryBadge } from "@/components/report/category-badge";
import { UpvoteButton } from "@/components/report/upvote-button";
import { FlagButton } from "@/components/report/flag-button";
import { CommentForm } from "@/components/report/comment-form";
import { MiniMap } from "@/components/map/mini-map";
import type { ReportCategory } from "@/types/database";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Kick off every independent fetch immediately. getComments only needs `id`
  // (already known from the URL), and hasUpvoted only needs the user id — so
  // there is no reason to wait for getReportById to resolve first.
  const reportPromise = getReportById(id);
  const commentsPromise = getComments(id);
  const userPromise = getUser();
  const tPromise = getTranslations();
  const upvotedPromise = userPromise.then((u) =>
    u ? hasUpvoted(id, u.id) : false,
  );

  const [report, user, t, comments, upvoted] = await Promise.all([
    reportPromise,
    userPromise,
    tPromise,
    commentsPromise,
    upvotedPromise,
  ]);
  if (!report) notFound();

  const authed = !!user;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 pb-24">
      <Link
        href="/board"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("report.back")}
      </Link>

      <div className="flex items-center gap-2">
        <CategoryBadge
          category={report.category as ReportCategory}
          label={t(`categories.${report.category}`)}
        />
        {report.status === "active" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="size-2 rounded-full bg-status-live" />
            {t("report.active")}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{report.title}</h1>
        <p className="text-xs text-text-muted">
          {t("report.postedBy", { user: report.author?.username ?? "—" })} ·{" "}
          {timeAgo(report.created_at, locale)}
        </p>
      </div>

      {report.photo_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {report.photo_urls.map((url: string, i: number) => (
            <div
              key={i}
              className="relative aspect-video overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 320px"
              />
            </div>
          ))}
        </div>
      )}

      <MiniMap latitude={report.latitude} longitude={report.longitude} />
      {report.address && (
        <p className="text-sm text-text-secondary">{report.address}</p>
      )}

      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {report.description}
      </p>

      <div className="flex items-center gap-2 border-y border-border py-3">
        <UpvoteButton
          reportId={report.id}
          count={report.upvote_count}
          initialUpvoted={upvoted}
          authed={authed}
        />
        <span className="inline-flex items-center gap-1.5 px-2 text-sm text-text-secondary">
          <MessageSquare className="size-4" />
          {report.comment_count}
        </span>
        <div className="ml-auto">
          <FlagButton reportId={report.id} authed={authed} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
          {t("report.comments", { count: comments.length })}
        </h2>

        <div className="divide-y divide-border">
          {comments.map((c) => (
            <div key={c.id} className="py-3">
              <p className="text-xs text-text-muted">
                {c.author?.username ?? "—"} · {timeAgo(c.created_at, locale)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            </div>
          ))}
        </div>

        <CommentForm reportId={report.id} authed={authed} />
      </section>
    </div>
  );
}
