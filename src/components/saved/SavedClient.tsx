"use client";

import Link from "next/link";
import { VacancyCard, VacancyItem } from "@/components/jobs/VacancyCard";
import { Bookmark, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SavedClient({ initialVacancies }: { initialVacancies: VacancyItem[] }) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 pb-32 sm:pb-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Bookmark className="h-6 w-6 sm:h-7 sm:w-7 text-primary fill-primary" />
            {t("savedTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {initialVacancies.length > 0
              ? t("savedCountText").replace("{count}", initialVacancies.length.toString())
              : t("profileEmptySaved")}
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-90 transition active:scale-95"
        >
          <Search className="h-3.5 w-3.5" />
          {t("savedSearchNew")}
        </Link>
      </div>

      {initialVacancies.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 sm:p-12 text-center text-xs text-muted-foreground space-y-3">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground text-sm">{t("savedEmptyTitle")}</p>
          <p className="max-w-md mx-auto leading-relaxed">
            {t("savedEmptyDesc")}
          </p>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold text-xs"
            >
              {t("savedBrowseCatalog")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {initialVacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </div>
  );
}
