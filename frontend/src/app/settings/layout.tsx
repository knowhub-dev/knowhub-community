import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Sozlamalar',
  description: 'Profil, xavfsizlik va xabarnoma sozlamalarini boshqarish.',
  path: '/settings',
});

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
