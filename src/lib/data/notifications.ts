import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types/database";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  report_id: string | null;
  read: boolean;
  created_at: string;
  actor: { username: string } | null;
  report: { title: string } | null;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select(
      "id,type,report_id,read,created_at,actor:profiles!notifications_actor_id_fkey(username),report:reports(title)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((n) => ({
    ...n,
    actor: Array.isArray(n.actor) ? (n.actor[0] ?? null) : n.actor,
    report: Array.isArray(n.report) ? (n.report[0] ?? null) : n.report,
  })) as NotificationItem[];
}

// Per-request cache: this is called from the header on every render, and
// also (soon) inside a Suspense boundary. React.cache dedupes both callers.
// The query itself is now an index-only scan thanks to the partial index
// notifications_unread_partial_idx (migration 002).
export const getUnreadCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "estimated", head: true })
    .eq("read", false);
  return count ?? 0;
});
