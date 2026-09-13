"use client";

import Link from "next/link";
import { formatSalary, formatDate } from "@/lib/utils";
import { MapPin, Building2, Bookmark, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

export interface VacancyItem {
  id: string;
  title: string;
  slug: string;
  companyName?: string | null;
  company?: {
    name: string;
    slug: string;
    logo?: string | null;
    isVerified?: boolean;
  } | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryText?: string | null;
  city?: string | null;
  isRemote: boolean;
  experienceLevel?: string | null;
  employmentType?: string | null;
  skills: string[];
  qualityScore: number;
  isVerified?: boolean;
  publishedAt?: string | Date | null;
  sourceName?: string | null;
}

export function VacancyCard({
  vacancy,
  onSaveToggle,
  isSaved = false,
  onOpenMatch,
}: {
  vacancy: VacancyItem;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
  onOpenMatch?: (vacancy: VacancyItem) => void;
}) {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) {
        await fetch(`/api/jobs/${vacancy.id}/save`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch(`/api/jobs/${vacancy.id}/save`, { method: "POST" });
        setSaved(true);
      }
      onSaveToggle?.(vacancy.id);
    } catch {}
    setSaving(false);
  };

  const salaryDisplay = formatSalary(
    vacancy.salaryMin,
    vacancy.salaryMax,
    vacancy.salaryCurrency || "UZS",
    vacancy.salaryText
  );

  return (
    <div className="group relative rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Company & Title */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {vacancy.company?.slug ? (
                <Link
                  href={`/companies/${vacancy.company.slug}`}
                  className="hover:text-primary transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  {vacancy.companyName || vacancy.company.name}
                </Link>
              ) : (
                <span>{vacancy.companyName || "Компания"}</span>
              )}
            </span>
            {(vacancy.isVerified || vacancy.company?.isVerified) && (
              <span title="Верифицировано">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(vacancy.publishedAt)}
            </span>
          </div>

          <Link href={`/jobs/${vacancy.slug}`} className="block">
            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {vacancy.title}
            </h3>
          </Link>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          title={saved ? "Удалить из сохранённых" : "Сохранить вакансию"}
          className={`rounded-lg p-2 transition ${
            saved
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${saved ? "fill-primary" : ""}`} />
        </button>
      </div>

      {/* Salary & Location Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
          {salaryDisplay}
        </span>

        <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded-md">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {vacancy.city || "Ташкент"}
        </span>

        {vacancy.isRemote && (
          <span className="inline-flex items-center bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
            Удаленно
          </span>
        )}

        {vacancy.experienceLevel && (
          <span className="inline-flex items-center text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {vacancy.experienceLevel}
          </span>
        )}
      </div>

      {/* Skills tags */}
      {vacancy.skills && vacancy.skills.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {vacancy.skills.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
          {vacancy.skills.length > 5 && (
            <span className="text-[11px] text-muted-foreground self-center">
              +{vacancy.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer / Actions */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <span className="text-[11px] text-muted-foreground">
          {vacancy.sourceName ? `Источник: ${vacancy.sourceName}` : "UzbJobs AI"}
        </span>

        <div className="flex items-center gap-2">
          {onOpenMatch && (
            <button
              onClick={() => onOpenMatch(vacancy)}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
            >
              <Sparkles className="h-3 w-3" />
              AI Match
            </button>
          )}

          <Link
            href={`/jobs/${vacancy.slug}`}
            className="inline-flex items-center font-medium text-foreground hover:text-primary transition"
          >
            Подробнее →
          </Link>
        </div>
      </div>
    </div>
  );
}
