import {
  Wallet,
  SprayCan,
  Eye,
  TriangleAlert,
  PackageSearch,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReportCategory } from "@/types/database";

export const CATEGORY_ORDER: ReportCategory[] = [
  "theft",
  "vandalism",
  "suspicious",
  "hazard",
  "lost_found",
  "other",
];

export const CATEGORY_ICONS: Record<ReportCategory, LucideIcon> = {
  theft: Wallet,
  vandalism: SprayCan,
  suspicious: Eye,
  hazard: TriangleAlert,
  lost_found: PackageSearch,
  other: Info,
};

// i18n keys live under "categories.<key>" in messages/*.json.
export function categoryLabelKey(category: ReportCategory) {
  return `categories.${category}` as const;
}
