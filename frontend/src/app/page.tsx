"use client";

import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { api } from "../lib/api";

type StatShape = {
  postsCount?: number;
  usersCount?: number;
  topTags?: string[];
};

type PostShort = {
  id: number;
  title: string;
  excerpt?: string;
  slug?: string;
  user?: any;
};

export default function HomePage() {
  const [stats, setStats] = useState<StatShape | null>(null);
  const [trending, setTrending] = useState<PostShort[]>([]);
  const [posts, setPosts] = useState<PostShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const trendingData = Array.isArray(tRes.data) ? tRes.data : tRes.data?.data ?? tRes.data?.posts ?? [];
        setTrending(trendingData.slice(0, 5));

        const postsData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data ?? pRes.data?.posts ?? [];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <header className="mb-6">
          <div className="rounded-lg bg-white shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">KnowHub</h1>
              <p className="text-gray-600">Jamiyat, maqolalar va interaktiv kod bo'limi — hammasi bir joyda.</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <a className="inline-block bg-indigo-600 text-white px-4 py-2 rounded" href="/posts/create">Yangi post</a>
              <a className="inline-block border border-indigo-200 text-indigo-600 px-4 py-2 rounded" href="/posts">Barcha postlar</a>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Posts feed */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">So'nggi postlar</h2>
              <div className="text-sm text-gray-500">{loading ? "Yuklanmoqda..." : `Topildi ${posts.length} ta`}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading && <div className="col-span-2 text-gray-500">Yuklanmoqda…</div>}
              {!loading && posts.length === 0 && <div className="col-span-2 text-gray-600">Hozircha postlar mavjud emas.</div>}
              {!loading && posts.map((p) => (
                <PostCard key={p.id} post={p as any} />
              ))}
            </div>
          </section>

          {/* Right: Stats & Trending */}
          <aside className="space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium mb-3">Statistika</h3>
              {loading ? (
                <div className="text-gray-500">Yuklanmoqda…</div>
              ) : error ? (
                <div className="text-red-600">Xato: {error}</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 border rounded flex items-center justify-between">
                    <div className="text-sm text-gray-500">Postlar</div>
                    <div className="text-xl font-semibold">{stats?.postsCount ?? "—"}</div>
                  </div>
                  <div className="p-3 border rounded flex items-center justify-between">
                    <div className="text-sm text-gray-500">Foydalanuvchilar</div>
                    <div className="text-xl font-semibold">{stats?.usersCount ?? "—"}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-gray-500">Mashhur teglar</div>
                    <div className="mt-2 text-sm text-gray-700">{stats?.topTags && stats.topTags.length ? stats.topTags.join(", ") : "—"}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium mb-3">Trenddagi postlar</h3>
              {loading ? (
                <div className="text-gray-500">Yuklanmoqda…</div>
              ) : trending.length === 0 ? (
                <div className="text-gray-600">Trend postlar yo'q.</div>
              ) : (
                <ul className="space-y-3">
                  {trending.map((t) => (
                    <li key={t.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <a href={`/posts/${t.slug}`} className="font-medium hover:text-indigo-600">{t.title}</a>
                        {t.excerpt && <div className="text-sm text-gray-500">{t.excerpt}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow hidden sm:block">
              <h3 className="text-lg font-medium mb-2">Qidiruv</h3>
              <form action="/posts" method="get" className="flex gap-2">
                <input name="q" placeholder="Qidirish..." className="flex-1 border rounded px-3 py-2" />
                <button className="bg-indigo-600 text-white px-3 py-2 rounded">Qidir</button>
              </form>
            </div>
          </aside>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} KnowHub</footer>
      </div>
    </div>
  );
}
