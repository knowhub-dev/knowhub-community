import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Bildirishnomalar',
  description: 'Sharhlar, javoblar va tizim xabarlari bo‘yicha yangiliklar markazi.',
  path: '/notifications',
});

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
