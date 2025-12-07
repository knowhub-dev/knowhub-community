"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink, ScrollText, Sparkles } from 'lucide-react';

import { api } from '@/lib/api';
import type { Post } from '@/types';

interface PaginatedPosts {
  data?: Post[];
  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

interface ProfilePostsProps {
  initialPosts?: PaginatedPosts | null;
  username: string;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

export function ProfilePosts({ initialPosts, username }: ProfilePostsProps) {
  const [page, setPage] = useState(initialPosts?.meta?.current_page ?? 1);
  const [posts, setPosts] = useState<PaginatedPosts | null>(initialPosts ?? null);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts ?? null);
    setPage(initialPosts?.meta?.current_page ?? 1);
  }, [initialPosts, username]);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (posts && posts.meta?.current_page === page) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/users/${username}/posts`, {
          params: { page, limit: 20 },
        });

        if (isMounted) {
          setPosts(response.data);
        }
      } catch (err) {
        console.error('User postsni olishda xato:', err);
        if (isMounted) {
          setError("Postlarni yuklab bo'lmadi. Keyinroq qayta urinib ko'ring.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [username, page, posts]);

  const lastPage = posts?.meta?.last_page ?? 1;
  const hasPosts = (posts?.data?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Posts & Wiki</p>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Published contributions</h3>
        </div>
        <ScrollText className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-6 text-center text-sm text-muted-foreground">
          Postlar yuklanmoqda...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : hasPosts ? (
        <div className="space-y-3">
          {posts?.data?.map((post) => (
            <article
              key={post.id}
              className="group rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-4 shadow-subtle backdrop-blur transition hover:-translate-y-0.5 hover:shadow-neon"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/posts/${post.slug}`} className="text-lg font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]">
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{formatDate(post.created_at)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-[hsl(var(--accent-purple))]" /> {post.score} kudos
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{post.content_markdown}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {post.tags?.map((tag) => (
                  <span key={tag.slug} className="rounded-full bg-[hsl(var(--muted))]/50 px-3 py-1">#{tag.name}</span>
                ))}
                <Link
                  href={`/posts/${post.slug}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]"
                >
                  Read <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}

          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {lastPage}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-border/80 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
                  disabled={page >= lastPage}
                  className="rounded-full border border-border/80 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-8 text-center text-sm text-muted-foreground">
          @{username} has not published any posts yet.
        </div>
      )}
    </div>
  );
}
