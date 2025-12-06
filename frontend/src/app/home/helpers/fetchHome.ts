import { buildApiUrl } from '@/lib/api-base-url';

export type TagSummary = {
  name: string;
  slug: string;
  usage_count?: number;
};

export type HomeStatsPayload = {
  users?: {
    total?: number;
    active_today?: number;
    new_this_week?: number;
    active_this_month?: number;
  };
  posts?: {
    total?: number;
    today?: number;
    this_week?: number;
    this_month?: number;
  };
  comments?: {
    total?: number;
    today?: number;
    this_week?: number;
  };
  wiki?: {
    articles?: number;
    total_versions?: number;
  };
  trending_tags?: TagSummary[];
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

type StatsHomepageResponse = {
  stats?: HomeStatsPayload;
  trending_posts?: HomeFeedItem[];
  latest_posts?: HomeFeedItem[];
  featured_post?: SpotlightContent;
  trending_tags?: TagSummary[];
};

type ActivityFeedResponse = {
  data?: Array<{
    id?: string | number;
    type?: string;
    created_at?: string;
    verb?: string;
    user?: {
      id?: string | number;
      name?: string;
      username?: string;
      avatar_url?: string;
    } | null;
    payload?: Record<string, unknown> | null;
  }>;
};

type WeeklyHeroesResponse = {
  xp?: Array<{ user?: CommunityHero | null; total_xp?: number }>;
  post_authors?: Array<{ user?: CommunityHero | null; total_score?: number; posts_count?: number }>;
};

async function fetchEndpoint<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(buildApiUrl(path), { cache: 'no-store' });

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
  const [homepageResponse, activityResponse, heroesResponse] = await Promise.all([
    fetchEndpoint<StatsHomepageResponse>('/stats/homepage'),
    fetchEndpoint<ActivityFeedResponse>('/activity-feed'),
    fetchEndpoint<WeeklyHeroesResponse>('/stats/weekly-heroes'),
  ]);

  const stats = homepageResponse?.stats || homepageResponse?.trending_tags
    ? { ...(homepageResponse?.stats ?? {}), trending_tags: homepageResponse?.trending_tags }
    : null;

  const postFeed = normalizeArray<HomeFeedItem>(homepageResponse?.trending_posts).concat(
    normalizeArray<HomeFeedItem>(homepageResponse?.latest_posts),
  );

  const activityFeed = normalizeArray<ActivityFeedResponse['data'][number]>(activityResponse?.data).map((item, index) => {
    const payload = (item?.payload ?? {}) as Record<string, unknown>;
    const payloadTitle = typeof payload.title === 'string' ? payload.title : undefined;
    const payloadExcerpt = typeof payload.excerpt === 'string' ? payload.excerpt : undefined;
    const payloadPostTitle = (payload as { post?: { title?: string } })?.post?.title;
    const payloadBadgeName = (payload as { name?: string })?.name;

    return {
      id: item?.id ?? `activity-${index}`,
      title:
        payloadTitle ??
        (item?.type === 'comment'
          ? `Izoh: ${payloadPostTitle ?? 'muhokama'}`
          : item?.type === 'user-badge'
            ? `Yangi badge: ${payloadBadgeName ?? 'badge'}`
            : 'Jamiyat faolligi'),
      excerpt: payloadExcerpt,
      created_at: item?.created_at ?? undefined,
      user: item?.user ?? undefined,
    } satisfies HomeFeedItem;
  });

  const combinedFeed: HomeFeedItem[] = [];
  const dedupe = new Set<string | number>();

  [...postFeed, ...activityFeed].forEach((entry) => {
    if (!entry) return;

    if (entry.id === undefined || entry.id === null) {
      combinedFeed.push(entry);
      return;
    }

    if (dedupe.has(entry.id)) return;
    dedupe.add(entry.id);
    combinedFeed.push(entry);
  });

  const heroes = (
    normalizeArray(heroesResponse?.xp).map((hero) => ({
      id: hero.user?.id,
      name: hero.user?.name ?? hero.user?.username ?? 'Faol ishtirokchi',
      avatar_url: hero.user?.avatar_url,
      contributions: hero.total_xp,
      highlight: hero.total_xp ? `${hero.total_xp} XP` : undefined,
      badges: ['XP yetakchisi'],
    })) as CommunityHero[]
  ).concat(
    normalizeArray(heroesResponse?.post_authors).map((author) => ({
      id: author.user?.id,
      name: author.user?.name ?? author.user?.username ?? 'Muallif',
      avatar_url: author.user?.avatar_url,
      contributions: author.posts_count,
      highlight: author.total_score ? `${author.total_score} umumiy reyting` : undefined,
      badges: ['Haftalik muallif'],
    })) as CommunityHero[],
  );

  const spotlight: SpotlightContent | null =
    homepageResponse?.featured_post ??
    (postFeed?.[0]
      ? {
          title: postFeed[0].title,
          summary: postFeed[0].summary ?? postFeed[0].excerpt,
          author: postFeed[0].user,
          tags: postFeed[0].tags,
        }
      : activityFeed?.[0]
        ? {
            title: activityFeed[0].title,
            summary: activityFeed[0].excerpt,
            author: activityFeed[0].user,
          }
        : null);

  return {
    stats,
    feed: combinedFeed,
    heroes,
    spotlight,
  };
}
