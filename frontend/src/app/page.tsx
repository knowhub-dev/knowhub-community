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
import PostCard from "@/components/PostCard";
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
        accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      {
        title: "Mini serverni ishga tushiring",
        description: "Ajratilgan resurslarda g'oyangizni sinovdan o'tkazing.",
        href: "/containers",
        icon: Zap,
        accent: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        title: "Wiki'ni boyiting",
        description: "Jamiyat bilim bazasiga maqola yoki taklif qo'shing.",
        href: "/wiki",
        icon: Compass,
        accent: "bg-sky-50 text-sky-700 border-sky-100",
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

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-16">
        <header className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Jamiyat
            </span>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Minimalistik hamjamiyat maydoni — g'oyalaringiz, tajribangiz va hamkorligingiz uchun.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                KnowHub bilim bo'limlari, mini serverlar va real vaqtli hamkorlik orqali g'oyalaringizni tezda sinab ko'rish va ulashish imkonini beradi.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Yangi post yozish
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
              >
                So'nggi postlar
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {formatNumber(stats?.postsCount)}+ postlar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                Hamjamiyat: {formatNumber(stats?.usersCount)}+
              </span>
              {activeTag && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                  Trend tegi: #{activeTag}
                </span>
              )}
            </div>
          </div>

          <div className="relative h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">Bugungi panorama</p>
                <span className="text-xs text-slate-400">Yangilanadi: {loading ? "…" : "real-time"}</span>
              </div>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-12 rounded-2xl bg-slate-100" />
                  <div className="h-12 rounded-2xl bg-slate-100" />
                  <div className="h-12 rounded-2xl bg-slate-100" />
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-500">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">Faol ijodkorlar</span>
                    <span className="text-lg font-semibold">{formatNumber(stats?.usersCount)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">Jamiyatdagi postlar</span>
                    <span className="text-lg font-semibold">{formatNumber(stats?.postsCount)}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Trend teglari</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stats?.topTags?.length ? (
                        stats.topTags.map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">Hali teglarga oid ma'lumot yo'q.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Tezkor harakatlar</h2>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Profil paneliga o'tish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`group flex flex-col gap-3 rounded-2xl border px-5 py-6 transition hover:-translate-y-1 hover:shadow-md ${action.accent}`}
              >
                <div className="flex items-center justify-between">
                  <action.icon className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 text-current opacity-60 transition group-hover:translate-x-1" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">{action.title}</p>
                  <p className="text-sm text-slate-600/80">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[0.75fr,1.25fr]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Trend yo'nalishlar</h2>
              <Link href="/posts?sort=trending" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                Barchasini ko'rish
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {trending.length === 0 && !loading ? (
                <p className="text-sm text-slate-500">Hozircha trend postlar aniqlanmadi.</p>
              ) : (
                trending.map((post, index) => (
                  <Link
                    key={post.id}
                    href={post.slug ? `/posts/${post.slug}` : "#"}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="text-3xl font-semibold text-slate-300 group-hover:text-slate-500">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-800 group-hover:text-slate-900">
                        {post.title}
                      </p>
                      {post.excerpt && <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Yangi postlar</h2>
              <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                Barchasini ko'rish
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-sm text-slate-500">Hali postlar qo'shilmagan.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post as any} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
