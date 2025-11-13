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
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  PenSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";

interface StatShape {
  postsCount?: number;
  usersCount?: number;
  topTags?: string[];
}

interface PostShort {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content_preview?: string;
  content_markdown?: string;
  content?: string;
  created_at?: string;
  score?: number;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
  };
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
  slug?: string;
  user?: any;
}

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "—";

const buildSnippet = (post: PostShort, length = 160) => {
  const raw =
    post.excerpt ??
    (post as any)?.summary ??
    (post as any)?.content_preview ??
    (post as any)?.content_markdown ??
    (post as any)?.content ??
    "";

  if (typeof raw !== "string" || raw.length === 0) {
    return "";
  }

  const clean = raw.replace(/[#*_`>\-]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};

const LANGUAGE_SNIPPETS: Record<string, string> = {
  javascript: `function greet(name) {\n  return \`Salom, ${"${name}"}!\`;\n}\n\nconsole.log(greet('KnowHub'));
`,
  python: `def greet(name):\n    return f"Salom, {name}!"\n\nprint(greet("KnowHub"))
`,
  php: `<?php\nfunction greet($name) {\n    return "Salom, {$name}!";\n}\n\necho greet('KnowHub');
`,
};

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "—";

const buildSnippet = (post: PostShort, length = 160) => {
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
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/80 p-3 text-xs text-emerald-300">
                {result.stdout}
              </pre>
            )}
            {result.stderr && (
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/80 p-3 text-xs text-rose-300">
                {result.stderr}
              </pre>
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
                <span className="text-xs font-semibold text-cyan-500">
                  +{formatNumber(entry.total_xp ?? 0)} XP
                </span>
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
                  <p className="font-semibold text-indigo-500 dark:text-indigo-300">
                    {formatNumber(entry.total_score ?? 0)} ovoz
                  </p>
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
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Izoh: {event.payload.post.title}
          </p>
          {event.payload.excerpt && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{event.payload.excerpt}</p>
          )}
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
            <div className="mt-1 rounded-full bg-slate-900/80 p-2 dark:bg-slate-800/80">
              {iconForType(event.type)}
            </div>
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
  const [homeStats, setHomeStats] = useState<any | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<PostShort[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostShort[]>([]);
  const [heroes, setHeroes] = useState<WeeklyHeroesResponse | null>(null);
  const [feed, setFeed] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  const quickActions = useMemo(
    () => [
      {
        title: "Fikr almashish",
        description: "Tajriba, savol yoki yechim bilan hamjamiyatni ilhomlantiring.",
        href: "/posts/create",
        icon: PenSquare,
        accent:
          "border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_25px_-12px_rgba(34,211,238,0.8)]",
      },
      {
        title: "Mini serverni ishga tushiring",
        description: "Ajratilgan resurslarda g'oyangizni sinovdan o'tkazing.",
        href: "/containers",
        icon: Zap,
        accent:
          "border-purple-500/40 bg-purple-500/10 text-purple-100 shadow-[0_0_25px_-12px_rgba(168,85,247,0.8)]",
      },
      {
        title: "Wiki'ni boyiting",
        description: "Jamiyat bilim bazasiga maqola yoki taklif qo'shing.",
        href: "/wiki",
        icon: Compass,
        accent:
          "border-sky-500/40 bg-sky-500/10 text-sky-100 shadow-[0_0_25px_-12px_rgba(56,189,248,0.8)]",
      },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [statsRes, heroesRes, feedRes] = await Promise.all([
          api.get("/stats/homepage").catch(() => ({ data: null })),
          api.get("/stats/weekly-heroes").catch(() => ({ data: null })),
          api.get("/activity-feed", { params: { limit: 12 } }).catch(() => ({ data: { data: [] } })),
        ]);

        if (!mounted) return;

        setHomeStats(statsRes.data ?? null);
        setTrendingPosts((statsRes.data?.trending_posts ?? []) as PostShort[]);
        setLatestPosts((statsRes.data?.latest_posts ?? []) as PostShort[]);
        setHeroes(heroesRes.data ?? null);
        setFeed((feedRes.data?.data ?? []) as ActivityEvent[]);
        setStats(sRes.data ?? null);

        const trendingData = Array.isArray(tRes.data)
          ? tRes.data
          : tRes.data?.data ?? tRes.data?.posts ?? [];
        setTrending(trendingData.slice(0, 5));

        const postsData = Array.isArray(pRes.data)
          ? pRes.data
          : pRes.data?.data ?? pRes.data?.posts ?? [];
        setPosts(postsData.slice(0, 8));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const spotlightPost = latestPosts[0];
  const secondaryPosts = latestPosts.slice(1, 4);
  const queuePosts = latestPosts.slice(4, 9);
  const trendingTags: any[] = homeStats?.trending_tags ?? [];

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
                href="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                So'nggi yangiliklar
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <PenSquare className="h-4 w-4" />
                  Postlar
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(homeStats?.stats?.posts?.total)}
                </p>
                <p>Umumiy maqolalar</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Users className="h-4 w-4" />
                  A'zolar
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(homeStats?.stats?.users?.total)}
                </p>
                <p>Faol hamjamiyat</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-indigo-300">
                  <BookOpen className="h-4 w-4" />
                  Wiki
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(homeStats?.stats?.wiki?.articles)}
                </p>
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
            <h2 className="mt-6 text-2xl font-semibold text-white">
              Bir klikda shaxsiy mini serveringizni ishga tushiring.
            </h2>
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
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                  {buildSnippet(spotlightPost, 220)}
                </p>
                {spotlightPost.user && (
                  <p className="mt-4 text-xs text-slate-400">
                    Muallif: {spotlightPost.user.name}
                  </p>
                )}
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
                  <h4 className="text-base font-semibold text-slate-900 transition group-hover:text-emerald-500 dark:text-slate-100">
                    {post.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                    {buildSnippet(post, 120)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-500">
                    Batafsil <ArrowRight className="h-3 w-3" />
                  </span>
  useEffect(() => {
    if (!stats?.topTags || stats.topTags.length < 2) {
      return;
    }

    const id = window.setInterval(() => {
      setActiveTagIndex((index) => (index + 1) % stats.topTags!.length);
    }, 3200);

    return () => window.clearInterval(id);
  }, [stats?.topTags]);

  const activeTag = stats?.topTags?.[activeTagIndex];
  const spotlightPost = posts[0];
  const spotlightSnippet = spotlightPost ? buildSnippet(spotlightPost, 220) : "";
  const supportingPosts = posts.slice(1, 5);
  const archivePosts = posts.slice(5, 8);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan-500/30 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[8%] h-[380px] w-[380px] rounded-full bg-purple-500/20 blur-[140px]" />
        <div className="absolute inset-x-0 top-40 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative flex flex-col gap-20 pb-24">
        <header className="px-6 pt-16 sm:pt-20">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-9">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/70">
                KnowHub 2.0
              </span>
              <div className="space-y-5">
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Texnologik hamjamiyat uchun strategik bosh sahifa.
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  Yangi g'oyalarni baham ko'ring, mini serverlarda sinovdan o'tkazing va hamjamiyatning tajribasidan ilhom oling. Hammasi bir joyda, fokus va ritmni yo'qotmagan holda.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/posts/create"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                >
                  Yangi post yozish
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  So'nggi postlar
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  {formatNumber(stats?.postsCount)}+ postlar
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Hamjamiyat: {formatNumber(stats?.usersCount)}+
                </span>
                {activeTag && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Trend tegi: #{activeTag}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Samaradorlik paneli</p>
                  <p className="mt-2 text-lg font-semibold text-white">Hamjamiyat pulsini kuzating</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] text-white/60">
                  {loading ? "Yangilanmoqda" : "Real-time"}
                </span>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-16 rounded-2xl border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1120] px-4 py-4">
                    <span className="text-sm text-slate-300">Faol ijodkorlar</span>
                    <span className="text-2xl font-semibold text-white">{formatNumber(stats?.usersCount)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1120] px-4 py-4">
                    <span className="text-sm text-slate-300">Jamiyatdagi postlar</span>
                    <span className="text-2xl font-semibold text-white">{formatNumber(stats?.postsCount)}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1120] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Trend teglari</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stats?.topTags?.length ? (
                        stats.topTags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">Hali teglarga oid ma'lumot yo'q.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">So‘nggi missiyalar</h2>
                <p className="text-sm text-white/60">
                  Hamjamiyat a’zolari ayni damda nimalar yaratmoqda — eng yangi postlar.
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-white/40">
                {loading ? "Yuklanmoqda" : `${posts.length} ta post`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {loading && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/50">
                  So‘nggi signallarni qabul qilmoqdamiz…
                </div>
              )}
              {!loading && posts.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/60">
                  Hozircha missiyalar mavjud emas. Birinchi bo‘lib boshlang!
                </div>
              )}
              {!loading &&
                posts.map((p) => (
                  <div key={p.id} className="group relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <PostCard post={p as any} />
                  </div>
                ))}
            </div>
          </div>
        </header>

        <section className="px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Mission rejimi</h2>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Profil paneliga o'tish
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group flex flex-col gap-3 rounded-2xl border px-5 py-6 transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-[0_20px_45px_-25px_rgba(15,118,230,0.8)] ${action.accent}`}
                >
                  <div className="flex items-center justify-between">
                    <action.icon className="h-5 w-5" />
                    <ArrowUpRight className="h-4 w-4 text-current opacity-60 transition group-hover:translate-x-1" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-base font-semibold text-white">{action.title}</p>
                    <p className="text-slate-200/80">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
                Monitoring navbat
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {queuePosts.map((post) => (
                  <li key={post.id} className="rounded-xl border border-transparent px-3 py-2 transition hover:border-emerald-300/60 hover:bg-emerald-50/40 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-medium text-slate-700 hover:text-emerald-500 dark:text-slate-200 dark:hover:text-emerald-300"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {timeAgo(post.created_at)}
                    </p>
                  </li>
                ))}
                {!queuePosts.length && <li className="text-xs text-slate-500">Keyingi postlar hali yo'q.</li>}
              </ul>
            </div>
            {!!trendingTags.length && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Trend teglar</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {trendingTags.slice(0, 12).map((tag: any) => (
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
        </section>

        <section className="px-6">
          <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.85fr,1.15fr]">
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Trend signallari</h2>
                <Link
                  href="/posts?sort=trending"
                  className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
                >
                  Barchasini ko'rish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {trending.length === 0 && !loading ? (
                  <p className="text-sm text-slate-400">Hozircha trend postlar aniqlanmadi.</p>
                ) : (
                  trending.map((post, index) => {
                    const snippet = buildSnippet(post, 140);
                    return (
                      <Link
                        key={post.id}
                        href={post.slug ? `/posts/${post.slug}` : "#"}
                        className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:border-cyan-400/40 hover:bg-white/[0.08]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-200">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-base font-semibold text-white group-hover:text-cyan-100">
                              {post.title}
                            </p>
                            {snippet && (
                              <p className="text-sm text-slate-300 line-clamp-2">{snippet}</p>
                            )}
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 text-white/40 group-hover:text-cyan-200" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Yangi postlar</h2>
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
                >
                  Barchasini ko'rish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-48 rounded-2xl border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <p className="text-sm text-slate-400">Hali postlar qo'shilmagan.</p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                  <Link
                    href={spotlightPost?.slug ? `/posts/${spotlightPost.slug}` : "#"}
                    className="group flex flex-col justify-between rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 p-6 shadow-[0_20px_60px_-40px_rgba(56,189,248,0.8)] transition hover:border-cyan-400/60"
                  >
                    <div className="space-y-4">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
                        Spotlight
                      </span>
                      <p className="text-2xl font-semibold text-white sm:text-3xl">
                        {spotlightPost?.title}
                      </p>
                      {spotlightSnippet && (
                        <p className="text-sm text-slate-200/80 line-clamp-3">{spotlightSnippet}</p>
                      )}
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-cyan-200" />
                        Batafsil o'qish
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                        #{spotlightPost?.user?.name ?? "KnowHub"}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {supportingPosts.map((post) => {
                        const snippet = buildSnippet(post);
                        return (
                          <Link
                            key={post.id}
                            href={post.slug ? `/posts/${post.slug}` : "#"}
                            className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.1]"
                          >
                            <p className="text-lg font-semibold text-white group-hover:text-cyan-100">{post.title}</p>
                            {snippet && (
                              <p className="mt-2 text-sm text-slate-300 line-clamp-3">{snippet}</p>
                            )}
                            <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/60">
                              <ArrowRight className="h-3.5 w-3.5" />
                              Davomini o'qing
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {archivePosts.length > 0 && (
                      <div className="border-t border-white/5 pt-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Monitoring</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {archivePosts.map((post) => (
                            <Link
                              key={post.id}
                              href={post.slug ? `/posts/${post.slug}` : "#"}
                              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-white/[0.08]"
                            >
                              <span className="text-sm font-medium text-white/80 group-hover:text-cyan-100 line-clamp-2">
                                {post.title}
                              </span>
                              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-cyan-200" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
