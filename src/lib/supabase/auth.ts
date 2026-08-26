import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "@/types/database";

// Cached per-request so multiple calls in one render don't refetch.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// On the shared self-hosted stack there is no global auth.users trigger, so the
// app creates its own profile row on first authenticated load (idempotent).
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  // Create it. Derive a unique-ish username from metadata or email.
  const meta = (user.user_metadata ?? {}) as {
    username?: string;
    avatar_url?: string;
  };
  const base =
    meta.username?.trim() ||
    user.email?.split("@")[0] ||
    `user_${user.id.slice(0, 8)}`;

  const attempts = [base, `${base}_${user.id.slice(0, 4)}`];
  for (const username of attempts) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: user.id, username, avatar_url: meta.avatar_url ?? null })
      .select("*")
      .single();
    if (!error && data) return data as Profile;
    // 23505 = unique_violation (username taken) — try the next candidate.
    if (error && error.code !== "23505") break;
  }

  // Fall back to reading whatever exists (e.g. created by a concurrent request).
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
});
