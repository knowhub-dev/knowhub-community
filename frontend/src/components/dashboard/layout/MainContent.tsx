import { ContributionGraph } from '../sections/ContributionGraph';
import { PostStream } from '../sections/PostStream';
import type { DashboardActivity } from '@/app/dashboard/helpers/fetchDashboard';

export type MainContentProps = {
  activity: DashboardActivity | null;
};

export function MainContent({ activity }: MainContentProps) {
  return (
    <main className="grid items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <PostStream />
      <ContributionGraph contributions={activity?.contributions} className="h-full" />
    </main>
  );
}
