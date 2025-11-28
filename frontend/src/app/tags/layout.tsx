import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Teglar',
  description: 'Mavzular bo‘yicha postlarni tez topish uchun teglar to‘plami.',
  path: '/tags',
});

export default function TagsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
