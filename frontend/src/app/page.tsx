import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { generateStaticMetadata } from '@/lib/metadata-helpers';
import { buildApiUrl } from '@/lib/api-base-url';

import GuestLandingServer from './home/GuestLandingServer';

export const generateMetadata = generateStaticMetadata({
  title: 'KnowHub Community - Dasturchilar uchun Markaz',
  description:
    "KnowHub — bu dasturchilar uchun maxsus yaratilgan bilimlar markazi, hamkorlik platformasi va ijodiy maydon. Loyihalar yarating, bilim ulashing va hamjamiyatimizga qo'shiling.",
  path: '/',
});

export default async function HomePage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  if (authToken) {
    try {
      const response = await fetch(buildApiUrl('/profile/me'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        redirect('/dashboard');
      }
    } catch (error) {
      console.error('Failed to validate session on HomePage:', error);
    }
  }

  return <GuestLandingServer />;
}
