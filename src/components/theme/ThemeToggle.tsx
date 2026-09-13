"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Переключить тему"
        className={`flex items-center gap-1.5 rounded-xl border bg-card p-2 text-muted-foreground transition hover:bg-muted ${className}`}
      >
        <span className="h-4 w-4" />
        {showLabel && <span className="text-xs font-semibold">Тема</span>}
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className={`flex items-center gap-2 rounded-xl border bg-card p-2 text-foreground transition-all hover:bg-muted/80 active:scale-95 shadow-sm ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? "Светлая тема" : "Тёмная тема"}
        </span>
      )}
    </button>
  );
}
