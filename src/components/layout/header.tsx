import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/lib/supabase/auth";
import { getUnreadCount } from "@/lib/data/notifications";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { HeaderSearch } from "./header-search";

export async function Header() {
  const profile = await getProfile();
  const [tApp, unread] = await Promise.all([
    getTranslations("app"),
    profile ? getUnreadCount() : Promise.resolve(0),
  ]);

  return (
    <header className="glass sticky top-0 z-50 h-14 w-full">
      <div className="mx-auto flex h-full items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <ShieldCheck className="size-5" />
          <span className="hidden text-[17px] font-semibold tracking-tight sm:inline">
            {tApp("name")}
          </span>
        </Link>

        <div className="hidden lg:block">
          <NavLinks />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <HeaderSearch />
          {profile && (
            <NotificationBell userId={profile.id} initialUnread={unread} />
          )}
          <ThemeToggle />
          <LanguageSwitcher />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
