import Link from 'next/link';
import { ArrowRight, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

import type { HomeFeedItem, HomeStatsPayload, SpotlightContent } from '@/app/home/helpers/fetchHome';
import { cn } from '@/lib/utils';

type HeroSectionProps = {
  stats: HomeStatsPayload | null;
  feedHighlights: HomeFeedItem[];
  spotlight: SpotlightContent | null;
};

function formatNumber(value?: number) {
  if (value === undefined || value === null) return '—';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return value.toLocaleString();
}

export function HeroSection({ stats, feedHighlights, spotlight }: HeroSectionProps) {
  const primaryStats = [
    { label: "A'zolar", value: stats?.users?.total },
    { label: "Javoblar", value: stats?.comments?.total },
    { label: "Maqolalar", value: stats?.posts?.total },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="container grid gap-12 px-4 pb-8 pt-12 lg:grid-cols-[1.25fr,1fr] lg:items-center lg:pt-18">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-1/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur-xs">
            <Sparkles className="h-4 w-4 text-primary" />
            Premium Aurora • Variant C
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Kodni yozing. Loyiha yarating.
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Kelajakni quring.
              </span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              O'zbekiston dasturchilari uchun yagona platforma. Savol bering, tajribangiz bilan bo'lishing va eng so'nggi
              texnologiyalarni birgalikda o'rganing. Sizning IT-hamjamiyatingiz shu yerda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              Boshlash
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-1/60 px-5 py-3 text-sm font-semibold text-foreground shadow-soft backdrop-blur-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow"
            >
              Jamiyatni ko'rish
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primaryStats.map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-surface-1/70 px-4 py-5 shadow-soft backdrop-blur-xs"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden />
                <div className="relative flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold text-foreground">{formatNumber(item.value)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -left-10 -right-6 rounded-[32px] bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface-1/80 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Live community pulse</p>
                <p className="text-xs text-muted-foreground">Yangilanishlar real vaqt rejimida</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold">SSR active</span>
              </div>
            </div>

            <div className="space-y-3 p-6">
              {feedHighlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-surface-1/70 p-6 text-center text-sm text-muted-foreground">
                  Yangilanishlar hozircha mavjud emas. Yangi postlar qo'shilishi bilan bu yerda paydo bo'ladi.
                </div>
              ) : (
                feedHighlights.map((item, index) => (
                  <div
                    key={`${item.id ?? index}-${item.title}`}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border border-border/50 bg-surface-1/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow',
                      index === 0 && 'border-primary/40 bg-gradient-to-r from-primary/8 via-surface-1/80 to-transparent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Gauge className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-5 text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.user?.name || item.user?.username || "Jamiyat a'zosi"} • {item.created_at?.slice(0, 10) || 'hozir'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border/50 bg-surface-2/70 px-6 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Spotlight</span>
                <span className="text-foreground">{spotlight?.title ?? "Jamiyat yangiliklari"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
