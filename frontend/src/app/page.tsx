'use client';

import GuestLanding from '@/components/home/GuestLanding';
import UserDashboard from '@/components/home/UserDashboard';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <GuestLanding />;
  }

  return <UserDashboard />;
}
