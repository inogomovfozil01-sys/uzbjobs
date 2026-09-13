import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход",
  description: "Войдите в аккаунт UzbJobs для сохранения вакансий и использования AI Match.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
