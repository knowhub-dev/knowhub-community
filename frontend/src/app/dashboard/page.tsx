import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardServer from './DashboardServer';

export default async function DashboardPage() {
  const authToken = cookies().get('auth_token')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  return <DashboardServer />;
}
