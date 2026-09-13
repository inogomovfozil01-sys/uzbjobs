"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface GoogleSearchWidgetProps {
  cx?: string;
}

export function GoogleSearchWidget({
  cx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX || "0462cf8522da840f7",
}: GoogleSearchWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = "google-cse-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://cse.google.com/cse.js?cx=${cx}`;
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).google?.search?.cse?.element) {
      try {
        (window as any).google.search.cse.element.init?.();
      } catch (e) {
        // Safe fallback
      }
    }
  }, [cx]);

  return (
    <div className="w-full rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold text-xs">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Google Programmable Search (Узбекистан)
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Прямой поиск вакансий через Google Custom Search Engine
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
          cx: {cx.slice(0, 10)}...
        </span>
      </div>

      <div ref={containerRef} className="gcse-search-wrapper min-h-[120px]">
        <div className="gcse-search"></div>
      </div>
    </div>
  );
}

export default GoogleSearchWidget;
