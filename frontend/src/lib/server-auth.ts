import { cookies } from 'next/headers';

import type { User } from '@/types';

import { buildApiUrl } from './api-base-url';

type ServerAuthResult = {
  user: User | null;
  hasSession: boolean;
};

export async function fetchServerAuthenticatedUser(): Promise<ServerAuthResult> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const hasSessionCookie = cookieStore.getAll().length > 0;

  if (!hasSessionCookie) {
    return { user: null, hasSession: false };
  }

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

    if (!response.ok) {
      return { user: null, hasSession: hasSessionCookie };
    }

    const payload = await response.json();
    const user = 'data' in payload ? (payload.data as User) : (payload as User);

    return { user, hasSession: true };
  } catch (error) {
    console.error('Failed to fetch authenticated user on server:', error);
    return { user: null, hasSession: hasSessionCookie };
  }
}
