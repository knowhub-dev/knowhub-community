import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Liderlar',
  description: 'Faol ishtirokchilarning XP va badge reytingi.',
  path: '/leaderboard',
});

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
