import { Flame, Sparkles } from 'lucide-react';

import type { DashboardXp } from '@/app/dashboard/helpers/fetchDashboard';

type XPProgressProps = {
  xp: DashboardXp | null;
};

export function XPProgress({ xp }: XPProgressProps) {
  const level = xp?.level ?? 1;
  const progress = xp?.progress ?? Math.min(100, Math.round(((xp?.current ?? 0) / (xp?.next ?? 100)) * 100));
  const streak = xp?.streak ?? 0;
  const rank = xp?.rank ?? 'Explorer';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-[hsl(var(--surface-1))]/80 p-5 shadow-[0_20px_80px_-50px_rgba(79,70,229,0.9)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">XP Progress</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Ranked {rank}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Level {level}
        </div>
      </div>

      <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full border border-primary/40 bg-[hsl(var(--surface-2))]/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_0_6px_rgba(99,102,241,0.2)]"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-primary/10 to-white/5" />
      </div>

      <div className="relative mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{xp?.current ?? 0} XP</span>
        <span>{xp?.next ?? 100} XP to next</span>
      </div>

      <div className="relative mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4" />
          <span>{streak} day streak</span>
        </div>
        {xp?.boosters?.length ? (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            {xp.boosters.map(boost => (
              <span key={boost} className="rounded-full bg-white/10 px-2 py-1 text-white">
                {boost}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-primary/80">Bonus XP active</span>
        )}
      </div>
    </div>
  );
}
