"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Briefcase, Sparkles, Bookmark, User, Shield, LogOut, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                Uzb<span className="text-primary">Jobs</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/jobs" className="transition-colors hover:text-foreground">
              Все вакансии
            </Link>
            <Link href="/companies" className="transition-colors hover:text-foreground">
              Компании
            </Link>
            {session && (
              <Link href="/profile#saved" className="transition-colors hover:text-foreground flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" /> Сохранённые
              </Link>
            )}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              Админ-панель
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium hover:bg-muted transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate">
                  {session.user?.name || "Профиль"}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Выйти"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition px-3 py-1.5"
              >
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
              >
                Регистрация
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-3 space-y-2">
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Все вакансии
          </Link>
          <Link
            href="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Компании Узбекистана
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400"
            >
              <Shield className="h-4 w-4" /> Панель администратора
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
