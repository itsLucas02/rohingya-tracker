import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Report, ReportCategory } from "@/types/database";

export type MapReport = Pick<
  Report,
  | "id"
  | "title"
  | "category"
  | "latitude"
  | "longitude"
  | "address"
  | "created_at"
  | "upvote_count"
  | "comment_count"
  | "thumbnail_urls"
>;

const MAP_FIELDS =
  "id,title,category,latitude,longitude,address,created_at,upvote_count,comment_count,thumbnail_urls";

// Cross-request unstable_cache would be ideal but it disallows reading cookies
// (which createClient() needs for the Supabase auth cookie). React.cache still
// dedupes duplicate calls within a single request.
export const getMapReports = cache(async (): Promise<MapReport[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(MAP_FIELDS)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) return [];
  return (data ?? []) as MapReport[];
});

export type BoardSort = "newest" | "trending";

export interface BoardFilters {
  sort?: BoardSort;
  category?: ReportCategory;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface BoardReport extends MapReport {
  description: string;
  author: { username: string; avatar_url: string | null } | null;
}

export async function getBoardReports(
  filters: BoardFilters = {},
): Promise<BoardReport[]> {
  const { sort = "newest", category, q, limit = 20, offset = 0 } = filters;
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select(
      `${MAP_FIELDS},description,author:profiles!reports_user_id_fkey(username,avatar_url)`,
    )
    .eq("status", "active");

  if (category) query = query.eq("category", category);
  if (q && q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(`title.ilike.%${term}%,address.ilike.%${term}%`);
  }

  query =
    sort === "trending"
      ? query.order("upvote_count", { ascending: false }).order("created_at", {
          ascending: false,
        })
      : query.order("created_at", { ascending: false });

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) return [];

  return (data ?? []).map((r) => ({
    ...r,
    author: Array.isArray(r.author) ? (r.author[0] ?? null) : r.author,
  })) as BoardReport[];
}

export const getReportById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      `*,author:profiles!reports_user_id_fkey(username,avatar_url)`,
    )
    .eq("id", id)
    .single();

  if (!data) return null;
  return {
    ...data,
    author: Array.isArray(data.author) ? (data.author[0] ?? null) : data.author,
  };
});

export interface CommentWithAuthor {
  id: string;
  content: string;
  created_at: string;
  author: { username: string; avatar_url: string | null } | null;
}

export const getComments = cache(
  async (reportId: string): Promise<CommentWithAuthor[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("comments")
      .select("id,content,created_at,author:profiles(username,avatar_url)")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    return (data ?? []).map((c) => ({
      ...c,
      author: Array.isArray(c.author) ? (c.author[0] ?? null) : c.author,
    })) as CommentWithAuthor[];
  },
);

export const hasUpvoted = cache(
  async (reportId: string, userId: string): Promise<boolean> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("upvotes")
      .select("report_id")
      .eq("report_id", reportId)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  },
);

export interface BoardStats {
  active: number;
  total: number;
  resolvedThisWeek: number;
}

export async function getUserReports(userId: string): Promise<MapReport[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(MAP_FIELDS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as MapReport[];
}

// Estimated counts (reltuples-based) instead of exact count(*): no full scan,
// and the board's three "stats" tiles don't need to be precise. Also wrapped
// in React.cache so it never fires twice in the same request.
export const getBoardStats = cache(async (): Promise<BoardStats> => {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const [active, total, resolved] = await Promise.all([
    supabase
      .from("reports")
      .select("id", { count: "estimated", head: true })
      .eq("status", "active"),
    supabase.from("reports").select("id", { count: "estimated", head: true }),
    supabase
      .from("reports")
      .select("id", { count: "estimated", head: true })
      .eq("status", "resolved")
      .gte("updated_at", weekAgo),
  ]);

  return {
    active: active.count ?? 0,
    total: total.count ?? 0,
    resolvedThisWeek: resolved.count ?? 0,
  };
});
