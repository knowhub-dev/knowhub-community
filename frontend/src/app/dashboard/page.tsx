import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardServer from './DashboardServer';

export default function DashboardPage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  return <DashboardServer />;
}
