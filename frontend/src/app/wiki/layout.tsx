import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Wiki maqolalar',
  description: "Jamiyat tomonidan yuritiladigan texnik maqolalar va qo‘llanmalar bazasi.",
  path: '/wiki',
});

export default function WikiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
