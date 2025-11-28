import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'RSS lentalari',
  description: 'KnowHub kontentini RSS orqali o‘qish uchun kanallar.',
  path: '/rss',
});

export default function RssLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
