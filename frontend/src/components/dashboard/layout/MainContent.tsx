import { ActivityFeed } from '../sections/ActivityFeed';
import { ContributionGraph } from '../sections/ContributionGraph';
import type { DashboardActivity } from '@/app/dashboard/helpers/fetchDashboard';

export type MainContentProps = {
  activity: DashboardActivity | null;
};

export function MainContent({ activity }: MainContentProps) {
  return (
    <main className="space-y-4 md:space-y-6">
      <ActivityFeed items={activity?.feed} />
      <ContributionGraph contributions={activity?.contributions} />
    </main>
  );
}
