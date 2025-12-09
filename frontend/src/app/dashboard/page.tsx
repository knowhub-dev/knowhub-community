import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardServer from './DashboardServer';

export default function DashboardPage() {
  const cookieStore = cookies();
  const hasSessionCookies = cookieStore.getAll().length > 0;

  if (!hasSessionCookies) {
    redirect('/auth/login');
  }

  return <DashboardServer />;
}
