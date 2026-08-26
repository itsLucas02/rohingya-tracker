"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { flagReport } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const REASONS = [
  "spam",
  "harassment",
  "false_info",
  "targets_group",
  "other",
] as const;

const REASON_LABELS: Record<(typeof REASONS)[number], string> = {
  spam: "Spam",
  harassment: "Harassment",
  false_info: "False information",
  targets_group: "Targets a group (ethnicity/religion/nationality)",
  other: "Other",
};

export function FlagButton({
  reportId,
  authed,
}: {
  reportId: string;
  authed: boolean;
}) {
  const t = useTranslations("report");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function submit(reason: string) {
    start(async () => {
      const res = await flagReport(reportId, reason);
      if (res?.error === "auth") return router.push("/auth/login");
      toast.success("Thank you. Our team will review this report.");
      setOpen(false);
    });
  }

  if (!authed) {
    return (
      <Button variant="ghost" size="sm" onClick={() => router.push("/auth/login")}>
        <Flag className="size-4" />
        {t("flag")}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="size-4" />
          {t("flag")}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-elevated">
        <DialogHeader>
          <DialogTitle>{t("flag")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {REASONS.map((r) => (
            <button
              key={r}
              disabled={pending}
              onClick={() => submit(r)}
              className="rounded-md px-3 py-2 text-left text-sm hover:bg-hover"
            >
              {REASON_LABELS[r]}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
