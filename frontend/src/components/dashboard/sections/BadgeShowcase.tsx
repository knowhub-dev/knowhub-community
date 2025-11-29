import { Award, Sparkles } from 'lucide-react';

import type { DashboardBadge } from '@/app/dashboard/helpers/fetchDashboard';

type BadgeShowcaseProps = {
  badges: DashboardBadge[];
};

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const items = badges.length
    ? badges
    : [
        { id: 'mentor', name: 'Community Mentor', level: 'Gold', description: 'Guided 15 creators' },
        { id: 'sherpa', name: 'Code Sherpa', level: 'Silver', description: 'Reviewed 25 pull requests' },
      ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/80 p-5 shadow-glow backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent" />
      <div className="relative mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Badges</p>
          <h3 className="text-lg font-semibold">Prestige</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
          <Sparkles className="h-4 w-4" />
          Aurora tier
        </div>
      </div>

      <div className="relative space-y-3">
        {items.map(badge => (
          <div
            key={badge.id ?? badge.name}
            className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent shadow-[0_10px_40px_-26px_rgba(167,139,250,0.6)]"
          >
            <span className="rounded-lg bg-white/10 p-2 text-white">
              <Award className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description ?? 'Aurora distinction'}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-foreground/80">
              {badge.level ?? 'Elite'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
