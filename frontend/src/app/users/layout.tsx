import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Foydalanuvchilar',
  description: 'Hamjamiyat a’zolarining reytingi va profillar ro‘yxati.',
  path: '/users',
});

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
