'use client';

import GuestLanding from '@/components/features/home/GuestLanding';
import UserDashboard from '@/components/features/home/UserDashboard';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <GuestLanding />;
  }

  return <UserDashboard />;
}
