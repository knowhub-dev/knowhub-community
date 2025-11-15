import type { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/seo';

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

async function fetchUsers() {
  try {
    const response = await fetch(`${apiBase}/users`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [] as Array<{ username: string; updated_at?: string }>;
    }

    const data = await response.json();
    const users = Array.isArray(data?.data) ? data.data : data;
    return users?.map((user: any) => ({
      username: user.username,
      updated_at: user.updated_at ?? user.created_at,
    })) ?? [];
  } catch (error) {
    return [] as Array<{ username: string; updated_at?: string }>;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const users = await fetchUsers();

  return users.slice(0, 500).map((user) => ({
    url: buildCanonicalUrl(`/profile/${user.username}`),
    lastModified: user.updated_at ? new Date(user.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
}
