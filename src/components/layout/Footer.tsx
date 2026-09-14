"use client";

import Link from "next/link";
import { Briefcase, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-muted/30 pb-24 md:pb-8 pt-10 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                <Briefcase className="h-4 w-4" />
              </div>
              <span>UzbJobs</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("footerDesc")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              {t("footerForSeekers")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/jobs" className="hover:text-foreground transition">
                  {t("navJobs")}
                </Link>
              </li>
              <li>
                <Link href="/jobs?city=Ташкент" className="hover:text-foreground transition">
                  {t("footerJobsInTashkent")}
                </Link>
              </li>
              <li>
                <Link href="/jobs?remote=true" className="hover:text-foreground transition">
                  {t("footerRemoteJobs")}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=IT" className="hover:text-foreground transition">
                  {t("footerItJobs")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              {t("footerForCompanies")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/companies" className="hover:text-foreground transition">
                  {t("footerEmployerCatalog")}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:underline font-semibold text-amber-600 dark:text-amber-400 transition">
                  {t("footerAdminPanel")}
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-foreground transition">
                  {t("applyBtn")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              {t("footerLocations")}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ташкент, Самарканд, Бухара, Фергана, Андижан, Наманган & Remote.
            </p>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <span>{t("footerMadeWith")}</span>{" "}
              <Heart className="h-3 w-3 text-rose-500 inline fill-rose-500" />{" "}
              <span>{t("footerForUzbekistan")}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <p>© {new Date().getFullYear()} UzbJobs. {t("footerAllRights")}</p>
          <p className="mt-1 sm:mt-0 text-center sm:text-right">{t("heroBadge")}</p>
        </div>
      </div>
    </footer>
  );
}
