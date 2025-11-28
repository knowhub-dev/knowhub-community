import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Sayt xaritasi',
  description: "KnowHub sahifalari va bo‘limlari ro‘yxati orqali tez navigatsiya.",
  path: '/sitemap',
});

export default function SitemapLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
