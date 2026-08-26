"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function HeaderSearch() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/board?q=${encodeURIComponent(q)}` : "/board");
  }

  return (
    <form onSubmit={submit} className="relative hidden w-full max-w-xs md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search")}
        className="h-9 w-full rounded-lg bg-secondary pl-9 pr-3 text-sm outline-none placeholder:text-text-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </form>
  );
}
