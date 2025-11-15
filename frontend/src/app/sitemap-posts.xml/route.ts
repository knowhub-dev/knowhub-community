import type { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/seo';

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

async function fetchPosts() {
  try {
    const response = await fetch(`${apiBase}/posts`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [] as Array<{ slug: string; updated_at?: string }>;
    }

    const data = await response.json();
    const posts = Array.isArray(data?.data) ? data.data : data;
    return posts?.map((post: any) => ({
      slug: post.slug,
      updated_at: post.updated_at ?? post.created_at,
    })) ?? [];
  } catch (error) {
    return [] as Array<{ slug: string; updated_at?: string }>;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts();

  return posts.slice(0, 500).map((post) => ({
    url: buildCanonicalUrl(`/posts/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
}
