import { Activity, Award, Flame } from 'lucide-react';

import { GamificationStats } from '@/components/profile/GamificationStats';

interface Badge {
  id: number;
  name: string;
  level?: string;
  description?: string;
  icon_key?: string;
  awarded_at?: string;
}

interface ProfileOverviewProps {
  xp: number;
  xpTarget: number;
  levelLabel: string;
  badges?: Badge[] | null;
  username: string;
}

const contributionGrid = Array.from({ length: 42 });

export function ProfileOverview({ xp, xpTarget, levelLabel, badges, username }: ProfileOverviewProps) {
  const topBadges = badges?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-subtle backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</p>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">XP & Level trajectory</h3>
            </div>
            <Flame className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
          </div>
          <div className="mt-4 rounded-2xl border border-border/70 bg-[hsl(var(--muted))]/40 p-4">
            <GamificationStats xp={xp} xpTarget={xpTarget} levelLabel={levelLabel} badges={badges ?? []} />
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-subtle backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top badges</p>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Recent achievements</h3>
            </div>
            <Award className="h-5 w-5 text-[hsl(var(--accent-yellow))]" />
          </div>
          <div className="mt-4 grid gap-3">
            {topBadges.length ? (
              topBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--muted))]/40 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[hsl(var(--foreground))]">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description ?? 'No description provided.'}</p>
                  </div>
                  <span className="rounded-full bg-[hsl(var(--background))] px-3 py-1 text-xs capitalize text-muted-foreground">
                    {badge.level ?? 'Badge'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">@{username} has not earned badges yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-subtle backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contribution graph</p>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Weekly activity</h3>
          </div>
          <Activity className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
        </div>
        <div className="mt-4 grid gap-2 [grid-template-columns:repeat(14,minmax(0,1fr))] sm:[grid-template-columns:repeat(21,minmax(0,1fr))]">
          {contributionGrid.map((_, index) => (
            <span
              key={index}
              className="h-3 w-3 rounded-sm bg-[hsl(var(--muted))]/60 shadow-inner ring-1 ring-border/50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
