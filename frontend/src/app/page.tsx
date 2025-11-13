"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
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

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "—";

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
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/40 bg-slate-950/40 shadow-xl backdrop-blur dark:border-slate-700/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
          <Code2 className="h-4 w-4" />
          Live kod yurgizgich
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-cyan-300/40 bg-slate-900/60 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-cyan-100 focus:border-cyan-200 focus:outline-none"
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
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-800/50 disabled:text-cyan-200"
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
        className="min-h-[180px] flex-1 resize-none border-t border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-3 text-sm text-slate-100 focus:outline-none"
      />
      <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
        {result ? (
          <div className="space-y-2">
            {result.message && <p className="text-amber-300">{result.message}</p>}
            {result.stdout && (
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/80 p-3 text-xs text-emerald-300">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/80 p-3 text-xs text-rose-300">{result.stderr}</pre>
            )}
            {result.status && !result.message && (
              <p className="text-xs uppercase tracking-wider text-cyan-300">Holat: {result.status}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Tizimga kirib, so'ng kodni ishga tushiring. Natijalar shu yerda paydo bo'ladi.
          </p>
        )}
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
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {new Date(heroes.range.start).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}
            {heroes.range.end ? ` — ${new Date(heroes.range.end).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}` : ""}
          </p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition dark:border-slate-700/70 dark:bg-slate-900/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-500">
            <Sparkles className="h-4 w-4" /> XP sprinti
          </h3>
          <ul className="space-y-3 text-sm">
            {xpLeaders.map((entry, index) => (
              <li key={entry.user.id} className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-slate-900 transition hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <span className="text-xs font-semibold text-cyan-500">+{formatNumber(entry.total_xp ?? 0)} XP</span>
              </li>
            ))}
            {!xpLeaders.length && <li className="text-xs text-slate-500">Hali XP bo'yicha ma'lumot yo'q.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition dark:border-slate-700/70 dark:bg-slate-900/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-500">
            <TrendingUp className="h-4 w-4" /> Trend mualliflar
          </h3>
          <ul className="space-y-3 text-sm">
            {authors.map((entry, index) => (
              <li key={entry.user.id} className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/70">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-slate-900 transition hover:text-indigo-500 dark:text-slate-100 dark:hover:text-indigo-300"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-slate-300">
                  <p className="font-semibold text-indigo-500 dark:text-indigo-300">{formatNumber(entry.total_score ?? 0)} ovoz</p>
                  <p>{formatNumber(entry.posts_count ?? 0)} post</p>
                </div>
              </li>
            ))}
            {!authors.length && <li className="text-xs text-slate-500">Bu hafta trend mualliflar aniqlanmadi.</li>}
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
          className="font-medium text-slate-900 transition hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
        >
          {event.payload.title}
        </Link>
      );
    }

    if (event.type === "comment" && event.payload?.post) {
      return (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">Izoh: {event.payload.post.title}</p>
          {event.payload.excerpt && <p className="text-xs text-slate-500 dark:text-slate-400">{event.payload.excerpt}</p>}
        </div>
      );
    }

    if (event.type === "badge" && event.payload?.name) {
      return (
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {event.payload.name}
          {typeof event.payload.xp_reward === "number" && (
            <span className="ml-2 text-xs font-semibold text-amber-500">+{event.payload.xp_reward} XP</span>
          )}
        </p>
      );
    }

    return <span className="font-medium text-slate-900 dark:text-slate-100">Faollik</span>;
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
            className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition hover:border-cyan-200/60 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/70"
          >
            <div className="mt-1 rounded-full bg-slate-900/80 p-2 dark:bg-slate-800/80">{iconForType(event.type)}</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {event.user ? (
                  <Link
                    href={`/profile/${event.user.username}`}
                    className="font-medium text-slate-700 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300"
                  >
                    {event.user.name}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-500">Anonim</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      const issues: string[] = [];
      try {
        const [statsResult, heroesResult, feedResult] = await Promise.allSettled([
          api.get<HomepageStatsResponse>("/stats/homepage"),
          api.get<WeeklyHeroesResponse>("/stats/weekly-heroes"),
          api.get<ActivityFeedResponse>("/activity-feed", { params: { limit: 12 } }),
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

  const latestPosts = homeStats?.latest_posts ?? [];
  const spotlightPost = latestPosts[0];
  const secondaryPosts = latestPosts.slice(1, 4);
  const queuePosts = latestPosts.slice(4, 9);
  const trendingTags = homeStats?.trending_tags ?? [];

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="relative isolate overflow-hidden border-b border-slate-200/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 -z-10 opacity-60" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(244,114,182,0.12),_transparent_55%)]" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              KnowHub Community
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Zamonaviy hamjamiyat uchun kiber platforma.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Tajribangizni ulashing, g'oyalaringizni mini-serverlarda sinang va real vaqt statistikasi bilan jamiyat pulsini kuzatib boring.
              KnowHub sizga barcha qulayliklarni bitta bosh sahifada taqdim etadi.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Yangi post yozish
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/containers"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
              >
                Mini-serverlarni boshlash
                <Server className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <PenSquare className="h-4 w-4" />
                  Postlar
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(homeStats?.stats?.posts?.total)}</p>
                <p>Umumiy maqolalar</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Users className="h-4 w-4" />
                  A'zolar
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(homeStats?.stats?.users?.total)}</p>
                <p>Faol hamjamiyat</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-indigo-300">
                  <BookOpen className="h-4 w-4" />
                  Wiki
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(homeStats?.stats?.wiki?.articles)}</p>
                <p>Bilim maqolalari</p>
              </div>
            </div>
          </div>
          <CodeRunnerCard />
        </div>
      </section>

      <section className="max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/posts/create"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:border-cyan-400/70 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="flex items-center gap-3 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
                <PenSquare className="h-5 w-5" />
                Fikr almashish
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                Muammolar va yechimlar bilan hamjamiyatni faollashtiring.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-500">
                Boshlash <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            <Link
              href="/wiki"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:border-indigo-400/70 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="flex items-center gap-3 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                <BookOpen className="h-5 w-5" />
                Wiki'ni boyiting
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                Yangi maqola va tajribalarni qo'shib, bilim bazasini kengaytiring.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Ko'rish <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <Link
            href="/containers"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 text-slate-100 shadow-xl transition hover:shadow-2xl dark:border-slate-700"
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
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              Izolyatsiyalangan Docker muhiti, resurs limitlari va xavfsizlik siyosatlari bilan tajribangizni real vaqt rejimida sinovdan o'tkazing.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition group-hover:bg-slate-200">
              Boshlash
              <Rocket className="h-4 w-4" />
            </div>
          </Link>
        </div>
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
                className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-100 dark:border-slate-700 dark:bg-slate-900/80"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                  Spotlight
                  {spotlightPost.score ? <span className="text-emerald-400">{spotlightPost.score} ovoz</span> : null}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900 transition group-hover:text-emerald-500 dark:text-slate-100">
                  {spotlightPost.title}
                </h3>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{buildSnippet(spotlightPost, 220)}</p>
                {spotlightPost.user && <p className="mt-4 text-xs text-slate-400">Muallif: {spotlightPost.user.name}</p>}
              </Link>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Spotlight post mavjud emas.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-emerald-300/70 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <h4 className="text-base font-semibold text-slate-900 transition group-hover:text-emerald-500 dark:text-slate-100">{post.title}</h4>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{buildSnippet(post, 120)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-500">
                    Batafsil <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">Monitoring navbat</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {queuePosts.map((post) => (
                  <li
                    key={post.id}
                    className="rounded-xl border border-transparent px-3 py-2 transition hover:border-emerald-300/60 hover:bg-emerald-50/40 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-medium text-slate-700 hover:text-emerald-500 dark:text-slate-200 dark:hover:text-emerald-300"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
                  </li>
                ))}
                {!queuePosts.length && <li className="text-xs text-slate-500">Keyingi postlar hali yo'q.</li>}
              </ul>
            </div>
            {!!trendingTags.length && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Trend teglar</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {trendingTags.slice(0, 12).map((tag) => (
                    <span
                      key={tag.slug ?? tag.name}
                      className="rounded-full border border-slate-200/60 bg-slate-100/70 px-3 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
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
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          Ma'lumotlar yuklanmoqda...
        </div>
      )}
    </main>
  );
}
