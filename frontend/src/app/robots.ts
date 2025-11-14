import type { MetadataRoute } from 'next';
import { buildCanonicalUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const base = new URL(buildCanonicalUrl('/'));

  const sitemap = (path: string) => new URL(path, base).toString();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      sitemap('sitemap.xml'),
      sitemap('sitemap-posts.xml'),
      sitemap('sitemap-users.xml'),
    ],
  };
}
