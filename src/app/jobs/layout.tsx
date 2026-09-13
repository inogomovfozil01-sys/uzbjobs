import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вакансии в Узбекистане — UzbJobs",
  description: "Поиск актуальных вакансий в Ташкенте, Самарканде и по всему Узбекистану. Умные фильтры по зарплате, опыту, формату работы и стеку технологий.",
  openGraph: {
    title: "Вакансии в Узбекистане — UzbJobs",
    description: "Найдите актуальные вакансии в Ташкенте и других городах Узбекистана с фильтрами зарплат и формата работы.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
