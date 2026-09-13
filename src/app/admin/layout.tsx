import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Radio,
  FileText,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Activity,
  Flag,
  Globe,
  Users,
  Building2,
  Sliders,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const navItems = [
    { label: "Дашборд", href: "/admin", icon: LayoutDashboard },
    { label: "Модерация (18+)", href: "/admin/moderation", icon: ShieldAlert },
    { label: "AI Сканер вакансий", href: "/admin/scanner", icon: Radio },
    { label: "Управление вакансиями", href: "/admin/vacancies", icon: FileText },
    { label: "Поисковые запросы", href: "/admin/search-queries", icon: Search },
    { label: "Интеграции & API", href: "/admin/settings/integrations", icon: Settings },
    { label: "Журналы & Ошибки", href: "/admin/logs", icon: Activity },
    { label: "Жалобы пользователей", href: "/admin/reports", icon: Flag },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Admin Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4 space-y-6">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-foreground block">
              UzbJobs Admin
            </span>
            <span className="text-[10px] text-muted-foreground">Центр управления AI</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t pt-4 px-2 space-y-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground truncate">{session.user.name}</div>
          <div className="truncate text-[10px]">{session.user.email}</div>
          <Link href="/" className="text-primary text-xs hover:underline block pt-2">
            ← Вернуться на сайт
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
    </div>
  );
}
