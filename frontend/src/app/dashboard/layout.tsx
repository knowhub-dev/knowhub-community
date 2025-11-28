import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Dashboard',
  description: 'Shaxsiy statistikalar, jarayonlar va tezkor amal paneli.',
  path: '/dashboard',
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
