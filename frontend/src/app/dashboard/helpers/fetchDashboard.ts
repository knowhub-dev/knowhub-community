import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

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

export type DashboardMiniServer = {
  id?: string | number;
  name: string;
  status?: 'online' | 'offline' | 'maintenance';
  uptime?: number;
  latency_ms?: number;
  region?: string;
};

export type DashboardData = {
  profile: DashboardProfile | null;
  activity: DashboardActivity | null;
  stats: DashboardStats | null;
  badges: DashboardBadge[];
  xp: DashboardXp | null;
  servers: DashboardMiniServer[];
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
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[dashboard] Failed to fetch ${path}:`, error);
    return null;
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  const [profileResponse, activityResponse, statsResponse, badgesResponse, xpResponse, serversResponse] = await Promise.all([
    fetchEndpoint<DashboardProfile>('/users/me', authToken),
    fetchEndpoint<DashboardActivity>('/dashboard/activity', authToken),
    fetchEndpoint<DashboardStats>('/dashboard/stats', authToken),
    fetchEndpoint<DashboardBadge[] | { badges?: DashboardBadge[] }>('/dashboard/badges', authToken),
    fetchEndpoint<DashboardXp>('/dashboard/xp', authToken),
    fetchEndpoint<DashboardMiniServer[] | { servers?: DashboardMiniServer[] }>(
      '/dashboard/mini-servers',
      authToken,
    ),
  ]);

  const badges = normalizeArray<DashboardBadge>((badgesResponse as { badges?: DashboardBadge[] } | null)?.badges ?? badgesResponse);
  const servers = normalizeArray<DashboardMiniServer>(
    (serversResponse as { servers?: DashboardMiniServer[] } | null)?.servers ?? serversResponse,
  );

  return {
    profile: profileResponse ?? null,
    activity: activityResponse ?? null,
    stats: statsResponse ?? null,
    badges,
    xp: xpResponse ?? null,
    servers,
  };
}
