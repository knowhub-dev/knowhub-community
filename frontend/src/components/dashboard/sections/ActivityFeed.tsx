import { ArrowUpRight, MessageCircle, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

import type { DashboardActivityItem } from '@/app/dashboard/helpers/fetchDashboard';

type ActivityFeedProps = {
  items?: DashboardActivityItem[];
};

const icons: Record<string, JSX.Element> = {
  comment: <MessageCircle className="h-4 w-4" />,
  achievement: <Trophy className="h-4 w-4" />,
  default: <Sparkles className="h-4 w-4" />,
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  const feed = items?.length
    ? items
    : [
        {
          id: 'welcome',
          title: 'Welcome to your Aurora dashboard',
          description: 'Track community stats, XP, and your latest wins here.',
          type: 'achievement',
          created_at: new Date().toISOString(),
        },
      ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/80 p-5 shadow-soft backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
      <div className="relative mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activity</p>
          <h3 className="text-lg font-semibold">Recent updates</h3>
        </div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-[hsl(var(--surface-2))]/70 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary/40"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative space-y-3">
        {feed.map(item => {
          const Icon = icons[item.type ?? ''] ?? icons.default;
          return (
            <div
              key={item.id ?? item.title}
              className="group relative flex gap-3 rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="mt-1 rounded-lg bg-primary/10 p-2 text-primary shadow-inner">{Icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {item.created_at && (
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(item.created_at))}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description ?? 'Keep shipping!'}</p>
                {item.meta && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {Object.entries(item.meta).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-white/5 px-2 py-1"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
                {item.href && (
                  <Link
                    href={item.href}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary"
                  >
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
