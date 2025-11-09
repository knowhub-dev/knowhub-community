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
        setPosts(postsData.slice(0, 10));
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
      setActiveTagIndex((index) => (index + 1) % stats.topTags.length);
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 pointer-events-none">
        {accentOrbs.map((className, idx) => (
          <div
            key={idx}
            className={`absolute h-72 w-72 rounded-full blur-3xl ${className}`}
            aria-hidden="true"
          />
        ))}
        <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 lg:pb-32 lg:pt-24">
        <header className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-white/70 backdrop-blur">
              <CircleDot className="h-4 w-4 text-emerald-300" />
              Orbitadagi jamiyat
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl xl:text-6xl">
                Bilim orbitasini kengaytiruvchi
                <span className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  {" "}KnowHub galaktikasi
                </span>
              </h1>
              <p className="max-w-2xl text-lg text-slate-200/80 sm:text-xl">
                Kod yozing, tajriba qiling va hamjamiyat bilan birgalikda kelajakni qurish uchun wiki, real-time hamkorlik va
                mini serverlar kabi vositalardan foydalaning.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/posts/create"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02]"
              >
                Yangi missiya boshlash
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white/80 backdrop-blur transition hover:border-white hover:text-white"
              >
                Jamiyat galereyasi
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-900/40 backdrop-blur">
            <div className="absolute -top-3 right-10 hidden rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200/90 sm:block">
              Live snapshot
            </div>
            {loading ? (
              <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-white/60">
                Ma’lumotlar galaktikasi yuklanmoqda…
              </div>
            ) : error ? (
              <div className="flex flex-col gap-3 text-sm text-rose-200">
                <div className="text-lg font-semibold text-rose-100">Signal uzildi</div>
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Postlar</p>
                    <p className="mt-3 text-3xl font-bold text-white">{stats?.postsCount ?? "—"}</p>
                    <p className="mt-1 text-sm text-white/60">Yangiliklar orbitasi</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Foydalanuvchilar</p>
                    <p className="mt-3 text-3xl font-bold text-white">{stats?.usersCount ?? "—"}</p>
                    <p className="mt-1 text-sm text-white/60">Kosmonavtlar soni</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-white/50">Aktiv orbit</p>
                    <div className="flex items-center gap-2 text-sm text-emerald-200">
                      <Zap className="h-4 w-4" />
                      Real-time
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
                    {stats?.topTags?.length ? (
                      stats.topTags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border border-white/20 px-3 py-1 transition ${
                            tag === activeTag ? "bg-white/20 text-white" : "bg-white/5 text-white/70"
                          }`}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/50">Hali orbitaga teglar qo‘shilmadi.</span>
                    )}
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

          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Trend tezlanishi</h3>
                <span className="text-xs uppercase tracking-[0.35em] text-white/40">Live radar</span>
              </div>
              {loading ? (
                <div className="mt-6 text-sm text-white/60">Trend signalini sinxronlashtirish…</div>
              ) : trending.length === 0 ? (
                <div className="mt-6 text-sm text-white/60">Trend orbitasi hozircha bo‘sh.</div>
              ) : (
                <ul className="relative mt-6 space-y-6 border-l border-dashed border-white/20 pl-6">
                  {trending.map((t, index) => (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-slate-950 text-xs text-white/80">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/posts/${t.slug ?? String(t.id)}`}
                          className="text-base font-semibold text-white transition hover:text-fuchsia-200"
                        >
                          {t.title}
                        </Link>
                        {t.excerpt && <p className="text-sm text-white/60 line-clamp-3">{t.excerpt}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Eksperimental trayektoriyalar</h3>
              <p className="mt-2 text-sm text-white/60">
                KnowHub laboratoriyalariga sho‘ng‘ing va o‘zingizga mos yo‘nalishni tanlang.
              </p>
              <div className="mt-6 grid gap-4">
                {quickActions.map(({ title, description, href, icon: Icon, accent }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/40"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
                          <Icon className="h-4 w-4" />
                          {title}
                        </div>
                        <p className="mt-2 text-sm text-white/60">{description}</p>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 text-white/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur sm:block">
              <h3 className="text-lg font-semibold text-white">Galaktik qidiruv</h3>
              <p className="mt-2 text-sm text-white/60">Qiziqqan mavzuni toping yoki yangi missiya boshlang.</p>
              <form action="/posts" method="get" className="mt-4 flex gap-2">
                <input
                  name="q"
                  placeholder="Masalan, Laravel queue monitoring"
                  className="flex-1 rounded-full border border-white/20 bg-slate-900/70 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                />
                <button className="rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow">
                  Qidir
                </button>
              </form>
            </div>
          </aside>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center text-sm text-white/60 shadow-inner shadow-slate-900/50 backdrop-blur">
          © {new Date().getFullYear()} KnowHub — kosmik hamjamiyat.
        </footer>
      </div>
    </main>
  );
}
