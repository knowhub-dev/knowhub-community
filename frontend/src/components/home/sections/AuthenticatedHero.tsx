'use client';

import Link from "next/link";

import { ActivityFeed } from "@/components/home/ActivityFeed";
import type { ActivityEvent, QuickAction, StatCard, TagSummary } from "@/components/home/types";
import { formatNumber } from "@/components/home/utils";
import { SolveraChatCard } from "@/components/SolveraChatCard";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/GradientButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { AuroraBackground } from "@/components/backgrounds";
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
    <section className="relative isolate overflow-hidden border-b border-border/50 bg-[hsl(var(--surface))]">
      <AuroraBackground />
      <div className="absolute inset-0 -z-10 opacity-90" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsla(var(--primary)/0.22),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,hsla(var(--secondary)/0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_85%,hsla(var(--accent)/0.18),transparent_46%)]" />
      </div>
      <div className="absolute left-1/2 top-[-12%] -z-20 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsla(var(--primary)/0.16)_0%,transparent_60%)] blur-3xl" />
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-12 lg:px-8 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-7 rounded-[var(--radius-md)] border border-white/5 bg-[hsl(var(--card))]/75 p-8 shadow-[0_25px_90px_hsla(var(--primary)/0.18)] backdrop-blur-xl dark:border-border/60">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/15 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))] shadow-[0_6px_20px_hsla(var(--primary)/0.18)]">
              Xush kelibsiz, {auth.user?.name ?? auth.user?.username ?? "a'zo"}
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] text-[hsl(var(--foreground))] sm:text-5xl lg:text-6xl">
              <TypewriterText
                phrases={["Bugun nimani o'rganamiz?", "Shaxsiy lentani davom ettiring"]}
                className="block"
              />
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl">
              SolVera bilan to'liq jihozlangan: kuzatayotganingiz, saqlaganlaringiz va yangi postlar uchun shaxsiy maydon.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <GradientButton asChild className="px-7 py-3 text-base">
                <Link href="/posts/create">
                  Post yaratish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GradientButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] border-border/80 bg-[hsl(var(--surface))]/40 px-6 text-base font-semibold text-[hsl(var(--foreground))] shadow-[0_12px_35px_hsla(var(--foreground)/0.06)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--surface))]"
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
            <div className="rounded-[var(--radius-md)] border border-white/10 bg-[hsl(var(--card))]/70 p-6 shadow-[0_18px_45px_hsla(var(--primary)/0.14)] backdrop-blur-xl dark:border-border/70">
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
                      className={`group flex flex-col justify-between rounded-[var(--radius-md)] border border-white/10 bg-[hsl(var(--surface))]/70 p-4 text-[hsl(var(--foreground))] shadow-[0_15px_40px_hsla(var(--foreground)/0.08)] backdrop-blur transition hover:-translate-y-1 ${action.hoverClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`rounded-[var(--radius-md)] bg-[hsl(var(--foreground))]/5 p-2 ${action.accentClass}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="text-sm font-semibold">{action.title}</div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
                      <span className={`mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))] ${action.ctaClass}`}>
                        {action.ctaLabel} <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-white/10 bg-[hsl(var(--card))]/70 p-6 shadow-[0_16px_38px_hsla(var(--foreground)/0.1)] backdrop-blur-xl dark:border-border/70">
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
