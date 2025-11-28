import type { LucideIcon } from "lucide-react";

export type ServiceHealthStatus = "operational" | "degraded" | "outage";

export interface ServiceHealth {
  name: string;
  status: ServiceHealthStatus;
  description: string;
  latency_ms?: number | null;
  checked_at?: string | null;
  details?: Record<string, unknown>;
}

export interface SystemStatusSummary {
  services?: ServiceHealth[];
  metrics?: {
    uptime_seconds?: number | null;
    active_users?: number | null;
    queue_backlog?: number | null;
  };
  updated_at?: string | null;
}

export interface HeroUser {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  xp?: number;
}

export interface HeroEntry {
  user: HeroUser;
  total_xp?: number;
  total_score?: number;
  posts_count?: number;
}

export interface WeeklyHeroesResponse {
  range?: {
    start: string;
    end: string;
  };
  xp?: HeroEntry[];
  post_authors?: HeroEntry[];
}

export type ActivityEventType = "post" | "comment" | "badge";

export interface ActivityEvent {
  type: ActivityEventType;
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
}

export type SortType = "latest" | "popular" | "following";

export interface TagSummary {
  id?: number;
  name: string;
  slug: string;
  usage_count?: number;
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  content_markdown?: string;
  score?: number;
  created_at?: string;
  user?: {
    id: number;
    name: string;
  };
  excerpt?: string;
  summary?: string;
  content_preview?: string;
  content?: string;
}

export interface ActivityFeedResponse {
  data: ActivityEvent[];
}

export interface HomepageStatsResponse {
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
}

export interface StatCard {
  label: string;
  value?: number;
  subtitle: string;
  icon: LucideIcon;
  accentClass: string;
}

export interface QuickAction {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  hoverClass: string;
  ctaLabel: string;
  ctaClass: string;
}

export interface PaginatedPostsResponse {
  data: PostSummary[];
  meta?: Record<string, unknown>;
}

export interface FeedTab {
  value: SortType;
  label: string;
  authOnly?: boolean;
}
