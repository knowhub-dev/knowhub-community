import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Status',
  description: 'Tizim xizmatlari holati va so‘nggi uzilishlar tarixi.',
  path: '/status',
});

export default function StatusLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
