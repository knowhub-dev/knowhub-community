import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Saqlangan postlar',
  description: "Keyinroq o‘qish uchun belgilangan postlar va materiallar ro‘yxati.",
  path: '/bookmarks',
});

export default function BookmarksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
