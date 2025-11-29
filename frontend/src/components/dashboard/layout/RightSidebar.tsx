import { BadgeShowcase } from '../sections/BadgeShowcase';
import { MiniServers } from '../sections/MiniServers';
import { StatsOverview } from '../sections/StatsOverview';
import type { DashboardBadge, DashboardMiniServer, DashboardStats } from '@/app/dashboard/helpers/fetchDashboard';

export type RightSidebarProps = {
  stats: DashboardStats | null;
  servers: DashboardMiniServer[];
  badges: DashboardBadge[];
  className?: string;
};

export function RightSidebar({ stats, servers, badges, className }: RightSidebarProps) {
  return (
    <aside
      className={`relative flex flex-col gap-4 rounded-3xl border border-accent/20 bg-[hsl(var(--surface-1))]/70 p-1 shadow-[0_30px_120px_-80px_rgba(167,139,250,0.8)] backdrop-blur md:sticky md:top-24 ${className ?? ''}`.trim()}
    >
      <div className="absolute inset-0 rounded-3xl border border-white/5" aria-hidden />
      <div className="relative space-y-4">
        <StatsOverview stats={stats} />
        <MiniServers servers={servers} />
        <BadgeShowcase badges={badges} />
      </div>
    </aside>
  );
}
