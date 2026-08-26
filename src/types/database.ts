// Hand-maintained types for the Supabase schema.
// Keep in sync with supabase/migrations/*.sql.

export type ReportCategory =
  | "theft"
  | "vandalism"
  | "suspicious"
  | "hazard"
  | "lost_found"
  | "other";

export type ReportStatus = "active" | "resolved" | "flagged" | "hidden";

export type NotificationType = "new_report_nearby" | "comment" | "upvote";

export type FlagReason =
  | "spam"
  | "harassment"
  | "false_info"
  | "targets_group"
  | "other";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  district: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  status: ReportStatus;
  photo_urls: string[];
  thumbnail_urls: string[];
  upvote_count: number;
  comment_count: number;
  flag_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Upvote {
  user_id: string;
  report_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  report_id: string | null;
  actor_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Flag {
  id: string;
  report_id: string;
  user_id: string;
  reason: FlagReason;
  created_at: string;
}

// Convenience shapes used across the UI.
export type ReportWithAuthor = Report & { author: Pick<Profile, "username" | "avatar_url"> };
