import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Мой профиль",
  description: "Управление профилем соискателя, навыками и резюме на UzbJobs.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
