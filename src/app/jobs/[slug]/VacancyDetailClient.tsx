"use client";

import { useState } from "react";
import { VacancyItem } from "@/components/jobs/VacancyCard";
import { AIMatchModal } from "@/components/ai/AIMatchModal";
import { AICoverLetterModal } from "@/components/ai/AICoverLetterModal";
import { ReportModal } from "@/components/jobs/ReportModal";
import {
  ExternalLink,
  Bookmark,
  Sparkles,
  FileText,
  Flag,
  Building2,
  Globe,
  Share2,
  Check,
} from "lucide-react";

export function VacancyDetailClient({ vacancy }: { vacancy: VacancyItem & { company?: any; sourceUrl: string; applicationUrl?: string | null } }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (saved) {
        await fetch(`/api/jobs/${vacancy.id}/save`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch(`/api/jobs/${vacancy.id}/save`, { method: "POST" });
        setSaved(true);
      }
    } catch {}
    setSaving(false);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const applyUrl = vacancy.applicationUrl || vacancy.sourceUrl;

  return (
    <>
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 sticky top-20">
        <h3 className="text-sm font-bold text-foreground">Действия с вакансией</h3>

        {/* Primary Apply Button */}
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow hover:opacity-90 transition"
        >
          Откликнуться на вакансию <ExternalLink className="h-4 w-4" />
        </a>

        {/* AI Match Button */}
        <button
          onClick={() => setMatchOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
        >
          <Sparkles className="h-4 w-4" /> AI Анализ совместимости
        </button>

        {/* AI Cover Letter Button */}
        <button
          onClick={() => setCoverLetterOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border bg-secondary/60 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition"
        >
          <FileText className="h-4 w-4" /> Создать сопроводительное письмо
        </button>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition ${
              saved
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-primary" : ""}`} />
            {saved ? "Сохранено" : "Сохранить"}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Ссылка скопирована
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" /> Поделиться
              </>
            )}
          </button>
        </div>

        {/* Report Button */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setReportOpen(true)}
            className="text-[11px] text-muted-foreground hover:text-rose-600 transition flex items-center justify-center gap-1 mx-auto"
          >
            <Flag className="h-3 w-3" /> Пожаловаться на вакансию
          </button>
        </div>
      </div>

      {/* Company Info Card */}
      {vacancy.company && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-xl">
              {vacancy.company.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">{vacancy.company.name}</h4>
              <span className="text-xs text-muted-foreground">{vacancy.company.city || "Узбекистан"}</span>
            </div>
          </div>

          {vacancy.company.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {vacancy.company.description}
            </p>
          )}

          {vacancy.company.website && (
            <a
              href={vacancy.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Globe className="h-3 w-3" /> Официальный сайт компании
            </a>
          )}
        </div>
      )}

      {/* Modals */}
      {matchOpen && (
        <AIMatchModal vacancy={vacancy} onClose={() => setMatchOpen(false)} />
      )}

      {coverLetterOpen && (
        <AICoverLetterModal vacancy={vacancy} onClose={() => setCoverLetterOpen(false)} />
      )}

      {reportOpen && (
        <ReportModal
          vacancyId={vacancy.id}
          vacancyTitle={vacancy.title}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
}
