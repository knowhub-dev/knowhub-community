import { ActivityFeed } from '../sections/ActivityFeed';
import { ContributionGraph } from '../sections/ContributionGraph';
import type { DashboardActivity } from '@/app/dashboard/helpers/fetchDashboard';

export type MainContentProps = {
  activity: DashboardActivity | null;
};

export function MainContent({ activity }: MainContentProps) {
  return (
    <main className="grid gap-4 md:gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4 md:space-y-6">
        <ActivityFeed items={activity?.feed} />
      </div>
      <ContributionGraph contributions={activity?.contributions} className="h-full" />
    </main>
  );
}
