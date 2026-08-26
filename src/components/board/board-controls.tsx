"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { ReportCategory } from "@/types/database";

export function BoardControls({
  sort,
  category,
}: {
  sort: string;
  category?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  // Marks the router.replace as a non-urgent update so the button flip is
  // instant while the RSC fetch happens in the background. rerender-transitions.
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams();
    if (key === "sort") {
      if (value) params.set("sort", value);
      if (category) params.set("category", category);
    } else {
      if (sort) params.set("sort", sort);
      if (value) params.set("category", value);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  const sorts = [
    { key: "newest", label: t("board.newest") },
    { key: "trending", label: t("board.trending") },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 transition-opacity",
        isPending && "opacity-70",
      )}
    >
      <div className="inline-flex rounded-lg bg-secondary p-0.5">
        {sorts.map((s) => (
          <button
            key={s.key}
            onClick={() => setParam("sort", s.key)}
            disabled={isPending}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              sort === s.key
                ? "bg-primary text-primary-foreground"
                : "text-text-secondary hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setParam("category", undefined)}
          disabled={isPending}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            !category
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-text-secondary hover:text-foreground",
          )}
        >
          All
        </button>
        {CATEGORY_ORDER.map((c: ReportCategory) => (
          <button
            key={c}
            onClick={() => setParam("category", c)}
            disabled={isPending}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              category === c
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-text-secondary hover:text-foreground",
            )}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
