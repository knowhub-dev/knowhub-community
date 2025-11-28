'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isProUser } from '@/lib/user';
import { Crown, Edit3, ShieldCheck, Sparkles } from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    name: string;
    username: string;
    bio?: string | null;
    avatar_url?: string | null;
    plan_type?: string | null;
    is_pro?: boolean;
    xp: number;
    level?: { name?: string | null; id?: number | null } | null;
  };
  xpTarget: number;
  xpProgress: number;
  isCurrentUser?: boolean;
}

const avatarFallback = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

const generateGradientFromUsername = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash; // convert to 32bit integer
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;
  return `radial-gradient(circle at 20% 20%, hsla(${hue1}, 85%, 65%, 0.35), transparent 40%),` +
    `radial-gradient(circle at 80% 0%, hsla(${hue2}, 90%, 70%, 0.4), transparent 42%),` +
    `linear-gradient(120deg, hsla(${hue3}, 85%, 55%, 0.4), hsla(${hue1}, 90%, 50%, 0.6))`;
};

export function ProfileHeader({ user, xpTarget, xpProgress, isCurrentUser }: ProfileHeaderProps) {
  const levelLabel = user.level?.name ?? `Level ${user.level?.id ?? 1}`;
  const xpDisplay = `${user.xp.toLocaleString()} / ${xpTarget.toLocaleString()} XP`;
  const ringGradient = `conic-gradient(from 180deg, var(--ring-start) ${xpProgress}%, rgba(255,255,255,0.14) ${xpProgress}% 100%)`;
  const isPro = isProUser(user);
  const nameGradient = isPro
    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]'
    : '';
  const avatarRingClasses = isPro
    ? 'ring-2 ring-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.45)]'
    : '';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 shadow-neon backdrop-blur-xl">
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{ background: generateGradientFromUsername(user.username) }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/40" aria-hidden />

      <div className="relative p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-28 w-28 shrink-0">
              <div
                className={cn('absolute inset-0 rounded-full p-[6px]', avatarRingClasses)}
                style={{
                  background: ringGradient,
                  '--ring-start': 'linear-gradient(120deg, rgba(111, 225, 255, 0.95), rgba(255, 138, 255, 0.95))',
                } as CSSProperties}
              >
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black/40 shadow-inner">
                  <Image
                    src={user.avatar_url || avatarFallback(user.name)}
                    alt={user.name}
                    fill
                    sizes="112px"
                    className="h-full w-full rounded-full object-cover shadow-lg"
                    priority={false}
                  />
                  <span className="absolute -bottom-1 flex items-center gap-1 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    {levelLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-200" /> Dev Journey
              </div>
              {isPro && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                  <Crown className="h-3.5 w-3.5" /> Pro Member
                </div>
              )}
              <div>
                <h1 className={cn('text-3xl font-bold leading-tight sm:text-4xl', nameGradient)}>
                  <span className="inline-flex items-center gap-2">
                    {user.name}
                    {isPro && <Crown className="h-5 w-5 text-amber-300 drop-shadow" />}
                  </span>
                </h1>
                <p className="text-sm font-medium text-white/80">@{user.username}</p>
              </div>
              {user.bio && (
                <p className="max-w-2xl text-sm leading-relaxed text-white/80">{user.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-cyan-100">
                <span className="rounded-full bg-white/10 px-3 py-1 shadow-sm shadow-cyan-300/30">{xpDisplay}</span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-100 shadow-sm shadow-emerald-300/20">Progress {Math.round(xpProgress)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button variant="secondary" size="lg" className="border-white/20 bg-white/15 text-white shadow-xl backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4" /> Celebrate streak
            </Button>
            {isCurrentUser && (
              <Button size="lg" className="bg-white text-black shadow-xl hover:scale-[1.02]">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

