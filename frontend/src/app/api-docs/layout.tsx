import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'API hujjatlari',
  description: 'Integratsiyalar uchun KnowHub API endpointlari va ishlatish misollari.',
  path: '/api-docs',
});

export default function ApiDocsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
