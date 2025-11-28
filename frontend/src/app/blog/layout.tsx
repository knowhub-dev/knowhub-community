import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Blog yangiliklari',
  description: 'KnowHub jamoasi va hamjamiyatidan yangiliklar, intervyular va tavsiyalar.',
  path: '/blog',
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
