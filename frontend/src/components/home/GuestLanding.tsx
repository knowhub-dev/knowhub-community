'use client';

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { WeeklyHeroes } from "@/components/home/WeeklyHeroes";
import type { PaginatedPostsResponse, SortType, TagSummary } from "@/components/home/sections/types";
import { ErrorAlert } from "@/components/home/sections/ErrorAlert";
import { GuestHero } from "@/components/home/sections/GuestHero";
import { HomepageSkeleton } from "@/components/home/sections/HomepageSkeleton";
import { PostsFeedSection } from "@/components/home/sections/PostsFeedSection";
import { QuickActionsSection } from "@/components/home/sections/QuickActionsSection";
import { SolveraPromo } from "@/components/home/sections/SolveraPromo";
import { StatsStrip } from "@/components/home/sections/StatsStrip";
import { TrendSignalsSection } from "@/components/home/sections/TrendSignalsSection";
import { FEED_TABS, QUICK_ACTIONS, buildStatsCards } from "@/components/home/sections/config";
import { useHomepageData } from "@/components/home/useHomepageData";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";

async function getPosts(params: { sort: SortType }) {
  const sortParam = params.sort === "popular" ? "trending" : params.sort;
  const response = await api.get<PaginatedPostsResponse>("/posts", { params: { sort: sortParam, per_page: 6 } });
  return response.data;
}

export default function GuestLanding() {
  const { homeStats, heroes, feed, systemStatus, loading, error } = useHomepageData();
  const [sortType, setSortType] = useState<SortType>("latest");
  const auth = useAuth();

  const { data: postsResponse, isLoading: postsLoading, isError: postsIsError, error: postsError } = useQuery<PaginatedPostsResponse>({
    queryKey: ["posts", sortType],
    queryFn: () => getPosts({ sort: sortType }),
  });

  const posts = postsResponse?.data ?? [];
  const quickActions = useMemo(() => QUICK_ACTIONS, []);
  const statsCards = useMemo(() => buildStatsCards(homeStats?.stats), [homeStats?.stats]);
  const heroFeed = useMemo(() => feed.slice(0, 3), [feed]);
  const heroTags = useMemo<TagSummary[]>(() => (homeStats?.trending_tags ?? []).slice(0, 3), [homeStats?.trending_tags]);
  const latestPosts = useMemo(() => homeStats?.latest_posts ?? [], [homeStats?.latest_posts]);
  const { spotlightPost, secondaryPosts, queuePosts } = useMemo(() => {
    const [first, ...rest] = latestPosts;
    return { spotlightPost: first ?? null, secondaryPosts: rest.slice(0, 3), queuePosts: rest.slice(3, 8) };
  }, [latestPosts]);
  const xpProgress = useMemo(() => {
    const xpField = (auth.user as { xp_progress?: number })?.xp_progress;
    const numericXp = Number(xpField);
    return Number.isFinite(numericXp) ? Math.min(100, Math.max(0, numericXp)) : 48;
  }, [auth.user]);
  const visibleTabs = useMemo(() => FEED_TABS.filter((tab) => (tab.authOnly ? auth.isAuthenticated : true)), [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated && sortType === "following") setSortType("latest");
  }, [auth.isAuthenticated, sortType]);

  if (loading) return <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"><HomepageSkeleton /></main>;

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <GuestHero
        isAuthenticated={auth.isAuthenticated}
        userName={auth.user?.name ?? auth.user?.username}
        statsCards={statsCards}
        quickActions={quickActions}
        heroTags={heroTags}
        heroFeed={heroFeed}
        xpProgress={xpProgress}
      />
      <SolveraPromo />
      <StatsStrip systemStatus={systemStatus} />
      <QuickActionsSection quickActions={quickActions} trendingTags={homeStats?.trending_tags ?? []} />
      <PostsFeedSection
        sortType={sortType}
        setSortType={setSortType}
        visibleTabs={visibleTabs}
        posts={posts}
        postsLoading={postsLoading}
        postsError={postsError}
        postsIsError={postsIsError}
      />
      <TrendSignalsSection spotlightPost={spotlightPost} secondaryPosts={secondaryPosts} queuePosts={queuePosts} />
      <WeeklyHeroes heroes={heroes} className="hidden md:block" />
      <ActivityFeed feed={feed} />
      <ErrorAlert message={error ?? ""} />
    </main>
  );
}
