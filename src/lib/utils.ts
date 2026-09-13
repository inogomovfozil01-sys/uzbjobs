import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency: string = "UZS",
  salaryText?: string | null
): string {
  if (salaryText && salaryText.trim().length > 0) {
    return salaryText;
  }

  if (!min && !max) {
    return "Зарплата не указана";
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  const currSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : " сум";

  if (min && max) {
    if (currency === "USD" || currency === "EUR") {
      return `${currSymbol}${formatNumber(min)} - ${currSymbol}${formatNumber(max)}`;
    }
    return `${formatNumber(min)} - ${formatNumber(max)}${currSymbol}`;
  }

  if (min) {
    if (currency === "USD" || currency === "EUR") {
      return `от ${currSymbol}${formatNumber(min)}`;
    }
    return `от ${formatNumber(min)}${currSymbol}`;
  }

  if (max) {
    if (currency === "USD" || currency === "EUR") {
      return `до ${currSymbol}${formatNumber(max)}`;
    }
    return `до ${formatNumber(max)}${currSymbol}`;
  }

  return "По договорённости";
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Недавно";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Недавно";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Только что";
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;

  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
