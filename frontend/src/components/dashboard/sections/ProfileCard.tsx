import Image from 'next/image';

import type { DashboardBadge, DashboardProfile } from '@/app/dashboard/helpers/fetchDashboard';

type ProfileCardProps = {
  profile: DashboardProfile | null;
  badges?: DashboardBadge[];
};

export function ProfileCard({ profile, badges }: ProfileCardProps) {
  const name = profile?.name ?? 'KnowHub Explorer';
  const title = profile?.title ?? 'Community Member';
  const username = profile?.username ? `@${profile.username}` : 'guest';
  const motto = profile?.motto ?? 'Build, share, and uplift the community.';
  const avatarUrl = profile?.avatar_url ?? 'https://ui-avatars.com/api/?name=KnowHub&background=6366F1&color=fff';
  const skills = (profile?.skills ?? []).slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
      <div className="relative flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border/40 shadow-glow">
          <Image
            src={avatarUrl}
            alt={name}
            fill
            sizes="64px"
            className="object-cover"
          />
          <div className="absolute inset-0 rounded-xl border border-white/10" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
          <h3 className="text-lg font-semibold leading-tight">{name}</h3>
          <p className="text-sm text-accent font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{username}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{motto}</p>

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-[hsl(var(--surface-2))]/70 px-3 py-1 text-xs text-foreground/80 shadow-soft"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
              {skill}
            </span>
          ))}
        </div>
      )}

      {badges && badges.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs text-muted-foreground">Latest badges</p>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 3).map(badge => (
              <span
                key={badge.id ?? badge.name}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent shadow-glow"
              >
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(167,139,250,0.2)]" />
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
