const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

export type TagSummary = {
  name: string;
  slug: string;
  usage_count?: number;
};

export type HomeStatsPayload = {
  totals?: {
    members?: number;
    users?: number;
    posts?: number;
    answers?: number;
    tags?: number;
  };
  velocity?: {
    weekly_posts?: number;
    weekly_members?: number;
    response_time_hours?: number;
  };
  health?: {
    uptime?: number;
    incidents?: number;
    satisfaction?: number;
  };
  trending_tags?: TagSummary[];
  highlights?: Array<{
    label?: string;
    value?: number | string;
    delta?: number | string;
  }>;
  sparkline?: number[];
};

export type HomeFeedItem = {
  id?: string | number;
  title: string;
  excerpt?: string;
  summary?: string;
  created_at?: string;
  user?: {
    name?: string;
    username?: string;
    avatar_url?: string;
    title?: string;
  };
  stats?: {
    likes?: number;
    comments?: number;
    saves?: number;
  };
  tags?: TagSummary[];
};

export type CommunityHero = {
  id?: string | number;
  name: string;
  role?: string;
  avatar_url?: string;
  impact?: string;
  highlight?: string;
  badges?: string[];
  contributions?: number;
};

export type SpotlightContent = {
  title: string;
  summary?: string;
  excerpt?: string;
  cover_image?: string;
  author?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
  cta_label?: string;
  cta_url?: string;
  metrics?: {
    saves?: number;
    reads?: number;
    discussions?: number;
  };
  tags?: TagSummary[];
};

export type HomeLandingData = {
  stats: HomeStatsPayload | null;
  feed: HomeFeedItem[];
  heroes: CommunityHero[];
  spotlight: SpotlightContent | null;
};

function buildUrl(path: string) {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchEndpoint<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(buildUrl(path), { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[home] Failed to fetch ${path}:`, error);
    return null;
  }
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in (value as Record<string, unknown>)) {
    const data = (value as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

export async function fetchHomeData(): Promise<HomeLandingData> {
  const [statsResponse, feedResponse, heroesResponse, spotlightResponse] = await Promise.all([
    fetchEndpoint<HomeStatsPayload>('/home/stats'),
    fetchEndpoint<HomeFeedItem[] | { data: HomeFeedItem[] }>('/home/feed'),
    fetchEndpoint<CommunityHero[] | { heroes?: CommunityHero[] }>('/home/heroes'),
    fetchEndpoint<SpotlightContent | { spotlight?: SpotlightContent }>('/home/spotlight'),
  ]);

  const stats =
    (statsResponse && 'stats' in (statsResponse as Record<string, unknown>)
      ? (statsResponse as { stats?: HomeStatsPayload }).stats
      : statsResponse) ?? null;

  const feed = normalizeArray<HomeFeedItem>(feedResponse);
  const heroes = normalizeArray<CommunityHero>((heroesResponse as { heroes?: CommunityHero[] } | null)?.heroes ?? heroesResponse);
  const spotlight =
    ((spotlightResponse as { spotlight?: SpotlightContent } | null)?.spotlight ?? spotlightResponse ?? null) as SpotlightContent | null;

  return {
    stats,
    feed,
    heroes,
    spotlight,
  };
}
