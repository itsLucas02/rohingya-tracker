"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom sheet with two snap states (peek / expanded). Tapping the
 * grabber toggles between them. Server-rendered content is passed as children.
 */
export function BottomSheet({
  header,
  children,
}: {
  header?: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "glass fixed inset-x-0 bottom-16 z-30 flex flex-col rounded-t-2xl shadow-lg transition-[height] duration-300 ease-out lg:hidden",
        expanded ? "h-[70vh]" : "h-44",
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col items-center gap-2 pt-2 pb-1"
        aria-label="Toggle panel"
      >
        <span className="h-1 w-10 rounded-full bg-border" />
        {header}
      </button>
      <div className="flex-1 divide-y divide-border overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
