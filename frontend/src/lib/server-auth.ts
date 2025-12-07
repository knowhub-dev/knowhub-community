import { cookies } from 'next/headers';

import type { User } from '@/types';

import { AUTH_COOKIE_NAME } from './auth-cookie';
import { buildApiUrl } from './api-base-url';

type ServerAuthResult = {
  user: User | null;
  hasToken: boolean;
};

export async function fetchServerAuthenticatedUser(): Promise<ServerAuthResult> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!cookieHeader && !authToken) {
    return { user: null, hasToken: false };
  }

  try {
    const response = await fetch(buildApiUrl('/profile/me'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return { user: null, hasToken: !!authToken };
    }

    const payload = await response.json();
    const user = 'data' in payload ? (payload.data as User) : (payload as User);

    return { user, hasToken: true };
  } catch (error) {
    console.error('Failed to fetch authenticated user on server:', error);
    return { user: null, hasToken: !!authToken };
  }
}
