'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { CodeRunnerCard } from "@/components/home/CodeRunnerCard";
import { SystemStatusWidget } from "@/components/home/SystemStatusWidget";
import { WeeklyHeroes } from "@/components/home/WeeklyHeroes";
import type {
  ActivityEvent,
  SystemStatusSummary,
  WeeklyHeroesResponse,
} from "@/components/home/types";
import { formatNumber, timeAgo } from "@/components/home/utils";
import { SolveraChatCard } from "@/components/SolveraChatCard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import type { Post } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowRight, BookOpen, Medal, MessageCircle, PenSquare, Server, Sparkles, TrendingUp, Users } from "lucide-react";

type PostSummary = Pick<Post, "id" | "slug" | "title" | "content_markdown" | "score" | "created_at" | "user"> & {
  excerpt?: string;
  summary?: string;
  content_preview?: string;
  content?: string;
};

type TagSummary = {
  id?: number;
  name: string;
  slug: string;
  usage_count?: number;
};

type ActivityFeedResponse = {
  data: ActivityEvent[];
};

type HomepageStatsResponse = {
  stats?: {
    users?: {
      total?: number;
      active_today?: number;
      new_this_week?: number;
    };
    posts?: {
      total?: number;
      today?: number;
      this_week?: number;
    };
    comments?: {
      total?: number;
      today?: number;
    };
    wiki?: {
      articles?: number;
    };
  };
  trending_posts?: PostSummary[];
  latest_posts?: PostSummary[];
  trending_tags?: TagSummary[];
  featured_post?: PostSummary | null;
};

type StatCard = {
  label: string;
  value?: number;
  subtitle: string;
  icon: LucideIcon;
  accentClass: string;
};

type QuickAction = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  hoverClass: string;
  ctaLabel: string;
  ctaClass: string;
};

type PaginatedPostsResponse = {
  data: Post[];
  meta?: Record<string, unknown>;
};

type SortType = "latest" | "popular" | "following";

type FeedTab = {
  value: SortType;
  label: string;
  authOnly?: boolean;
};

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

const buildSnippet = (post: PostSummary, length = 160) => {
  const raw =
    post.excerpt ??
    post.summary ??
    post.content_preview ??
    post.content_markdown ??
    post.content ??
    "";

  if (!raw) {
    return "";
  }

  const sanitized = raw.replace(/<[^>]*>?/g, "");
  const clean = sanitized.replace(/[#*_`>\-]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};

type HomepageDataState = {
  homeStats: HomepageStatsResponse | null;
  heroes: WeeklyHeroesResponse | null;
  feed: ActivityEvent[];
  systemStatus: SystemStatusSummary | null;
  loading: boolean;
  error: string | null;
};

const initialHomepageState: HomepageDataState = {
  homeStats: null,
  heroes: null,
  feed: [],
  systemStatus: null,
  loading: true,
  error: null,
};

function useHomepageData(): HomepageDataState {
  const [state, setState] = useState<HomepageDataState>(initialHomepageState);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      const issues: string[] = [];
      try {
        const [statsResult, heroesResult, feedResult, statusResult] = await Promise.allSettled([
          api.get<HomepageStatsResponse>("/stats/homepage"),
          api.get<WeeklyHeroesResponse>("/stats/weekly-heroes"),
          api.get<ActivityFeedResponse>("/activity-feed", { params: { limit: 12 } }),
          api.get<SystemStatusSummary>("/status/summary"),
        ]);

        if (!active) return;

        setState((prev) => ({
          ...prev,
          homeStats: statsResult.status === "fulfilled" ? statsResult.value.data ?? null : null,
          heroes: heroesResult.status === "fulfilled" ? heroesResult.value.data ?? null : null,
          feed: feedResult.status === "fulfilled" ? feedResult.value.data?.data ?? [] : [],
          systemStatus: statusResult.status === "fulfilled" ? statusResult.value.data ?? null : null,
        }));

        if (statsResult.status !== "fulfilled") issues.push("Bosh sahifa statistikasi yuklanmadi");
        if (statusResult.status !== "fulfilled") issues.push("Tizim holati yangilanmadi");
      } catch (err: unknown) {
        issues.push(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        if (active) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: issues.length ? issues.join(". ") : null,
          }));
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}

function HomepageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-4 rounded-[32px] border border-border/60 bg-[hsl(var(--card))]/70 p-8 shadow-[0_25px_75px_rgba(15,23,42,0.08)] backdrop-blur animate-pulse">
          <div className="h-6 w-40 rounded-full bg-muted/30" />
          <div className="h-10 w-3/4 rounded-full bg-muted/30" />
          <div className="h-4 w-5/6 rounded-full bg-muted/20" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`hero-stat-${index}`} className="h-20 rounded-[var(--radius-md)] bg-muted/20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/70 shadow-lg backdrop-blur animate-pulse" />
          <div className="h-32 rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/70 shadow-lg backdrop-blur animate-pulse" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`skeleton-card-${index}`} className="h-64 rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/60 shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { homeStats, heroes, feed, systemStatus, loading, error } = useHomepageData();
  const [sortType, setSortType] = useState<SortType>("latest");
  const auth = useAuth();

  const {
    data: postsResponse,
    isLoading: postsLoading,
    isError: postsIsError,
    error: postsError,
  } = useQuery<PaginatedPostsResponse>({
    queryKey: ["posts", sortType],
    queryFn: () => getPosts({ sort: sortType }),
  });

  const posts = postsResponse?.data ?? [];

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
    [homeStats?.stats?.posts?.total, homeStats?.stats?.users?.total, homeStats?.stats?.wiki?.articles]
  );

  const heroFeed = useMemo(() => feed.slice(0, 3), [feed]);
  const heroTags = useMemo(() => trendingTags.slice(0, 3), [trendingTags]);
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
    []
  );

  const builderHighlights = useMemo(
    () => [
      {
        title: "Faol monitoring",
        description: "Trendlar, ovozlar va mini hodisalarni real vaqt rejimida kuzating.",
        icon: Activity,
      },
      {
        title: "Jamiyat bilan tez aloqa",
        description: "Izohlar va chatlardan foydalanib, g'oyalarga zudlik bilan javob bering.",
        icon: MessageCircle,
      },
      {
        title: "Hamkorlik rejimlari",
        description: "Guruhlaringizga mos bo'limlar va navbatchilik ro'yxatlari bilan ishlang.",
        icon: Users,
      },
    ],
    []
  );

  const renderPostsGrid = () => {
    if (postsLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <PostCard key={`post-skeleton-${index}`} variant="skeleton" />
          ))}
        </div>
      );
    }

    if (postsIsError) {
      const postsErrorMessage =
        postsError instanceof Error ? postsError.message : "Postlarni yuklashda xatolik yuz berdi.";
      return (
        <div className="rounded-[var(--radius-md)] border border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/10 px-6 py-8 text-sm text-[hsl(var(--destructive))] dark:border-[hsl(var(--destructive))]/50 dark:bg-[hsl(var(--destructive))]/15 dark:text-[hsl(var(--destructive-foreground))]">
          {postsErrorMessage}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="rounded-[var(--radius-md)] border border-muted/40 bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground">
          Hozircha postlar topilmadi.
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <HomepageSkeleton />
      </main>
    );
  }

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {auth.isAuthenticated && (
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
                      <div key={card.label} className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--surface))] p-4 shadow-sm dark:border-border/60 dark:bg-[hsl(var(--card))]/70">
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
                          className={`group flex flex-col justify-between rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))] p-4 text-[hsl(var(--foreground))] shadow-sm transition ${action.hoverClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`rounded-xl bg-[hsl(var(--foreground))]/5 p-2 ${action.accentClass}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="text-sm font-semibold">{action.title}</div>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{action.description}</p>
                          <span className={`mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${action.ctaClass}`}>
                            {action.ctaLabel} <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-lg backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[hsl(var(--foreground))]">Joriy faollik</p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/60 bg-[hsl(var(--primary))]/18 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))] shadow-sm">
                      <Sparkles className="h-4 w-4" />
                      Live
                    </div>
                  </div>
                  <div className="mt-4">
                    {heroFeed.length ? (
                      <ActivityFeed feed={heroFeed} variant="compact" limit={3} />
                    ) : (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`activity-skeleton-${index}`}
                            className="h-16 animate-pulse rounded-[var(--radius-md)] border border-dashed border-border/60 bg-[hsl(var(--surface))]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
              <div className="rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Mening kuzatishim</p>
                  <Link href="/following" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
                    Obunalar
                  </Link>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Saqlangan yoki kuzatib borayotgan muhokamalaringizga tez qayting.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {heroTags.length ? (
                    heroTags.map((tag) => (
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
      )}

      {!auth.isAuthenticated && (
        <section className="relative isolate overflow-hidden border-b border-border/40 bg-[hsl(var(--surface))]">
          <div className="absolute inset-0 -z-10 opacity-90" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsla(198,93%,60%,0.25),_transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_hsla(154,82%,58%,0.22),_transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-8 rounded-[var(--radius-md)] border border-border/60 bg-[hsl(var(--card))] p-8 shadow-[0_25px_75px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface))] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                SolVera kuchaytirgan hamjamiyat
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-[hsl(var(--foreground))] sm:text-5xl">
                <TypewriterText
                  phrases={["Bugun nimani o'rganamiz?", "KnowHub Community: Dasturchilar Uchun Yangi Maydon"]}
                  className="block"
                />
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Bilim ulashing, loyihalar yarating, hamjamiyat bilan rivojlaning. SolVera yozganlaringizni jilolab, savolingizni aniq ifodalashga yordam beradi.
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
                  <Link href="/wiki">
                    Wiki'ni ko'rish
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid max-w-xl grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                {statsCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--surface))] p-4 shadow-sm dark:border-border/60 dark:bg-[hsl(var(--card))]/70">
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
            </div>
            <div className="space-y-5">
              <div className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Tezkor backlog</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))]">Builder mode</span>
                </div>
                <div className="mt-6 space-y-3">
                  {builderHighlights.map((highlight) => {
                    const Icon = highlight.icon;
                    return (
                      <div key={highlight.title} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border/60 bg-[hsl(var(--card))] p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{highlight.title}</p>
                          <p className="text-sm text-muted-foreground">{highlight.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-lg backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-muted-foreground">Hamjamiyatning jonli muhokamalari</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {heroTags.length ? (
                      heroTags.map((tag) => (
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
                <div className="mt-4">
                  {heroFeed.length ? (
                    <ActivityFeed feed={heroFeed} variant="compact" limit={4} />
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`activity-compact-skeleton-${index}`}
                          className="h-16 animate-pulse rounded-[var(--radius-md)] border border-dashed border-border/70 bg-[hsl(var(--card))]"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
              KnowHub jamoasining gtp-5 asosidagi modeli yozganlaringizni silliqlaydi, CTAlarni boyitadi va kod sharhlarini tezkor taklif qiladi.
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

      <section className="max-w-6xl px-6 pb-12 lg:px-8">
        <Tabs value={sortType} onValueChange={(value) => setSortType(value as SortType)} className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Postlar</p>
              <h2 className="text-2xl font-semibold text-foreground">Hamjamiyat lentasi</h2>
              <p className="text-sm text-muted-foreground">
                Turli saralashlarga o'tib eng so'nggi, trenddagi yoki obunangizdagi muhokamalarni kuzating.
              </p>
            </div>
            <TabsList className="flex w-full flex-wrap gap-2 rounded-full border border-muted/30 bg-muted/20 p-1 sm:w-auto">
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="px-5 py-2 text-sm font-semibold">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {visibleTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {renderPostsGrid()}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="max-w-6xl px-6 pb-16 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-[hsl(var(--secondary))]" />
          <h2 className="text-xl font-semibold">Trend signallari</h2>
        </div>
        {spotlightPost ? (
          <Link
            href={`/posts/${spotlightPost.slug}`}
            className="group block overflow-hidden rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/90 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[hsl(var(--secondary))]/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] dark:border-border dark:bg-[hsl(var(--foreground))]/80"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--secondary))]">
              Spotlight
              {spotlightPost.score ? <span className="text-[hsl(var(--secondary))]">{spotlightPost.score} ovoz</span> : null}
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[hsl(var(--foreground))] transition group-hover:text-[hsl(var(--secondary))] dark:text-[hsl(var(--foreground))]">
              {spotlightPost.title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">{buildSnippet(spotlightPost, 220)}</p>
                {spotlightPost.user && <p className="mt-4 text-xs text-muted-foreground">Muallif: {spotlightPost.user.name}</p>}
              </Link>
            ) : (
              <div className="rounded-[var(--radius-md)] border border-dashed border-border p-10 text-center text-sm text-muted-foreground dark:border-border dark:text-muted-foreground">
                Spotlight post mavjud emas.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-4 shadow-sm transition hover:border-[hsl(var(--secondary))]/60 hover:shadow-lg dark:border-border dark:bg-[hsl(var(--card))]/70"
                >
                  <h4 className="text-base font-semibold text-[hsl(var(--foreground))] transition group-hover:text-[hsl(var(--secondary))] dark:text-[hsl(var(--foreground))]">{post.title}</h4>
                  <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">{buildSnippet(post, 120)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-[hsl(var(--secondary))]">
                    Batafsil <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-5 shadow-sm dark:border-border dark:bg-[hsl(var(--card))]/70">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Monitoring navbat</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {queuePosts.map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-transparent px-3 py-2 transition hover:border-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))]/10 dark:hover:border-[hsl(var(--secondary))]/50 dark:hover:bg-[hsl(var(--secondary))]/15"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] dark:text-muted-foreground dark:hover:text-[hsl(var(--secondary))]"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                  </li>
                ))}
                {!queuePosts.length && <li className="text-xs text-muted-foreground">Keyingi postlar hali yo'q.</li>}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <WeeklyHeroes heroes={heroes} className="hidden md:block" />

      <ActivityFeed feed={feed} />

      {error && (
        <div className="mx-auto max-w-4xl rounded-[var(--radius-md)] border border-[hsl(var(--accent-pink))]/40 bg-[hsl(var(--accent-pink))]/10 p-6 text-sm text-[hsl(var(--accent-pink))] dark:border-[hsl(var(--accent-pink))]/50 dark:bg-[hsl(var(--accent-pink))]/15 dark:text-[hsl(var(--accent-pink))]">
          {error}
        </div>
      )}

    </main>
  );
}
