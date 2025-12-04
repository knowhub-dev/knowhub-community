import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

export type DashboardBadge = {
  id?: string | number;
  name: string;
  level?: string;
  description?: string;
  icon?: string;
  color?: string;
};

export type DashboardXp = {
  level?: number;
  current?: number;
  next?: number;
  progress?: number;
  streak?: number;
  rank?: string;
  boosters?: string[];
};

export type DashboardProfile = {
  id?: string | number;
  name?: string;
  username?: string;
  title?: string;
  avatar_url?: string;
  motto?: string;
  location?: string;
  level?: number;
  streak?: number;
  skills?: string[];
  badges?: DashboardBadge[];
  xp?: DashboardXp;
};

export type DashboardActivityItem = {
  id?: string | number;
  type?: string;
  title?: string;
  description?: string;
  created_at?: string;
  icon?: string;
  href?: string;
  meta?: Record<string, string | number | undefined>;
};

export type ContributionPoint = {
  day: string;
  value: number;
};

export type DashboardMission = {
  title?: string;
  status?: 'done' | 'in-progress' | 'pending';
  completion?: number;
  reward?: string;
};

export type DashboardActivity = {
  feed?: DashboardActivityItem[];
  highlights?: string[];
  contributions?: ContributionPoint[];
};

export type DashboardStats = {
  posts?: number;
  comments?: number;
  answers?: number;
  reputation?: number;
  followers?: number;
  velocity?: number;
  response_time_hours?: number;
  impact_score?: number;
};

export type DashboardData = {
  profile: DashboardProfile | null;
  activity: DashboardActivity | null;
  stats: DashboardStats | null;
  badges: DashboardBadge[];
  xp: DashboardXp | null;
  missions: DashboardMission[];
};

function buildUrl(path: string) {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && 'data' in (value as Record<string, unknown>)) {
    const data = (value as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

function normalizeActivity(value: unknown): Partial<DashboardActivity> {
  if (!value || typeof value !== 'object') return {};

  const feed = normalizeArray<DashboardActivityItem>((value as { feed?: unknown; items?: unknown }).feed ?? (value as { items?: unknown }).items);
  const highlights = Array.isArray((value as { highlights?: unknown }).highlights)
    ? ((value as { highlights?: unknown }).highlights as string[])
    : [];
  const contributions = normalizeArray<ContributionPoint>((value as { contributions?: unknown }).contributions);

  return {
    feed: feed.length ? feed : undefined,
    highlights: highlights.length ? highlights : undefined,
    contributions: contributions.length ? contributions : undefined,
  };
}

function normalizeMissions(value: unknown): DashboardMission[] {
  const missions = normalizeArray<DashboardMission>((value as { missions?: unknown })?.missions ?? value);

  return missions
    .map(mission => {
      if (!mission.title) return null;
      const completionValue =
        mission.completion ??
        (mission.status === 'done' ? 100 : mission.status === 'in-progress' ? 50 : 0);
      const completion = Math.max(0, Math.min(100, Math.round(completionValue)));

      return {
        title: mission.title,
        status: mission.status ?? 'pending',
        completion,
        reward: mission.reward,
      } satisfies DashboardMission;
    })
    .filter((mission): mission is DashboardMission => Boolean(mission?.title));
}

function normalizeStats(value: unknown): Partial<DashboardStats> {
  if (!value || typeof value !== 'object') return {};
  const stats = value as DashboardStats;
  return Object.fromEntries(Object.entries(stats).filter(([, v]) => v !== undefined && v !== null)) as Partial<DashboardStats>;
}

async function fetchEndpoint<T>(path: string, token?: string): Promise<T | null> {
  const headers: HeadersInit = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  try {
    const response = await fetch(buildUrl(path), {
      cache: 'no-store',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.warn(`[dashboard] ${path} responded with status ${response.status}`);
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[dashboard] Failed to fetch ${path}:`, error);
    return null;
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  const [profileResponse, activityResponse, statsResponse, trendingResponse, analyticsResponse, missionsResponse] =
    await Promise.all([
      fetchEndpoint<DashboardProfile | { profile?: DashboardProfile }>('/profile/me', authToken),
      fetchEndpoint<DashboardActivity>('/dashboard/activity', authToken),
      fetchEndpoint<DashboardStats>('/dashboard/stats', authToken),
      fetchEndpoint<unknown>('/dashboard/trending', authToken),
      fetchEndpoint<unknown>('/dashboard/analytics', authToken),
      fetchEndpoint<DashboardMission[] | { missions?: DashboardMission[] }>('/dashboard/missions', authToken),
    ]);

  const profile = (profileResponse as { profile?: DashboardProfile } | null)?.profile ?? (profileResponse as DashboardProfile | null);
  const badges = normalizeArray<DashboardBadge>(profile?.badges);
  const xp =
    profile && (profile.level !== undefined || profile.streak !== undefined || profile.xp)
      ? {
          level: profile.level ?? profile.xp?.level,
          streak: profile.streak ?? profile.xp?.streak,
          current: profile.xp?.current,
          next: profile.xp?.next,
          progress: profile.xp?.progress,
          rank: profile.xp?.rank,
          boosters: profile.xp?.boosters,
        }
      : null;

  const baseActivity = normalizeActivity(activityResponse);
  const trendingActivity = normalizeActivity(trendingResponse);
  const analyticsActivity = normalizeActivity((analyticsResponse as { activity?: unknown } | null)?.activity ?? analyticsResponse);

  const mergedActivity: DashboardActivity = {
    feed: baseActivity.feed ?? trendingActivity.feed ?? analyticsActivity.feed,
    highlights: baseActivity.highlights ?? trendingActivity.highlights ?? analyticsActivity.highlights,
    contributions: baseActivity.contributions ?? trendingActivity.contributions ?? analyticsActivity.contributions,
  };

  const baseStats = normalizeStats(statsResponse);
  const analyticsStats = normalizeStats((analyticsResponse as { stats?: unknown } | null)?.stats ?? analyticsResponse);

  const stats: DashboardStats | null = Object.keys({ ...baseStats, ...analyticsStats }).length
    ? { ...baseStats, ...analyticsStats }
    : null;

  const missionsFromApi = normalizeMissions(missionsResponse);
  const missionHighlights = (mergedActivity.highlights ?? []).map(text => ({
    title: text,
    status: 'in-progress' as const,
  } satisfies DashboardMission));
  const missions = missionsFromApi.length ? missionsFromApi : missionHighlights;

  return {
    profile: profile ?? null,
    activity: mergedActivity.feed || mergedActivity.highlights || mergedActivity.contributions ? mergedActivity : null,
    stats,
    badges,
    xp,
    missions,
  };
}
