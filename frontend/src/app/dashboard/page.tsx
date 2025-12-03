import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardServer from './DashboardServer';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  return <DashboardServer />;
}
