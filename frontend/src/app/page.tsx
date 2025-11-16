'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/LoadingSpinner";
import PostCard from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Code2,
  Medal,
  MessageCircle,
  PenSquare,
  Play,
  Rocket,
  Server,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import type { Post } from "@/types";

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

type HeroEntry = {
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    xp?: number;
  };
  total_xp?: number;
  total_score?: number;
  posts_count?: number;
};

type WeeklyHeroesResponse = {
  range?: {
    start: string;
    end: string;
  };
  xp?: HeroEntry[];
  post_authors?: HeroEntry[];
};

type ActivityEvent = {
  type: "post" | "comment" | "badge";
  id: string | number;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
  } | null;
  payload?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    post?: {
      id: number;
      slug: string;
      title: string;
    } | null;
    name?: string;
    icon?: string | null;
    xp_reward?: number;
  };
};

type ActivityFeedResponse = {
  data: ActivityEvent[];
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

type ServiceHealthStatus = "operational" | "degraded" | "outage";

type ServiceHealth = {
  name: string;
  status: ServiceHealthStatus;
  description: string;
  latency_ms?: number | null;
  checked_at?: string | null;
  details?: Record<string, unknown>;
};

type SystemStatusSummary = {
  services?: ServiceHealth[];
  metrics?: {
    uptime_seconds?: number | null;
    active_users?: number | null;
    queue_backlog?: number | null;
  };
  updated_at?: string | null;
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

const LANGUAGE_SNIPPETS: Record<string, string> = {
  javascript: `function greet(name) {\n  return \`Salom, \${name}!\`;\n}\n\nconsole.log(greet('KnowHub'));`,
  python: `def greet(name):\n    return f"Salom, {name}!"\n\nprint(greet("KnowHub"))`,
  php: `<?php\nfunction greet($name) {\n    return "Salom, {$name}!";\n}\n\necho greet('KnowHub');`,
};

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

async function getPosts(params: { sort: SortType }) {
  const sortParam = params.sort === "popular" ? "trending" : params.sort;
  const response = await api.get<PaginatedPostsResponse>("/posts", {
    params: { sort: sortParam, per_page: 6 },
  });
  return response.data;
}

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "—";

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days} kun`);
  if (hours) parts.push(`${hours} soat`);
  if (!days && minutes) parts.push(`${minutes} daq`);
  return parts.slice(0, 2).join(" ") || "<1 daq";
};

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

  const clean = raw.replace(/[#*_`>\-]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};

const timeAgo = (value?: string) => {
  if (!value) return "";
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "";
  const now = Date.now();
  const diffSeconds = Math.max(1, Math.floor((now - target) / 1000));
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
  ];

  let unit: Intl.RelativeTimeFormatUnit = "year";
  let valueDiff = diffSeconds;

  for (const [step, nextUnit] of units) {
    if (valueDiff < step) {
      unit = nextUnit;
      break;
    }
    valueDiff /= step;
    unit = nextUnit;
  }

  if (unit === "year" && valueDiff >= 12) {
    valueDiff /= 12;
  }

  const formatter = new Intl.RelativeTimeFormat("uz", { numeric: "auto" });
  return formatter.format(-Math.round(valueDiff), unit);
};

function CodeRunnerCard() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>(LANGUAGES[0].value);
  const [source, setSource] = useState<string>(LANGUAGE_SNIPPETS[LANGUAGES[0].value]);
  const [result, setResult] = useState<{ stdout?: string; stderr?: string; status?: string; message?: string } | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSource(LANGUAGE_SNIPPETS[language] ?? "");
  }, [language]);

  const handleRun = async () => {
    if (!user) {
      setResult({ message: "Kod ishga tushirish uchun tizimga kiring." });
      return;
    }

    if (!source.trim()) {
      setResult({ message: "Kod maydoni bo'sh." });
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const response = await api.post("/code-run", {
        language,
        source,
      });

      setResult({
        stdout: response.data.stdout,
        stderr: response.data.stderr,
        status: response.data.status,
      });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 429) {
        setResult({ message: "Siz belgilangan limitdan oshdingiz. Birozdan so'ng urinib ko'ring." });
      } else if (status === 401) {
        setResult({ message: "Kod ishga tushirish uchun tizimga kiring." });
      } else {
        setResult({ message: "Kod bajarishda xatolik yuz berdi." });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-[hsl(var(--card))]/70 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]">
          <Code2 className="h-4 w-4" />
          Live kod yurgizgich
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-border/60 bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground focus:border-[hsl(var(--primary))] focus:outline-none"
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Play className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
            {running ? "Bajarilmoqda" : "Run"}
          </button>
        </div>
      </div>
      <textarea
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
        className="min-h-[180px] flex-1 resize-none border-t border-border/40 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--surface))] to-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none"
      />
      <div className="border-t border-border/40 bg-[hsl(var(--card))]/80 px-4 py-3 text-sm text-muted-foreground">
        {result ? (
          <div className="space-y-2">
            {result.message && <p className="text-amber-300">{result.message}</p>}
            {result.stdout && (
              <pre className="whitespace-pre-wrap rounded-lg bg-[hsl(var(--background))] p-3 text-xs text-[hsl(var(--secondary))]">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="whitespace-pre-wrap rounded-lg bg-[hsl(var(--background))] p-3 text-xs text-rose-400">{result.stderr}</pre>
            )}
            {result.status && !result.message && (
              <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--primary))]">Holat: {result.status}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tizimga kirib, so'ng kodni ishga tushiring. Natijalar shu yerda paydo bo'ladi.
          </p>
        )}
      </div>
    </div>
  );
}

function SystemStatusWidget({ status }: { status: SystemStatusSummary | null }) {
  const services = status?.services ?? [];
  const metrics = status?.metrics ?? {};
  const updatedAt = status?.updated_at;

  const statusCopy: Record<ServiceHealthStatus, { label: string; className: string; icon: ReactNode }> = {
    operational: {
      label: "Barqaror",
      className: "bg-emerald-500/15 text-emerald-400",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    degraded: {
      label: "Sekin",
      className: "bg-amber-500/15 text-amber-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    outage: {
      label: "Nosoz",
      className: "bg-rose-500/15 text-rose-400",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  };

  const aggregateStatus = services.reduce<ServiceHealthStatus>((current, service) => {
    if (service.status === "outage") return "outage";
    if (service.status === "degraded" && current === "operational") return "degraded";
    return current;
  }, "operational");

  const badge = statusCopy[aggregateStatus];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-[hsl(var(--surface))] p-6 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Tizim holati</p>
          <h3 className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">Real vaqt nazorati</h3>
        </div>
        <Link
          href="/status"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
        >
          Ko'rish <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-[hsl(var(--card))]/90 px-4 py-3">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.icon}
          {badge.label}
        </div>
        <p className="text-xs text-muted-foreground">Yangilangan: {updatedAt ? new Date(updatedAt).toLocaleTimeString("uz-UZ") : "—"}</p>
      </div>
      <div className="mt-6 space-y-3">
        {(services.length ? services.slice(0, 3) : new Array(3).fill(null)).map((service, index) => {
          if (!service) {
            return <div key={`skeleton-${index}`} className="h-14 animate-pulse rounded-2xl bg-[hsl(var(--card))]/70" />;
          }
          const copy = statusCopy[service.status];
          return (
            <div key={service.name} className="flex items-center justify-between rounded-2xl border border-border bg-[hsl(var(--card))]/90 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${copy.className}`}>
                {copy.icon}
                {copy.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-3 text-center text-xs sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Faol a'zolar</p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatNumber(metrics.active_users)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Navbat</p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatNumber(metrics.queue_backlog)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Uptime</p>
          <p className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">{formatDuration(metrics.uptime_seconds)}</p>
        </div>
      </div>
    </div>
  );
}

function WeeklyHeroes({ heroes }: { heroes: WeeklyHeroesResponse | null }) {
  const xpLeaders = heroes?.xp ?? [];
  const authors = heroes?.post_authors ?? [];

  if (!xpLeaders.length && !authors.length) {
    return null;
  }

  return (
    <section className="max-w-6xl px-6 pb-16 lg:px-8">
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <Medal className="h-6 w-6 text-amber-400" />
          <h2 className="text-xl font-semibold">Hafta qahramonlari</h2>
        </div>
        {heroes?.range?.start && (
          <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            {new Date(heroes.range.start).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}
            {heroes.range.end
              ? ` — ${new Date(heroes.range.end).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}`
              : ""}
          </p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/80 p-6 shadow-sm transition dark:border-border/70 dark:bg-[hsl(var(--card))]/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-500">
            <Sparkles className="h-4 w-4" /> XP sprinti
          </h3>
          <ul className="space-y-3 text-sm">
            {xpLeaders.map((entry, index) => (
              <li
                key={`${entry.user.id}-xp`}
                className="flex items-center justify-between rounded-xl bg-[hsl(var(--surface))] px-3 py-2 dark:bg-[hsl(var(--card))]/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-cyan-600 dark:text-[hsl(var(--foreground))] dark:hover:text-cyan-300"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <span className="text-xs font-semibold text-cyan-500">+{formatNumber(entry.total_xp ?? 0)} XP</span>
              </li>
            ))}
            {!xpLeaders.length && <li className="text-xs text-muted-foreground">Hali XP bo'yicha ma'lumot yo'q.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/80 p-6 shadow-sm transition dark:border-border/70 dark:bg-[hsl(var(--card))]/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-500">
            <TrendingUp className="h-4 w-4" /> Trend mualliflar
          </h3>
          <ul className="space-y-3 text-sm">
            {authors.map((entry, index) => (
              <li
                key={`${entry.user.id}-authors`}
                className="flex items-center justify-between rounded-xl bg-[hsl(var(--surface))] px-3 py-2 dark:bg-[hsl(var(--card))]/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-indigo-500 dark:text-[hsl(var(--foreground))] dark:hover:text-indigo-300"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <div className="text-right text-xs text-muted-foreground dark:text-muted-foreground">
                  <p className="font-semibold text-indigo-500 dark:text-indigo-300">{formatNumber(entry.total_score ?? 0)} ovoz</p>
                  <p>{formatNumber(entry.posts_count ?? 0)} post</p>
                </div>
              </li>
            ))}
            {!authors.length && <li className="text-xs text-muted-foreground">Bu hafta trend mualliflar aniqlanmadi.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ActivityFeed({ feed }: { feed: ActivityEvent[] }) {
  if (!feed.length) {
    return null;
  }

  const iconForType = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4 text-emerald-400" />;
      case "badge":
        return <Medal className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-sky-400" />;
    }
  };

  const descriptionFor = (event: ActivityEvent) => {
    if (event.type === "post" && event.payload?.title) {
      return (
        <Link
          href={`/posts/${event.payload.slug ?? ""}`}
          className="font-medium text-[hsl(var(--foreground))] transition hover:text-cyan-600 dark:text-[hsl(var(--foreground))] dark:hover:text-cyan-300"
        >
          {event.payload.title}
        </Link>
      );
    }

    if (event.type === "comment" && event.payload?.post) {
      return (
        <div>
          <p className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">Izoh: {event.payload.post.title}</p>
          {event.payload.excerpt && <p className="text-xs text-muted-foreground dark:text-muted-foreground">{event.payload.excerpt}</p>}
        </div>
      );
    }

    if (event.type === "badge" && event.payload?.name) {
      return (
        <p className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">
          {event.payload.name}
          {typeof event.payload.xp_reward === "number" && (
            <span className="ml-2 text-xs font-semibold text-amber-500">+{event.payload.xp_reward} XP</span>
          )}
        </p>
      );
    }

    return <span className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">Faollik</span>;
  };

  return (
    <section className="max-w-6xl px-6 pb-20 lg:px-8">
      <div className="flex items-center gap-3 pb-6">
        <Activity className="h-6 w-6 text-cyan-500" />
        <h2 className="text-xl font-semibold">Hamjamiyat pulsi</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {feed.map((event) => (
          <div
            key={`${event.type}-${event.id}`}
            className="flex items-start gap-3 rounded-2xl border border-border/80 bg-[hsl(var(--card))]/80 p-4 shadow-sm transition hover:border-cyan-200/60 hover:shadow-lg dark:border-border/70 dark:bg-[hsl(var(--card))]/70"
          >
            <div className="mt-1 rounded-full bg-[hsl(var(--foreground))]/80 p-2 dark:bg-[hsl(var(--foreground))]/30">{iconForType(event.type)}</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                {event.user ? (
                  <Link
                    href={`/profile/${event.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-cyan-600 dark:text-muted-foreground dark:hover:text-cyan-300"
                  >
                    {event.user.name}
                  </Link>
                ) : (
                  <span className="font-medium text-muted-foreground">Anonim</span>
                )}
                <span>•</span>
                <span>{timeAgo(event.created_at)}</span>
              </div>
              {descriptionFor(event)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [homeStats, setHomeStats] = useState<HomepageStatsResponse | null>(null);
  const [heroes, setHeroes] = useState<WeeklyHeroesResponse | null>(null);
  const [feed, setFeed] = useState<ActivityEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      const issues: string[] = [];
      try {
        const [statsResult, heroesResult, feedResult, statusResult] = await Promise.allSettled([
          api.get<HomepageStatsResponse>("/stats/homepage"),
          api.get<WeeklyHeroesResponse>("/stats/weekly-heroes"),
          api.get<ActivityFeedResponse>("/activity-feed", { params: { limit: 12 } }),
          api.get<SystemStatusSummary>("/status/summary"),
        ]);

        if (statsResult.status === "fulfilled") {
          if (active) {
            setHomeStats(statsResult.value.data ?? null);
          }
        } else {
          issues.push("Bosh sahifa statistikasi yuklanmadi");
          if (active) {
            setHomeStats(null);
          }
        }

        if (heroesResult.status === "fulfilled") {
          if (active) {
            setHeroes(heroesResult.value.data ?? null);
          }
        } else if (active) {
          setHeroes(null);
        }

        if (feedResult.status === "fulfilled") {
          if (active) {
            setFeed(feedResult.value.data?.data ?? []);
          }
        } else if (active) {
          setFeed([]);
        }

        if (statusResult.status === "fulfilled") {
          if (active) {
            setSystemStatus(statusResult.value.data ?? null);
          }
        } else {
          issues.push("Tizim holati yangilanmadi");
          if (active) {
            setSystemStatus(null);
          }
        }
      } catch (err: any) {
        issues.push(err?.message ?? "Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        if (!active) {
          return;
        }
        setError(issues.length ? issues.join(". ") : null);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

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
        accentClass: "text-cyan-300",
      },
      {
        label: "A'zolar",
        value: homeStats?.stats?.users?.total,
        subtitle: "Faol hamjamiyat",
        icon: Users,
        accentClass: "text-emerald-300",
      },
      {
        label: "Wiki",
        value: homeStats?.stats?.wiki?.articles,
        subtitle: "Bilim maqolalari",
        icon: BookOpen,
        accentClass: "text-indigo-300",
      },
    ],
    [homeStats?.stats?.posts?.total, homeStats?.stats?.users?.total, homeStats?.stats?.wiki?.articles]
  );

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        href: "/posts/create",
        title: "Fikr almashish",
        description: "Muammolar va yechimlar bilan hamjamiyatni faollashtiring.",
        icon: PenSquare,
        accentClass: "text-cyan-600 dark:text-cyan-300",
        hoverClass: "hover:border-cyan-400/70 hover:shadow-lg",
        ctaLabel: "Boshlash",
        ctaClass: "text-cyan-500",
      },
      {
        href: "/leaderboard",
        title: "Liderlar taxtasi",
        description: "Eng faol mualliflar va jamoadoshlar bilan tanishing.",
        icon: Medal,
        accentClass: "text-indigo-600 dark:text-indigo-300",
        hoverClass: "hover:border-indigo-400/70 hover:shadow-lg",
        ctaLabel: "Reyting",
        ctaClass: "text-indigo-500",
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
      return <LoadingSpinner />;
    }

    if (postsIsError) {
      const postsErrorMessage =
        postsError instanceof Error ? postsError.message : "Postlarni yuklashda xatolik yuz berdi.";
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {postsErrorMessage}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="rounded-2xl border border-muted/40 bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground">
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

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="relative isolate overflow-hidden border-b border-border/50 bg-gradient-to-br from-[hsl(var(--primary))] via-[hsla(var(--secondary),0.85)] to-[hsl(var(--primary))] text-white">
        <div className="absolute inset-0 -z-10 opacity-70" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              KnowHub Community
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Zamonaviy hamjamiyat uchun kiber platforma.
            </h1>
            <p className="max-w-2xl text-base text-white/80 sm:text-lg">
              Tajribangizni ulashing, g'oyalaringizni mini-serverlarda sinang va real vaqt statistikasi bilan jamiyat pulsini kuzatib boring.
              KnowHub sizga barcha qulayliklarni bitta bosh sahifada taqdim etadi.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[hsl(var(--primary))] transition hover:opacity-90"
              >
                Yangi post yozish
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/containers"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20"
              >
                Mini-serverlarni boshlash
                <Server className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-xs text-white/75">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-xl border border-white/20 bg-white/5 p-4">
                    <div className={`flex items-center gap-2 ${card.accentClass}`}>
                      <Icon className="h-4 w-4" />
                      {card.label}
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(card.value)}</p>
                    <p>{card.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <CodeRunnerCard />
        </div>
      </section>

      <section className="max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex flex-col justify-between rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 text-[hsl(var(--foreground))] shadow-sm transition ${action.hoverClass}`}
                >
                  <div className={`flex items-center gap-3 text-sm font-semibold ${action.accentClass}`}>
                    <Icon className="h-5 w-5" />
                    {action.title}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
                  <span className={`mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${action.ctaClass}`}>
                    {action.ctaLabel} <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
          <SystemStatusWidget status={systemStatus} />
        </div>
      </section>

      <section className="max-w-6xl px-6 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-3xl border border-border bg-[hsl(var(--surface))] p-8 text-[hsl(var(--foreground))] shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Hamjamiyat vositalari</p>
            <h2 className="mt-3 text-2xl font-semibold">Bir xil estetikadagi ish oqimlari</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Har bir bo'limda bir xil rang palitrasi va radiuslardan foydalanib, loyihangizni tartibli saqlang.
            </p>
            <div className="mt-8 space-y-4">
              {builderHighlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <div
                    key={highlight.title}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-[hsl(var(--card))]/80 p-4 text-sm shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{highlight.title}</p>
                      <p className="text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Link
            href="/containers"
            className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--foreground))] to-[hsl(var(--primary))] p-8 text-[hsl(var(--foreground))] shadow-xl transition hover:shadow-2xl"
          >
            <div className="absolute inset-0 -z-10 opacity-80">
              <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
              <Server className="h-5 w-5" />
              O'z g'oyangizni sinang
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">Bir klikda shaxsiy mini serveringizni ishga tushiring.</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Izolyatsiyalangan Docker muhiti, resurs limitlari va xavfsizlik siyosatlari bilan tajribangizni real vaqt rejimida sinovdan o'tkazing.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-[hsl(var(--card))]/95 px-5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition group-hover:bg-white">
              Boshlash
              <Rocket className="h-4 w-4" />
            </div>
          </Link>
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
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <h2 className="text-xl font-semibold">Trend signallari</h2>
            </div>
            {spotlightPost ? (
              <Link
                href={`/posts/${spotlightPost.slug}`}
                className="group block overflow-hidden rounded-3xl border border-border bg-[hsl(var(--card))]/90 p-6 shadow-lg transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-100 dark:border-border dark:bg-[hsl(var(--foreground))]/80"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                  Spotlight
                  {spotlightPost.score ? <span className="text-emerald-400">{spotlightPost.score} ovoz</span> : null}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-[hsl(var(--foreground))] transition group-hover:text-emerald-500 dark:text-[hsl(var(--foreground))]">
                  {spotlightPost.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">{buildSnippet(spotlightPost, 220)}</p>
                {spotlightPost.user && <p className="mt-4 text-xs text-muted-foreground">Muallif: {spotlightPost.user.name}</p>}
              </Link>
            ) : (
              <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground dark:border-border dark:text-muted-foreground">
                Spotlight post mavjud emas.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group rounded-2xl border border-border bg-[hsl(var(--card))]/80 p-4 shadow-sm transition hover:border-emerald-300/70 hover:shadow-lg dark:border-border dark:bg-[hsl(var(--card))]/70"
                >
                  <h4 className="text-base font-semibold text-[hsl(var(--foreground))] transition group-hover:text-emerald-500 dark:text-[hsl(var(--foreground))]">{post.title}</h4>
                  <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">{buildSnippet(post, 120)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-500">
                    Batafsil <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-2xl border border-border bg-[hsl(var(--card))]/80 p-5 shadow-sm dark:border-border dark:bg-[hsl(var(--card))]/70">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Monitoring navbat</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {queuePosts.map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-transparent px-3 py-2 transition hover:border-emerald-300/60 hover:bg-emerald-50/40 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-medium text-[hsl(var(--foreground))] hover:text-emerald-500 dark:text-muted-foreground dark:hover:text-emerald-300"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                  </li>
                ))}
                {!queuePosts.length && <li className="text-xs text-muted-foreground">Keyingi postlar hali yo'q.</li>}
              </ul>
            </div>
            {!!trendingTags.length && (
              <div className="rounded-2xl border border-border bg-[hsl(var(--card))]/80 p-5 shadow-sm dark:border-border dark:bg-[hsl(var(--card))]/70">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Trend teglar</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {trendingTags.slice(0, 12).map((tag) => (
                    <span
                      key={tag.slug ?? tag.name}
                      className="rounded-full border border-border/60 bg-[hsl(var(--surface))] px-3 py-1 text-[hsl(var(--foreground))] dark:border-border dark:bg-[hsl(var(--card))]/60 dark:text-muted-foreground"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <WeeklyHeroes heroes={heroes} />

      <ActivityFeed feed={feed} />

      {error && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-300/60 bg-amber-50 p-6 text-sm text-amber-700 dark:border-amber-400/50 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-[hsl(var(--card))]/80 p-6 text-sm text-muted-foreground shadow-sm dark:border-border dark:bg-[hsl(var(--card))]/70 dark:text-muted-foreground">
          Ma'lumotlar yuklanmoqda...
        </div>
      )}
    </main>
  );
}
