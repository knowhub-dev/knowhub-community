import { redirect } from 'next/navigation';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Sozlamalar',
  description: 'Profil, xavfsizlik va xabarnoma sozlamalarini boshqarish.',
  path: '/settings',
});

export default function SettingsPage() {
  redirect('/settings/profile');
}
