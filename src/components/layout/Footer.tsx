import Link from "next/link";
import { Briefcase, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 pb-20 md:pb-8 pt-10 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                <Briefcase className="h-4 w-4" />
              </div>
              <span>UzbJobs</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Интеллектуальная AI-платформа поиска работы и агрегации вакансий в Узбекистане.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Соискателям</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/jobs" className="hover:text-foreground">Все вакансии</Link></li>
              <li><Link href="/jobs?city=Ташкент" className="hover:text-foreground">Работа в Ташкенте</Link></li>
              <li><Link href="/jobs?remote=true" className="hover:text-foreground">Удаленная работа</Link></li>
              <li><Link href="/jobs?category=IT" className="hover:text-foreground">IT вакансии</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Компаниям</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/companies" className="hover:text-foreground">Каталог работодателей</Link></li>
              <li><Link href="/admin" className="hover:underline font-semibold text-amber-600 dark:text-amber-400">Панель администратора</Link></li>
              <li><Link href="/opt-out" className="hover:text-foreground">Управление вакансиями</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Локации</h4>
            <p className="text-xs text-muted-foreground">
              Ташкент, Самарканд, Бухара, Фергана, Андижан, Наманган и удаленные вакансии.
            </p>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <span>Сделано с</span> <Heart className="h-3 w-3 text-rose-500 inline fill-rose-500" /> <span>для Узбекистана</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} UzbJobs. Все права защищены.</p>
          <p className="mt-2 sm:mt-0">Powered by Google Gemini & Custom Search API</p>
        </div>
      </div>
    </footer>
  );
}
