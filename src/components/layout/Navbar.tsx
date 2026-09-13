"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Briefcase,
  Sparkles,
  Bookmark,
  User,
  Shield,
  LogOut,
  Settings,
  ChevronDown,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage, Language } from "@/lib/i18n";

export function Navbar() {
  const { data: session } = useSession();
  const { lang, setLang, t } = useLanguage();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageLabels: Record<Language, { label: string; flag: string }> = {
    uz: { label: "O'zbekcha", flag: "🇺🇿" },
    ru: { label: "Русский", flag: "🇷🇺" },
    en: { label: "English", flag: "🇬🇧" },
  };

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

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/jobs" className="transition-colors hover:text-foreground">
              {t("navJobs")}
            </Link>
            <Link href="/companies" className="transition-colors hover:text-foreground">
              {t("navCompanies")}
            </Link>
            {session && (
              <Link
                href="/saved"
                className="transition-colors hover:text-foreground flex items-center gap-1"
              >
                <Bookmark className="h-3.5 w-3.5" /> {t("navSaved")}
              </Link>
            )}
          </nav>
        </div>

        {/* Right side: Language switcher + User Auth */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              <span>{languageLabels[lang].flag}</span>
              <span className="hidden sm:inline">{languageLabels[lang].label}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border bg-card p-1.5 shadow-lg space-y-0.5 z-50 text-xs">
                {(["uz", "ru", "en"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-medium transition ${
                      lang === l ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"
                    }`}
                  >
                    <span>{languageLabels[l].flag}</span>
                    <span>{languageLabels[l].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              {t("navAdmin")}
            </Link>
          )}

          {/* User Auth Section */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 hover:bg-muted transition"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User Avatar"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold max-w-[110px] truncate text-foreground">
                  {session.user?.name || "Пользователь"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-card p-2 shadow-xl z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b">
                    <p className="font-bold text-foreground truncate">{session.user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{session.user?.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition font-medium"
                  >
                    <User className="h-3.5 w-3.5 text-primary" />
                    {t("navProfile")}
                  </Link>

                  <Link
                    href="/saved"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition font-medium"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-primary" />
                    {t("navSaved")}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition font-medium"
                  >
                    <Settings className="h-3.5 w-3.5 text-primary" />
                    {t("navSettings")}
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition font-semibold"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {t("navAdmin")}
                    </Link>
                  )}

                  <div className="border-t pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("navLogout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border bg-card px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition"
              >
                {t("navSignIn")}
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex rounded-xl bg-primary px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
              >
                {t("navRegister")}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-xl border p-2 text-muted-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("navJobs")}
          </Link>
          <Link
            href="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("navCompanies")}
          </Link>
          {session && (
            <>
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="h-4 w-4 text-primary" /> {t("navSaved")}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4 text-primary" /> {t("navProfile")}
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400"
            >
              <Shield className="h-4 w-4" /> {t("navAdmin")}
            </Link>
          )}
          {session && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-2 py-1.5 text-sm font-semibold text-rose-600 w-full text-left"
            >
              <LogOut className="h-4 w-4" /> {t("navLogout")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
