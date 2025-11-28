'use client';

import Link from "next/link";

import { ActivityFeed } from "@/components/features/home/ActivityFeed";
import type { ActivityEvent, QuickAction, StatCard, TagSummary } from "@/components/features/home/types";
import { formatNumber } from "@/components/features/home/utils";
import { SolveraChatCard } from "@/components/features/solvera/SolveraChatCard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TypewriterText } from "@/components/ui/TypewriterText";
import type { AuthContextValue } from "@/providers/AuthProvider";
import { ArrowRight, Medal, MessageCircle, TrendingUp, Users } from "lucide-react";

interface AuthenticatedHeroProps {
  auth: AuthContextValue;
  statsCards: StatCard[];
  xpProgress: number;
  quickActions: QuickAction[];
  trendingTags: TagSummary[];
  heroFeed: ActivityEvent[];
}

export function AuthenticatedHero({
  auth,
  statsCards,
  xpProgress,
  quickActions,
  trendingTags,
  heroFeed,
}: AuthenticatedHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/40 bg-[hsl(var(--surface))]">
      <div className="absolute inset-0 -z-10 opacity-80" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsla(198,93%,60%,0.18),_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_hsla(154,82%,58%,0.18),_transparent_60%)]" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6 rounded-[var(--radius-md)] border border-border/60 bg-[hsl(var(--card))]/90 p-8 shadow-[0_25px_75px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))] shadow-[0_6px_20px_rgba(14,116,144,0.18)]">
              Xush kelibsiz, {auth.user?.name ?? auth.user?.username ?? "a'zo"}
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
              <TypewriterText
                phrases={["Bugun nimani o'rganamiz?", "Shaxsiy lentani davom ettiring"]}
                className="block"
              />
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              SolVera bilan to'liq jihozlangan: kuzatayotganingiz, saqlaganlaringiz va yangi postlar uchun shaxsiy maydon.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] px-6 text-base font-semibold shadow-[0_18px_45px_rgba(14,116,144,0.35)]"
              >
                <Link href="/posts/create">
                  Post yaratish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] border-border px-6 text-base font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]"
              >
                <Link href="/dashboard">
                  Mening dashboardim
                  <TrendingUp className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] text-base font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
              >
                <Link href="/bookmarks">
                  Saqlanganlar
                  <Medal className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--surface))] p-4 shadow-sm dark:border-border/60 dark:bg-[hsl(var(--card))]/70"
                  >
                    <div className={`flex items-center gap-2 ${card.accentClass}`}>
                      <Icon className="h-4 w-4" />
                      {card.label}
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatNumber(card.value)}</p>
                    <p>{card.subtitle}</p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-[hsl(var(--surface))]/80 p-4 shadow-sm">
              <ProgressBar value={xpProgress} label="XP darajangiz" ariaLabel="XP daraja" />
              <p className="mt-2 text-xs text-muted-foreground">
                Faolligingiz oshgani sari badge va ustozlik imkoniyatlari ochiladi.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">Siz uchun tezkor ishlar</p>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))]">Builder mode</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {quickActions.slice(0, 3).map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`group flex flex-col justify-between rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))] p-4 text-[hsl(var(--foreground))] shadow-sm shadow-[0_15px_35px_rgba(15,23,42,0.07)] transition ${action.hoverClass}`}
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
            <div className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-lg backdrop-blur">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users className="h-4 w-4 text-[hsl(var(--secondary))]" />
                Builder hamjamiyati faoliyatlari
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {heroFeed.length ? (
                  <ActivityFeed feed={heroFeed} variant="compact" limit={4} />
                ) : (
                  <p className="rounded-[var(--radius-md)] border border-dashed border-border/60 bg-[hsl(var(--surface))]/60 px-3 py-4 text-center text-xs">
                    Yangi faoliyatlar kutilmoqda.
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {trendingTags.length ? (
                  trendingTags.slice(0, 6).map((tag) => (
                    <span
                      key={tag.slug ?? tag.name}
                      className="rounded-full border border-border/60 bg-[hsl(var(--surface))] px-3 py-1 text-[hsl(var(--foreground))]"
                    >
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-dashed border-border/60 px-3 py-1 text-muted-foreground">
                    Yangi teglar kutilmoqda
                  </span>
                )}
              </div>
            </div>
            <SolveraChatCard context={{ surface: "homepage" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
