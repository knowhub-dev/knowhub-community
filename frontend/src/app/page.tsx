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
  const authToken = cookies().get('auth_token')?.value;

  if (authToken) {
    redirect('/dashboard');
  }

  return <GuestLandingServer />;
}
