import Link from 'next/link';
import { Award, Flame, TrendingUp } from 'lucide-react';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

export type BadgeInfo = {
  label: string;
  description?: string;
};

export type MiniServiceInfo = {
  name: string;
  status: 'running' | 'stopped';
};

type RightSidebarProps = {
  level: number;
  xpProgress: number;
  badges?: BadgeInfo[];
  miniServices?: MiniServiceInfo[];
  trendingTopics?: string[];
  className?: string;
};

export function RightSidebar({
  level,
  xpProgress,
  badges = [],
  miniServices = [],
  trendingTopics = [],
  className,
}: RightSidebarProps) {
  return (
    <aside
      className={cn(
        'space-y-6 rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-glass backdrop-blur-md',
        className,
      )}
    >
      <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-glass">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Level Progress</p>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">Level {level}</p>
            <p className="text-sm text-muted-foreground">Next milestone unlocked at 100 XP</p>
          </div>
          <Award className="h-10 w-10 text-primary" aria-hidden />
        </div>
        <ProgressBar value={xpProgress} className="mt-4" />
        {badges.length ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Latest Badges</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  <Award className="h-3 w-3" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-border/50 bg-card/50 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">My Mini-Services</p>
          <Link href="/mini-services" className="text-xs font-medium text-primary hover:underline">
            Manage
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {miniServices.length ? (
            miniServices.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-2xl border border-border/40 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{service.name}</p>
                  <p className="text-xs text-muted-foreground">Docker workspace</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                    service.status === 'running'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-rose-500/15 text-rose-500',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', service.status === 'running' ? 'bg-emerald-500' : 'bg-rose-500')} />
                  {service.status === 'running' ? 'Running' : 'Stopped'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No containers linked yet.</p>
          )}
        </div>
      </section>

      {trendingTopics.length ? (
        <section className="rounded-3xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Trending Now</p>
          </div>
          <div className="mt-4 space-y-3">
            {trendingTopics.map((topic) => (
              <div key={topic} className="flex items-center justify-between rounded-2xl border border-border/40 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{topic}</p>
                  <p className="text-xs text-muted-foreground">Community spotlight</p>
                </div>
                <Flame className="h-4 w-4 text-primary" aria-hidden />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
