"use client";

import Link from "next/link";
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
  excerpt?: string;
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

export default function HomePage() {
  const [stats, setStats] = useState<StatShape | null>(null);
  const [trending, setTrending] = useState<PostShort[]>([]);
  const [posts, setPosts] = useState<PostShort[]>([]);
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
        accent: "bg-sky-50 text-sky-700 border-sky-100",
      },
    ],
    []
  );
        title: "Kosmik post yozish",
        description:
          "AI qo'llab-quvvatlovi bilan tezkor draft yaratib, jamiyatni hayratda qoldiring.",
        href: "/posts/create",
        icon: Sparkles,
        accent: "from-fuchsia-500/40 to-indigo-500/20",
      },
      {
        title: "Tajriba laboratoriyasi",
        description:
          "Mini serveringizda yangi stakni sinab ko'ring va hamjamiyat bilan baham ko'ring.",
        href: "/containers",
        icon: Activity,
        accent: "from-cyan-500/40 to-sky-500/20",
      },
      {
        title: "Wiki orbitasini kengaytirish",
        description:
          "Kollektiv bilimga hissa qo'shish uchun yangi maqola qo'shing yoki taklif yuboring.",
        href: "/wiki",
        icon: Compass,
        accent: "from-amber-500/40 to-orange-500/20",
      },
    ],
    []
  );

  const accentOrbs = useMemo(
    () => [
      "top-[-10%] left-[-10%] bg-fuchsia-600/40",
      "top-[40%] -right-10 bg-indigo-500/30",
      "bottom-[-15%] left-[20%] bg-sky-500/30",
      "top-[65%] right-[30%] bg-emerald-500/20",
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [sRes, tRes, pRes] = await Promise.all([
          api.get("/stats/homepage").catch(() => ({ data: null })),
          api.get("/posts?sort=trending&per_page=5").catch(() => ({ data: [] })),
          api.get("/posts?per_page=10").catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

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
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

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
