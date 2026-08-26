"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", key: "map" },
  { href: "/board", key: "board" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex items-center gap-0.5">
      {LINKS.map(({ href, key }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-selected text-foreground"
                : "text-text-secondary hover:bg-hover hover:text-foreground",
            )}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
