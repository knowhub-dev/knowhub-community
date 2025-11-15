import type { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls = [
    '/',
    '/posts',
    '/wiki',
    '/users',
    '/leaderboard',
    '/containers',
  ];

  return urls.map((path) => ({
    url: buildCanonicalUrl(path),
    lastModified: now,
    changeFrequency: 'daily',
    priority: path === '/' ? 1 : 0.6,
  }));
}
