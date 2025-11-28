import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Blog postlari',
  description: "So‘nggi maqolalar, qo‘llanmalar va hamjamiyat yangiliklari.",
  path: '/posts',
});

export default function PostsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
