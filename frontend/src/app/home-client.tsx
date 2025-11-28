"use client";

import dynamic from 'next/dynamic';

import { useAuth } from '@/providers/AuthProvider';

const GuestLanding = dynamic(() => import('@/components/home/GuestLanding'));
const UserDashboard = dynamic(() => import('@/components/home/UserDashboard'));

export default function HomeClient() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <GuestLanding />;
  }

  return <UserDashboard />;
}
