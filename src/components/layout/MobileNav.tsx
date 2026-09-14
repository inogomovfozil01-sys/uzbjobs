"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide mobile nav inside admin dashboard to prevent cluttering desktop dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: t("navHome"), href: "/", icon: Home, active: pathname === "/" },
    { label: t("searchBtn"), href: "/jobs", icon: Search, active: pathname.startsWith("/jobs") },
    { label: t("navSaved"), href: "/saved", icon: Bookmark, active: pathname === "/saved" },
    { label: t("navProfile"), href: "/profile", icon: User, active: pathname === "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <nav className="flex h-16 items-center justify-around px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium transition-all active:scale-95 ${
                item.active
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${item.active ? "text-primary scale-110" : ""}`} />
              <span className="truncate max-w-[70px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
