import { Activity, BarChart3, Clock3, Shield } from 'lucide-react';

import type { HomeStatsPayload } from '@/app/home/helpers/fetchHome';

function formatNumber(value?: number) {
  if (value === undefined || value === null) return '—';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return value.toLocaleString();
}

type StatsStripProps = {
  stats: HomeStatsPayload | null;
};

export function StatsStrip({ stats }: StatsStripProps) {
  const summary = [
    {
      label: "O'sish sur'ati",
      value: stats?.velocity?.weekly_posts ?? stats?.velocity?.weekly_members,
      helper: "/hafta",
      icon: BarChart3,
    },
    {
      label: 'Onlayn a\'zolar',
      value: stats?.health?.satisfaction ?? stats?.totals?.members,
      helper: 'aktyvlik',
      icon: Activity,
    },
    {
      label: 'Javob tezligi',
      value: stats?.velocity?.response_time_hours,
      helper: 'soat',
      icon: Clock3,
    },
    {
      label: 'Uptime',
      value: stats?.health?.uptime ?? 99.9,
      helper: '%',
      icon: Shield,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summary.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-surface-1/80 via-surface-1/90 to-surface-2/80 p-4 shadow-soft backdrop-blur-xs"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8" aria-hidden />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatNumber(item.value)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{item.helper}</span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
