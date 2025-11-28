'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ActivityFeed } from "@/components/features/home/ActivityFeed";
import { CodeRunnerCard } from "@/components/features/home/CodeRunnerCard";
import { SystemStatusWidget } from "@/components/features/home/SystemStatusWidget";
import { WeeklyHeroes } from "@/components/features/home/WeeklyHeroes";
import type {
  FeedTab,
  PaginatedPostsResponse,
  QuickAction,
  SortType,
  StatCard,
} from "@/components/features/home/types";
import { SolveraChatCard } from "@/components/features/solvera/SolveraChatCard";
import { Button } from "@/components/ui/button";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { ArrowRight, BookOpen, Medal, MessageCircle, PenSquare, Server, Sparkles, TrendingUp, Users } from "lucide-react";

import { AuthenticatedHero } from "./sections/AuthenticatedHero";
import { FeedSection } from "./sections/FeedSection";
import { GuidanceSection } from "./sections/GuidanceSection";
import { HomepageSkeleton } from "./sections/HomepageSkeleton";
import { TrendSignalsSection } from "./sections/TrendSignalsSection";
import { useHomepageData } from "./useHomepageData";

const FEED_TABS: FeedTab[] = [
  { value: "latest", label: "So'nggilari" },
  { value: "popular", label: "Trenddagilar" },
  { value: "following", label: "Mening obunalarim", authOnly: true },
];

async function getPosts(params: { sort: SortType }) {
  const sortParam = params.sort === "popular" ? "trending" : params.sort;
  const response = await api.get<PaginatedPostsResponse>("/posts", {
    params: { sort: sortParam, per_page: 6 },
  });
  return response.data;
}

function GuestHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/40 bg-[hsl(var(--surface))]">
      <div className="absolute inset-0 -z-10 opacity-80" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsla(209,100%,65%,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_hsla(154,82%,58%,0.12),_transparent_60%)]" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))] shadow-[0_6px_20px_rgba(14,116,144,0.18)]">
              KnowHub.uz
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
              <TypewriterText
                phrases={["O'zbekistondagi dev community", "Savollar, yechimlar, AI yordam"]}
                className="block"
              />
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Cosmic Blue ohangidagi professional muhitda savollaringizni bering, yechimlaringizni baham ko'ring va SolVera bilan tezroq natijaga erishing.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] px-6 text-base font-semibold shadow-[0_18px_45px_rgba(14,116,144,0.35)]"
              >
                <Link href="/auth/signup">
                  Ro'yxatdan o'tish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-[var(--radius-md)] border-border px-6 text-base font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]"
              >
                <Link href="/auth/login">
                  Kirish
                  <Medal className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="#community-feed"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"
                aria-label="Hamjamiyat lentasiga o'tish"
              >
                Lenta bo'ylab ko'rib chiqish
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              {["Postlar", "A'zolar", "Wiki"].map((label) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--surface))] p-4 shadow-sm dark:border-border/60 dark:bg-[hsl(var(--card))]/70"
                >
                  <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">∞</p>
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <SolveraChatCard context={{ surface: "homepage-guest" }} />
        </div>
      </div>
    </section>
  );
}

export default function GuestLanding() {
  const { homeStats, heroes, feed, systemStatus, loading, error } = useHomepageData();
  const [sortType, setSortType] = useState<SortType>("latest");
  const auth = useAuth();

  const postsQuery = useQuery<PaginatedPostsResponse>({
    queryKey: ["posts", sortType],
    queryFn: () => getPosts({ sort: sortType }),
  });

  const visibleTabs = useMemo(
    () => FEED_TABS.filter((tab) => (tab.authOnly ? auth.isAuthenticated : true)),
    [auth.isAuthenticated],
  );

  useEffect(() => {
    if (!auth.isAuthenticated && sortType === "following") {
      setSortType("latest");
    }
  }, [auth.isAuthenticated, sortType]);

  const latestPosts = useMemo(() => homeStats?.latest_posts ?? [], [homeStats?.latest_posts]);
  const trendingTags = homeStats?.trending_tags ?? [];
  const heroFeed = useMemo(() => feed.slice(0, 3), [feed]);
  const { spotlightPost, secondaryPosts, queuePosts } = useMemo(() => {
    const [first, ...rest] = latestPosts;
    return {
      spotlightPost: first ?? null,
      secondaryPosts: rest.slice(0, 3),
      queuePosts: rest.slice(3, 8),
    };
  }, [latestPosts]);

  const statsCards = useMemo<StatCard[]>(
    () => [
      {
        label: "Postlar",
        value: homeStats?.stats?.posts?.total,
        subtitle: "Umumiy maqolalar",
        icon: PenSquare,
        accentClass: "text-[hsl(var(--primary))]",
      },
      {
        label: "A'zolar",
        value: homeStats?.stats?.users?.total,
        subtitle: "Faol hamjamiyat",
        icon: Users,
        accentClass: "text-[hsl(var(--secondary))]",
      },
      {
        label: "Wiki",
        value: homeStats?.stats?.wiki?.articles,
        subtitle: "Bilim maqolalari",
        icon: BookOpen,
        accentClass: "text-[hsl(var(--accent-purple))]",
      },
    ],
    [homeStats?.stats?.posts?.total, homeStats?.stats?.users?.total, homeStats?.stats?.wiki?.articles],
  );

  const xpProgress = useMemo(() => {
    const xpField = (auth.user as { xp_progress?: number })?.xp_progress;
    const numericXp = Number(xpField);
    if (Number.isFinite(numericXp)) {
      return Math.min(100, Math.max(0, numericXp));
    }
    return 48;
  }, [auth.user]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        href: "/posts/create",
        title: "Savol yoki issue ochish",
        description: "Savolingizni yozing va SolVera takliflari bilan birga nashr qiling.",
        icon: MessageCircle,
        accentClass: "text-[hsl(var(--primary))]",
        hoverClass: "hover:border-[hsl(var(--primary))]/60 hover:bg-[hsl(var(--primary))]/5",
        ctaLabel: "Savol yuborish",
        ctaClass: "text-[hsl(var(--primary))]",
      },
      {
        href: "/wiki",
        title: "Wiki bo'limini boyitish",
        description: "Atroflicha yechimlarni hujjatlashtirib, boshqalarga yo'l ko'rsating.",
        icon: BookOpen,
        accentClass: "text-[hsl(var(--accent-purple))]",
        hoverClass: "hover:border-[hsl(var(--accent-purple))]/60 hover:bg-[hsl(var(--accent-purple))]/5",
        ctaLabel: "Maqola yozish",
        ctaClass: "text-[hsl(var(--accent-purple))]",
      },
      {
        href: "/containers",
        title: "Laboratoriya muhiti",
        description: "Mini-serverlarda tajriba o'tkazing, kodlaringizni SolVera bilan sharhlang.",
        icon: Server,
        accentClass: "text-[hsl(var(--accent-green))]",
        hoverClass: "hover:border-[hsl(var(--accent-green))]/60 hover:bg-[hsl(var(--accent-green))]/5",
        ctaLabel: "Labga o'tish",
        ctaClass: "text-[hsl(var(--accent-green))]",
      },
      {
        href: "/leaderboard",
        title: "Mentorlarni toping",
        description: "Eng faol a'zolar va SolVera tavsiyalari bilan yo'nalishingizni toping.",
        icon: Users,
        accentClass: "text-[hsl(var(--secondary))]",
        hoverClass: "hover:border-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))]/5",
        ctaLabel: "Mentorlar",
        ctaClass: "text-[hsl(var(--secondary))]",
      },
    ],
    [],
  );

  if (loading) {
    return (
      <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <HomepageSkeleton />
      </main>
    );
  }

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {auth.isAuthenticated ? (
        <AuthenticatedHero
          auth={auth}
          statsCards={statsCards}
          xpProgress={xpProgress}
          quickActions={quickActions}
          trendingTags={trendingTags}
          heroFeed={heroFeed}
        />
      ) : (
        <GuestHero />
      )}

      <section className="max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4 rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))/40] bg-[hsl(var(--primary))/10] px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))]">
              SolVera
              <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))]">Beta</span>
            </div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] sm:text-3xl">Postlarni SolVera bilan jilolang</h2>
            <p className="text-sm text-muted-foreground">
              KnowHub jamoasining AI modeli yozganlaringizni silliqlaydi, CTAlarni boyitadi va kod sharhlarini tezkor taklif qiladi.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-border/80 bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--card))] p-4 text-sm shadow-sm">
                <p className="font-semibold text-[hsl(var(--foreground))]">Yozish va qayta yozish</p>
                <p className="text-xs text-[hsl(var(--foreground))]/80">Sarlavha, muammo bayoni va changelogni SolVera bilan tayyorlang.</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border/80 bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--card))] p-4 text-sm shadow-sm">
                <p className="font-semibold text-[hsl(var(--foreground))]">Kod uchun chaqmoq sharhlar</p>
                <p className="text-xs text-[hsl(var(--foreground))]/80">Snippetlaringizni tushuntirish yoki refaktor g'oyalarini olish.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/solvera"
                className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary))/25] transition hover:brightness-110"
              >
                SolVera haqida batafsil
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              >
                Post yaratish
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <SolveraChatCard context={{ surface: "homepage" }} />
        </div>
      </section>

      <section className="max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <SystemStatusWidget status={systemStatus} />
          <CodeRunnerCard />
        </div>
      </section>

      <GuidanceSection trendingTags={trendingTags} />

      <FeedSection
        sortType={sortType}
        onSortChange={setSortType}
        tabs={visibleTabs}
        postsQuery={postsQuery}
      />

      <TrendSignalsSection spotlightPost={spotlightPost} secondaryPosts={secondaryPosts} queuePosts={queuePosts} />

      <WeeklyHeroes heroes={heroes} className="hidden md:block" />

      <section id="community-feed" className="max-w-6xl px-6 pb-12 lg:px-8">
        <ActivityFeed feed={feed} />
      </section>

      {error && (
        <div className="mx-auto max-w-4xl rounded-[var(--radius-md)] border border-[hsl(var(--accent-pink))]/40 bg-[hsl(var(--accent-pink))]/10 p-6 text-sm text-[hsl(var(--accent-pink))] dark:border-[hsl(var(--accent-pink))]/50 dark:bg-[hsl(var(--accent-pink))]/15 dark:text-[hsl(var(--accent-pink))]">
          {error}
        </div>
      )}
    </main>
  );
}
