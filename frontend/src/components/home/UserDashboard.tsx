'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';

import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { Post } from '@/types';

import { LeftSidebar } from './dashboard/LeftSidebar';
import { RightSidebar } from './dashboard/RightSidebar';

const FEED_FILTERS = [
  { value: 'following', label: "Following" },
  { value: 'trending', label: 'Trending' },
] as const;

type FeedFilter = (typeof FEED_FILTERS)[number]['value'];

type PaginatedPostsResponse = {
  data: Post[];
};

async function fetchDashboardPosts(filter: FeedFilter) {
  const response = await api.get<PaginatedPostsResponse>('/posts', {
    params: { sort: filter === 'trending' ? 'trending' : 'following', per_page: 6 },
  });
  return response.data;
}

function CreatePostWidget({
  avatarUrl,
  placeholder,
}: {
  avatarUrl?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  return (
    <div className="rounded-3xl border border-border/70 bg-surface/80 p-5 shadow-glass backdrop-blur">
      <div className="flex gap-4">
        <img
          src={avatarUrl ?? 'https://ui-avatars.com/api/?name=KnowHub'}
          alt="User avatar"
          className="h-12 w-12 rounded-2xl border border-border/60 object-cover"
        />
        <div className="flex-1 space-y-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder ?? 'What are you working on?'}
            className="min-h-[100px] resize-none border-border/60 bg-transparent text-base"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Share updates, blockers, or requests with the community.</span>
            <Button asChild disabled={!draft.trim()} className="gap-2 rounded-full px-4">
              <Link href="/posts/create">
                <Sparkles className="h-4 w-4" /> Post update
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const auth = useAuth();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('following');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-feed', feedFilter],
    queryFn: () => fetchDashboardPosts(feedFilter),
  });

  const posts = data?.data ?? [];
  const avatarUrl = (auth.user as { avatar_url?: string })?.avatar_url;

  const xpProgress = useMemo(() => {
    const xp = Number((auth.user as { xp_progress?: number })?.xp_progress ?? 0);
    return Number.isFinite(xp) ? xp : 50;
  }, [auth.user]);

  const level = useMemo(() => {
    const maybeLevel = Number((auth.user as { level?: number })?.level ?? 3);
    return Number.isFinite(maybeLevel) ? maybeLevel : 3;
  }, [auth.user]);

  const badges = useMemo(
    () =>
      (
        (auth.user as { badges?: { label: string }[] })?.badges ?? [
          { label: 'Daily Commit' },
          { label: 'Community Helper' },
        ]
      ).map((badge) => ({ label: badge.label })),
    [auth.user],
  );

  const miniServices = useMemo(
    () =>
      (auth.user as { services?: { name: string; status: 'running' | 'stopped' }[] })?.services ?? [
        { name: 'Solvera API Proxy', status: 'running' },
        { name: 'Docs Preview', status: 'stopped' },
      ],
    [auth.user],
  );

  const trendingTopics = useMemo(
    () => [
      '#solvera-labs',
      '#open-source',
      '#mlops',
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">KnowHub Community</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Welcome back{auth.user?.name ? `, ${auth.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Dive into conversations from the builders you follow and track your personal progress.
          </p>
        </div>
        <div className="flex gap-3">
          {FEED_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setFeedFilter(filter.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                feedFilter === filter.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-3 md:block md:self-start md:pt-4 md:[position:sticky] md:top-24 hidden">
          <LeftSidebar />
        </div>

        <section className="md:col-span-6 space-y-6">
          <CreatePostWidget avatarUrl={avatarUrl} />

          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border/60 bg-surface/70 py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading feed…
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              Unable to load your feed. Please try again shortly.
            </div>
          ) : posts.length ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-surface/70 p-8 text-center text-muted-foreground">
              Your feed is quiet right now. Follow more communities or switch to trending topics.
            </div>
          )}
        </section>

        <div className="hidden md:col-span-3 md:block md:self-start md:pt-4 md:[position:sticky] md:top-24">
          <RightSidebar level={level} xpProgress={xpProgress} badges={badges} miniServices={miniServices} trendingTopics={trendingTopics} />
        </div>
      </div>

      <div className="mt-8 space-y-6 md:hidden">
        <LeftSidebar className="border-border/60 bg-surface/80" />
        <RightSidebar level={level} xpProgress={xpProgress} badges={badges} miniServices={miniServices} trendingTopics={trendingTopics} />
      </div>
    </div>
  );
}
