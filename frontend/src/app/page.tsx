import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

import GuestLandingServer from './home/GuestLandingServer';

export const generateMetadata = generateStaticMetadata({
  title: 'Bosh sahifa',
  description: "KnowHub Community — dasturchilar uchun bilim almashish va hamkorlik maydoni.",
  path: '/',
});

export default async function HomePage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (authToken) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/profile/me`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie: cookieStore.toString(),
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
