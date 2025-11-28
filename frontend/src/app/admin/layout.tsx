import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Admin paneli',
  description: 'Tizim sozlamalari, moderatsiya va platforma statistikasi.',
  path: '/admin',
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
