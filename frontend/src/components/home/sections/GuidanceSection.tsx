import Link from "next/link";

import type { TagSummary } from "@/components/home/types";

interface GuidanceSectionProps {
  trendingTags: TagSummary[];
}

export function GuidanceSection({ trendingTags }: GuidanceSectionProps) {
  return (
    <section className="max-w-6xl px-6 pb-16 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
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
    </section>
  );
}
