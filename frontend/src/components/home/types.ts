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
