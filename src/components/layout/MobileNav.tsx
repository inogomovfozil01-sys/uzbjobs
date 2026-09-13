"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  // Hide mobile nav inside admin dashboard to prevent cluttering desktop dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Главная", href: "/", icon: Home, active: pathname === "/" },
    { label: "Поиск", href: "/jobs", icon: Search, active: pathname.startsWith("/jobs") },
    { label: "Сохранённые", href: "/saved", icon: Bookmark, active: pathname === "/saved" },
    { label: "Профиль", href: "/profile", icon: User, active: pathname === "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors ${
                item.active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${item.active ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
