import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { buildApiUrl } from '@/lib/api-base-url';
import { AuthProvider } from '@/providers/AuthProvider';
import type { User } from '@/types';

import CreatePostPageClient from './CreatePostPageClient';

async function fetchAuthenticatedUser(cookieHeader: string): Promise<User | null> {
  try {
    const response = await fetch(buildApiUrl('/profile/me'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return 'data' in payload ? (payload.data as User) : (payload as User);
  } catch (error) {
    console.error('Failed to fetch authenticated user for create post page:', error);
    return null;
  }
}

export default async function CreatePostPage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  const cookieHeader = cookieStore.toString();
  const user = await fetchAuthenticatedUser(cookieHeader);

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <CreatePostPageClient />
    </AuthProvider>
  );
}
