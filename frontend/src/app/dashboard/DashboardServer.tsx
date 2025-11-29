import DashboardView from '@/components/dashboard/DashboardView';

import { fetchDashboardData } from './helpers/fetchDashboard';

export default async function DashboardServer() {
  const data = await fetchDashboardData();

  return <DashboardView data={data} />;
}
