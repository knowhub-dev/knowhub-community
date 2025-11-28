"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Award, FileText, Flame, Users } from "lucide-react";

export type ProfileCardVariant = "standard" | "compact" | "highlighted";

export interface ProfileBadge {
  id: string | number;
  label: string;
  description?: string;
}

export interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  username: string;
  handle: string;
  avatarUrl?: string | null;
  bio?: string | null;
  stats?: {
    posts?: number;
    xp?: number;
    reputation?: number;
    followers?: number;
  };
  badges?: ProfileBadge[];
  actions?: React.ReactNode;
  variant?: ProfileCardVariant;
}

const formatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatStat(value?: number) {
  if (value === undefined || value === null) {
    return "0";
  }

  return formatter.format(value);
}

const badgeColors = [
  "bg-primary/15 text-primary",
  "bg-secondary/15 text-secondary",
  "bg-accent-purple/15 text-accent-purple",
  "bg-accent-pink/15 text-accent-pink",
  "bg-accent-green/15 text-accent-green",
];

export const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  (
    {
      username,
      handle,
      avatarUrl,
      bio,
      stats,
      badges,
      actions,
      variant = "standard",
      className,
      ...props
    },
    ref,
  ) => {
    const isCompact = variant === "compact";
    const isHighlighted = variant === "highlighted";

    const statEntries = React.useMemo(
      () =>
        [
          { key: "posts", label: "Posts", value: stats?.posts, icon: <FileText className="h-4 w-4" /> },
          { key: "xp", label: "XP", value: stats?.xp, icon: <Flame className="h-4 w-4" /> },
          { key: "reputation", label: "Reputation", value: stats?.reputation, icon: <Award className="h-4 w-4" /> },
          { key: "followers", label: "Followers", value: stats?.followers, icon: <Users className="h-4 w-4" /> },
        ].filter((item) => item.value !== undefined && item.value !== null),
      [stats?.followers, stats?.posts, stats?.reputation, stats?.xp],
    );

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border/60 bg-surface/80 text-foreground shadow-subtle transition-transform duration-200 ease-out backdrop-blur-sm",
          "hover:-translate-y-1 hover:shadow-neon",
          isHighlighted && "border-primary/60 shadow-neon",
          isCompact ? "p-4" : "p-6",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-surface/70 shadow-inner",
              "transition-shadow duration-200 group-hover:border-primary/40 group-hover:shadow-neon",
              isCompact && "h-12 w-12",
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${username} avatar`}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary">{username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn("text-lg font-semibold", isCompact && "text-base")}>{username}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  @{handle}
                </span>
              </div>
              {bio ? (
                <p
                  className={cn(
                    "text-sm text-muted-foreground line-clamp-3",
                    isCompact && "line-clamp-2 text-xs",
                  )}
                >
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/70">No bio provided yet.</p>
              )}
            </div>

            {statEntries.length > 0 && (
              <div
                className={cn(
                  "grid gap-3 rounded-lg border border-border/60 bg-surface/70 p-3 backdrop-blur-sm",
                  isCompact ? "grid-cols-2" : "grid-cols-4",
                )}
              >
                {statEntries.map((stat) => (
                  <div key={stat.key} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold">{formatStat(stat.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {badges && badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {badges
                  .slice(0, isCompact ? 3 : badges.length)
                  .map((badge, index) => (
                    <span
                      key={badge.id}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        badgeColors[index % badgeColors.length],
                      )}
                      title={badge.description}
                    >
                      {badge.label}
                    </span>
                  ))}
                {isCompact && badges.length > 3 && (
                  <span className="rounded-full bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                    +{badges.length - 3} more
                  </span>
                )}
              </div>
            )}

            {actions && <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>}
          </div>
        </div>
      </div>
    );
  },
);

ProfileCard.displayName = "ProfileCard";

export interface ProfileCardSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ProfileCardVariant;
}

export function ProfileCardSkeleton({ variant = "standard", className, ...props }: ProfileCardSkeletonProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border/60 bg-surface/60 p-6 backdrop-blur-sm",
        isCompact && "p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className={cn("h-16 w-16 rounded-full bg-muted/60", isCompact && "h-12 w-12")} />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-muted/60" />
            <div className="h-3 w-24 rounded bg-muted/40" />
            <div className={cn("h-3 w-full rounded bg-muted/40", isCompact ? "" : "max-w-[75%]")} />
            {!isCompact && <div className="h-3 w-3/4 rounded bg-muted/30" />}
          </div>
          <div
            className={cn(
              "grid gap-3",
              isCompact ? "grid-cols-2" : "grid-cols-4",
            )}
          >
            <div className="h-14 rounded-lg bg-muted/30" />
            <div className="h-14 rounded-lg bg-muted/30" />
            <div className="h-14 rounded-lg bg-muted/30" />
            <div className="h-14 rounded-lg bg-muted/30" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 rounded-full bg-muted/30" />
            <div className="h-6 w-20 rounded-full bg-muted/30" />
            <div className="h-6 w-12 rounded-full bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
