import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Flag, ExternalLink, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  let reports: any[] = [];
  try {
    reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vacancy: true,
        user: true,
      },
      take: 50,
    });
  } catch (err) {
    console.error("Admin reports fetch error:", err);
    reports = [];
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Flag className="h-7 w-7 text-rose-600" />
          Жалобы пользователей на вакансии
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Модерация сообщений о неактуальных, закрытых или фейковых вакансиях
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-xs text-muted-foreground space-y-2">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="font-semibold text-foreground">Жалоб нет!</p>
          <p>Пользователи не отправляли жалоб на вакансии.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="divide-y text-xs">
            {reports.map((report) => (
              <div key={report.id} className="p-4 space-y-2 hover:bg-muted/30 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-600 uppercase tracking-wider text-[10px] bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                    {report.reason}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {new Date(report.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href={`/jobs/${report.vacancy.slug}`}
                    target="_blank"
                    className="font-bold text-foreground hover:text-primary transition flex items-center gap-1"
                  >
                    {report.vacancy.title} <ExternalLink className="h-3 w-3" />
                  </Link>
                  <span className="text-muted-foreground">{report.vacancy.companyName}</span>
                </div>

                {report.details && (
                  <p className="text-muted-foreground bg-muted p-2 rounded-lg text-xs">
                    "{report.details}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
