"use client";

import { useState, useTransition } from "react";
import { ArrowBigUp } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toggleUpvote } from "@/lib/actions/reports";
import { cn } from "@/lib/utils";

export function UpvoteButton({
  reportId,
  count,
  initialUpvoted,
  authed,
}: {
  reportId: string;
  count: number;
  initialUpvoted: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [n, setN] = useState(count);
  const [pending, start] = useTransition();

  function onClick() {
    if (!authed) return router.push("/auth/login");
    // optimistic
    setUpvoted((v) => !v);
    setN((c) => c + (upvoted ? -1 : 1));
    start(async () => {
      const res = await toggleUpvote(reportId);
      if (res && "upvoted" in res && typeof res.upvoted === "boolean") {
        setUpvoted(res.upvoted);
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        upvoted
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-foreground hover:bg-selected",
      )}
    >
      <ArrowBigUp className="size-4" />
      {n}
    </button>
  );
}
