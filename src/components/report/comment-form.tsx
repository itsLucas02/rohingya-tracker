"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { addComment } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({
  reportId,
  authed,
}: {
  reportId: string;
  authed: boolean;
}) {
  const t = useTranslations("report");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();

  if (!authed) {
    return (
      <Button variant="outline" className="w-full" onClick={() => router.push("/auth/login")}>
        {t("writeComment")}
      </Button>
    );
  }

  function submit() {
    const content = value.trim();
    if (!content) return;
    start(async () => {
      const res = await addComment(reportId, content);
      if (res?.error) {
        toast.error(t("writeComment"));
        return;
      }
      setValue("");
    });
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("writeComment")}
        rows={2}
        maxLength={2000}
        className="flex-1"
      />
      <Button onClick={submit} disabled={pending || !value.trim()} size="icon">
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
