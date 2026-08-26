"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth";

const createSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(1).max(4000),
  category: z.enum([
    "theft",
    "vandalism",
    "suspicious",
    "hazard",
    "lost_found",
    "other",
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(300).optional(),
  photoUrls: z.array(z.string().url()).max(3).default([]),
  thumbnailUrls: z.array(z.string().url()).max(3).default([]),
});

export type CreateReportInput = z.input<typeof createSchema>;

export async function createReport(input: CreateReportInput) {
  const user = await getUser();
  if (!user) return { error: "You must be logged in." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form and try again." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address ?? null,
      photo_urls: parsed.data.photoUrls,
      thumbnail_urls: parsed.data.thumbnailUrls,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Could not create the report." };

  revalidatePath("/");
  revalidatePath("/board");
  return { id: data.id as string };
}

export async function toggleUpvote(reportId: string) {
  const user = await getUser();
  if (!user) return { error: "auth" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("upvotes")
    .select("report_id")
    .eq("report_id", reportId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("upvotes")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("upvotes").insert({ report_id: reportId, user_id: user.id });
  }

  revalidatePath(`/report/${reportId}`);
  return { upvoted: !existing };
}

export async function addComment(reportId: string, content: string) {
  const user = await getUser();
  if (!user) return { error: "auth" };
  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 2000) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .insert({ report_id: reportId, user_id: user.id, content: trimmed });
  if (error) return { error: "failed" };

  revalidatePath(`/report/${reportId}`);
  return { ok: true };
}

const flagReasons = [
  "spam",
  "harassment",
  "false_info",
  "targets_group",
  "other",
] as const;

export async function flagReport(reportId: string, reason: string) {
  const user = await getUser();
  if (!user) return { error: "auth" };
  const parsed = z.enum(flagReasons).safeParse(reason);
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("flags")
    .insert({ report_id: reportId, user_id: user.id, reason: parsed.data });
  // Ignore unique-violation (already flagged) — treat as success.
  if (error && !error.message.includes("duplicate")) return { error: "failed" };

  revalidatePath(`/report/${reportId}`);
  return { ok: true };
}
