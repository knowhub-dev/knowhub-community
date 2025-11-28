'use client';

import { BadgeCard } from '@/components/features/gamification/BadgeCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Sparkles, Trophy, Zap } from 'lucide-react';

interface Badge {
  id: number;
  name: string;
  description?: string;
  icon_key?: string;
  level?: string;
  awarded_at?: string;
}

interface GamificationStatsProps {
  xp: number;
  xpTarget: number;
  levelLabel: string;
  badges?: Badge[] | null;
}

export function GamificationStats({ xp, xpTarget, levelLabel, badges }: GamificationStatsProps) {
  const progress = xpTarget > 0 ? Math.min(100, Math.round((xp / xpTarget) * 100)) : 0;
  const remaining = Math.max(0, xpTarget - xp);

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">XP Progress</p>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{levelLabel}</h3>
            <p className="text-sm text-muted-foreground">{xp.toLocaleString()} / {xpTarget.toLocaleString()} XP</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/80 to-[hsl(var(--accent-pink))]/80 text-white shadow-neon">
            <Zap className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} label="Level momentum" ariaLabel="XP progress" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1">{remaining.toLocaleString()} XP to next milestone</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent-blue))]/10 px-3 py-1 text-[hsl(var(--foreground))]">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent-blue))]" /> Keep shipping</span>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Achievements</p>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Badge vault</h3>
          </div>
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        {badges?.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-4 text-sm text-muted-foreground">
            Yutuqlarni ochish uchun hamjamiyatda faol bo'ling. Birinchi badgeingizga oz qoldi!
          </div>
        )}
      </div>
    </aside>
  );
}

