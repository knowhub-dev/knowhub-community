import Link from "next/link";

import type { QuickActionsSectionProps } from "@/components/home/sections/types";
import { ArrowRight } from "lucide-react";

export function QuickActionsSection({ quickActions, trendingTags }: QuickActionsSectionProps) {
  return (
    <section className="max-w-6xl px-6 pb-16 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Tezkor harakatlar</p>
              <p className="text-lg font-semibold">KnowHub oqimlari</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex flex-col justify-between rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))] p-5 text-[hsl(var(--foreground))] shadow-md shadow-[0_15px_35px_rgba(15,23,42,0.07)] transition ${action.hoverClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-[var(--radius-md)] bg-[hsl(var(--foreground))]/5 p-2 ${action.accentClass}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="text-sm font-semibold">{action.title}</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
                  <span className={`mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${action.ctaClass}`}>
                    {action.ctaLabel} <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Trend teglar</p>
              <Link href="/tags" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
                Barchasi
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {trendingTags.length ? (
                trendingTags.slice(0, 14).map((tag) => (
                  <span
                    key={tag.slug ?? tag.name}
                    className="rounded-full border border-border/60 bg-[hsl(var(--surface))] px-3 py-1 text-[hsl(var(--foreground))]"
                  >
                    #{tag.name}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-border/60 px-3 py-1 text-muted-foreground">
                  Teglar yuklanmoqda...
                </span>
              )}
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Hamjamiyat yozish qo'llanmasi</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Savolingiz yoki yechimingiz yanada tushunarli chiqishi uchun shu tekshiruvdan foydalaning. SolVera aynan shu struktura asosida tavsiya beradi.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Sarlavhaga muammo va kontekstni qo'shing.</li>
              <li>• Kod parchalarini va kutilgan natijani aniq yozing.</li>
              <li>• Taglardan foydalanib, qidiruvni yengillashtiring.</li>
              <li>• SolVera tavsiyasini qisqa changelog sifatida qo'shing.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
