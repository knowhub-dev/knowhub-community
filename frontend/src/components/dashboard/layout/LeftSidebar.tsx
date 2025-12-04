import { DailyMissions } from '../sections/DailyMissions';
import { ProfileCard } from '../sections/ProfileCard';
import { QuickActions } from '../sections/QuickActions';
import { XPProgress } from '../sections/XPProgress';
import type { DashboardBadge, DashboardMission, DashboardProfile, DashboardXp } from '@/app/dashboard/helpers/fetchDashboard';

export type LeftSidebarProps = {
  profile: DashboardProfile | null;
  xp: DashboardXp | null;
  badges: DashboardBadge[];
  missions?: DashboardMission[];
  className?: string;
};

export function LeftSidebar({ profile, xp, badges, missions, className }: LeftSidebarProps) {
  return (
    <aside
      className={`relative flex flex-col gap-4 rounded-3xl border border-primary/20 bg-[hsl(var(--surface-1))]/70 p-1 shadow-[0_30px_120px_-80px_rgba(79,70,229,0.8)] backdrop-blur md:sticky md:top-24 ${className ?? ''}`.trim()}
    >
      <div className="absolute inset-0 rounded-3xl border border-white/10" aria-hidden />
      <div className="relative space-y-4">
        <ProfileCard profile={profile} badges={badges} />
        {xp && <XPProgress xp={xp} />}
        <DailyMissions missions={missions} />
        <QuickActions />
      </div>
    </aside>
  );
}
