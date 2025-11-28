import type { ActivityEvent, SystemStatusSummary, WeeklyHeroesResponse } from "@/components/home/types";
import type { Post } from "@/types";
import type { LucideIcon } from "lucide-react";

export type PostSummary = Pick<Post, "id" | "slug" | "title" | "content_markdown" | "score" | "created_at" | "user"> & {
  excerpt?: string;
  summary?: string;
  content_preview?: string;
  content?: string;
};

export type TagSummary = {
  id?: number;
  name: string;
  slug: string;
  usage_count?: number;
};

export type ActivityFeedResponse = {
  data: ActivityEvent[];
};

export type HomepageStatsResponse = {
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

export type StatCard = {
  label: string;
  value?: number;
  subtitle: string;
  icon: LucideIcon;
  accentClass: string;
};

export type QuickAction = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  hoverClass: string;
  ctaLabel: string;
  ctaClass: string;
};

export type PaginatedPostsResponse = {
  data: Post[];
  meta?: Record<string, unknown>;
};

export type SortType = "latest" | "popular" | "following";

export type FeedTab = {
  value: SortType;
  label: string;
  authOnly?: boolean;
};

export type HomepageDataState = {
  homeStats: HomepageStatsResponse | null;
  heroes: WeeklyHeroesResponse | null;
  feed: ActivityEvent[];
  systemStatus: SystemStatusSummary | null;
  loading: boolean;
  error: string | null;
};

export type GuestHeroProps = {
  isAuthenticated: boolean;
  userName?: string;
  statsCards: StatCard[];
  quickActions: QuickAction[];
  heroTags: TagSummary[];
  heroFeed: ActivityEvent[];
  xpProgress: number;
};

export type SolveraPromoProps = object;

export type StatsStripProps = {
  systemStatus: SystemStatusSummary | null;
};

export type QuickActionsSectionProps = {
  quickActions: QuickAction[];
  trendingTags: TagSummary[];
};

export type PostsFeedSectionProps = {
  sortType: SortType;
  setSortType: (value: SortType) => void;
  visibleTabs: FeedTab[];
  posts: Post[];
  postsLoading: boolean;
  postsError: unknown;
  postsIsError: boolean;
};

export type TrendSignalsSectionProps = {
  spotlightPost: PostSummary | null;
  secondaryPosts: PostSummary[];
  queuePosts: PostSummary[];
};

export type ErrorAlertProps = {
  message: string;
};
