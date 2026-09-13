import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отписка от уведомлений",
  description: "Управление подпиской и исключение вашего email из рассылок и уведомлений UzbJobs.",
};

export default function OptOutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
