import { BarChart3, MessageCircle, Star, Users } from 'lucide-react';

import type { DashboardStats } from '@/app/dashboard/helpers/fetchDashboard';

type StatsOverviewProps = {
  stats: DashboardStats | null;
};

const statCards = [
  {
    key: 'posts',
    label: 'Posts shipped',
    icon: BarChart3,
  },
  {
    key: 'comments',
    label: 'Comments added',
    icon: MessageCircle,
  },
  {
    key: 'answers',
    label: 'Accepted answers',
    icon: Star,
  },
  {
    key: 'followers',
    label: 'Followers',
    icon: Users,
  },
] as const;

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/70 p-5 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Performance</p>
          <h3 className="text-lg font-semibold">Stats</h3>
        </div>
        <div className="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent shadow-glow">Live</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          const value = Number((stats as Record<string, unknown> | null)?.[card.key] ?? 0);
          const formatted = Number.isFinite(value) ? value.toLocaleString() : '—';

          return (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/70 p-4 shadow-inner"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-semibold text-foreground">{formatted}</p>
                </div>
                <span className="rounded-lg bg-primary/10 p-2 text-primary shadow-inner">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <span>Velocity: {stats?.velocity ?? '—'}/wk</span>
        <span>Response: {stats?.response_time_hours ?? '—'}h</span>
        <span>Impact score: {stats?.impact_score ?? '—'}</span>
        <span>Reputation: {stats?.reputation ?? '—'}</span>
      </div>
    </div>
  );
}
