'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowUpRight, Loader2, MessageCircle, Sparkles, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { Post, Tag, User } from '@/types';

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
}

function formatDate(value?: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    console.warn('[dashboard] Unable to format date', error);
    return value;
  }
}

function buildAvatar(user?: User) {
  if (user?.avatar_url) return user.avatar_url;
  const seed = user?.name || user?.username || 'Contributor';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=4F46E5&color=fff`;
}

function buildExcerpt(post: DashboardPost) {
  if (post.excerpt) return post.excerpt;
  if (post.content_markdown) {
    const sanitized = post.content_markdown.replace(/[#*_>`]/g, ' ').replace(/\s+/g, ' ').trim();
    if (sanitized.length <= 140) return sanitized;
    return `${sanitized.slice(0, 140)}…`;
  }
  return 'A new community update has arrived.';
}

type DashboardPost = Post & {
  excerpt?: string;
  likes_count?: number;
  reactions_count?: number;
  comments_count?: number;
  views_count?: number;
  cover_image?: string | null;
};

type PaginationMeta = {
  currentPage: number;
  lastPage?: number;
  perPage?: number;
  nextPageUrl?: string | null;
  total?: number;
};

type PaginatedPostsResponse = {
  data?: DashboardPost[];
  posts?: DashboardPost[];
  items?: DashboardPost[];
  meta?: Partial<
    Record<'current_page' | 'currentPage' | 'last_page' | 'lastPage' | 'per_page' | 'perPage' | 'total' | 'next_page_url' | 'nextPageUrl', number | string | null>
  >;
  pagination?: PaginatedPostsResponse['meta'];
  links?: { next?: string | null };
};

type PostPage = {
  posts: DashboardPost[];
  meta: PaginationMeta;
  nextPage?: number;
};

function extractPosts(payload: PaginatedPostsResponse | DashboardPost[] | null | undefined): DashboardPost[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.posts)) return payload.posts;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function normalizeMeta(payload: PaginatedPostsResponse | DashboardPost[], fallbackPage: number): PaginationMeta {
  if (!payload || Array.isArray(payload)) {
    return { currentPage: fallbackPage };
  }

  const metaSource = payload.meta ?? payload.pagination ?? {};
  const links = payload.links ?? {};

  const currentPage = normalizeNumber(metaSource.current_page ?? metaSource.currentPage ?? fallbackPage) ?? fallbackPage;
  const lastPage = normalizeNumber(metaSource.last_page ?? metaSource.lastPage);
  const perPage = normalizeNumber(metaSource.per_page ?? metaSource.perPage);
  const total = normalizeNumber(metaSource.total);
  const nextPageUrl = (metaSource.next_page_url ?? metaSource.nextPageUrl ?? links.next) ?? null;

  return {
    currentPage,
    lastPage: lastPage ?? undefined,
    perPage: perPage ?? undefined,
    total: total ?? undefined,
    nextPageUrl: typeof nextPageUrl === 'string' ? nextPageUrl : null,
  } satisfies PaginationMeta;
}

function resolveNextPage(meta: PaginationMeta, posts: DashboardPost[]): number | undefined {
  if (meta.nextPageUrl) return meta.currentPage + 1;
  if (meta.lastPage && meta.currentPage < meta.lastPage) return meta.currentPage + 1;
  if (meta.perPage && posts.length >= meta.perPage) return meta.currentPage + 1;
  return undefined;
}

async function fetchDashboardPosts(pageParam = 1): Promise<PostPage> {
  const response = await api.get('/posts', { params: { page: pageParam } });
  const payload = (response.data ?? {}) as PaginatedPostsResponse | DashboardPost[];
  const posts = extractPosts(payload);
  const meta = normalizeMeta(payload, pageParam);

  return {
    posts,
    meta,
    nextPage: resolveNextPage(meta, posts),
  } satisfies PostPage;
}

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-2))]/80 p-4">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-3 h-3 w-1/3" />
    </div>
  );
}

function PostCard({ post }: { post: DashboardPost }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2">
      <article className="relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(var(--surface-2))]/80 p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image src={buildAvatar(post.user)} alt={post.user?.name ?? 'Community member'} fill sizes="40px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{post.user?.name ?? 'Community member'}</p>
              <span className="text-xs text-muted-foreground">@{post.user?.username ?? 'anonymous'}</span>
            </div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{formatDate(post.created_at)}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">Live</span>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-tight text-foreground">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{buildExcerpt(post)}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {post.tags?.slice(0, 3).map((tag: Tag) => (
            <span key={tag.slug ?? tag.name} className="rounded-full bg-white/5 px-2 py-1">
              #{tag.name ?? tag.slug}
            </span>
          ))}
          {post.category?.name && <span className="rounded-full bg-secondary/10 px-2 py-1 text-secondary-foreground">{post.category.name}</span>}
          <div className="ml-auto flex items-center gap-2 text-foreground">
            <ThumbsUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">{post.reactions_count ?? post.likes_count ?? post.score ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count ?? post.answers_count ?? 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function PostStream() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['dashboard', 'posts'],
    queryFn: ({ pageParam = 1 }) => fetchDashboardPosts(pageParam),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });

  const posts = useMemo(() => data?.pages.flatMap(page => page.posts) ?? [], [data?.pages]);
  const totalPosts = data?.pages[0]?.meta.total;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px 0px 200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showEmptyState = !isLoading && !posts.length && !isError;

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/30 bg-[hsl(var(--surface-1))]/90 shadow-soft backdrop-blur md:max-h-[calc(100vh-260px)] lg:max-h-[calc(100vh-220px)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" aria-hidden />
      <header className="relative flex flex-wrap items-start justify-between gap-3 border-b border-border/30 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Jamiyat oqimi</p>
          <h2 className="text-lg font-semibold text-foreground">Server-backed postlar</h2>
          <p className="text-sm text-muted-foreground">Dashboard API dan olinadi va real vaqt rejimida yangilanadi.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/30 bg-[hsl(var(--surface-2))]/70 px-3 py-1 text-xs font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {typeof totalPosts === 'number' ? `${totalPosts} post` : 'Canli'}
        </div>
      </header>

      <div className="relative flex-1 space-y-4 overflow-y-visible px-4 pb-5 pt-4 md:overflow-y-auto md:pr-3">
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/30 bg-[hsl(var(--surface-2))]/70 p-6 text-center">
            <p className="text-sm text-muted-foreground">Postlarni yuklashda xatolik yuz berdi.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5"
            >
              Qayta urinish <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id ?? post.slug} post={post} />
        ))}

        {showEmptyState && (
          <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-2))]/70 p-6 text-center">
            <p className="text-sm text-muted-foreground">Hozircha postlar mavjud emas. Birinchi bo&apos;lib fikr ulashing!</p>
            <Link
              href="/posts/create"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              Post yaratish <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div ref={loadMoreRef} className="flex items-center justify-center pb-2 text-xs text-muted-foreground">
          {isFetchingNextPage ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : null}
          {!isFetchingNextPage && hasNextPage ? 'Yana postlar uchun pastga siljiting' : null}
        </div>
      </div>
    </section>
  );
}
