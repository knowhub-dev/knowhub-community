import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Mini-servislar',
  description: 'Shaxsiy va jamoaviy jarayonlarni avtomatlashtiruvchi kichik servislar to‘plami.',
  path: '/mini-services',
});

export default function MiniServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
