import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Biz haqimizda',
  description: "KnowHub Community missiyasi va hamjamiyat qadriyatlari haqida ma'lumot.",
  path: '/about',
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
