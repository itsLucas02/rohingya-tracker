"use client";

import { Map as MapIcon, LayoutList, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const tabs = [
    { href: "/", key: "map", Icon: MapIcon, active: pathname === "/" },
    {
      href: "/board",
      key: "board",
      Icon: LayoutList,
      active: pathname.startsWith("/board"),
    },
  ] as const;

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around px-6 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map(({ href, key, Icon, active }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-0.5 text-[11px]",
            active ? "text-foreground" : "text-text-muted",
          )}
        >
          <Icon className="size-5" />
          {t(key)}
        </Link>
      ))}

      <Link
        href="/report/new"
        aria-label={t("map")}
        className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
      >
        <Plus className="size-6" />
      </Link>
    </nav>
  );
}
