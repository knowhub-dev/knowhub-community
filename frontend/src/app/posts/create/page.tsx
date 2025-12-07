import { redirect } from 'next/navigation';

import { AuthProvider } from '@/providers/AuthProvider';
import { fetchServerAuthenticatedUser } from '@/lib/server-auth';

import CreatePostPageClient from './CreatePostPageClient';

export default async function CreatePostPage() {
  const { user, hasToken } = await fetchServerAuthenticatedUser();

  if (!hasToken || !user) {
    redirect('/auth/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <CreatePostPageClient />
    </AuthProvider>
  );
}
