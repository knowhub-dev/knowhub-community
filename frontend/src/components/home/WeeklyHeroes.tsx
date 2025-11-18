import Link from "next/link";
import { Medal, Sparkles } from "lucide-react";

import type { WeeklyHeroesResponse } from "./types";
import { formatNumber } from "./utils";

interface WeeklyHeroesProps {
  heroes: WeeklyHeroesResponse | null;
  className?: string;
}

export function WeeklyHeroes({ heroes, className }: WeeklyHeroesProps) {
  const xpLeaders = heroes?.xp ?? [];
  const authors = heroes?.post_authors ?? [];

  if (!xpLeaders.length && !authors.length) {
    return null;
  }

  return (
    <section className={`max-w-6xl px-6 pb-16 lg:px-8 ${className ?? ""}`}>
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <Medal className="h-6 w-6 text-[hsl(var(--accent-pink))]" />
          <h2 className="text-xl font-semibold">Hafta qahramonlari</h2>
        </div>
        {heroes?.range?.start && (
          <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            {new Date(heroes.range.start).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}
            {heroes.range.end ? ` — ${new Date(heroes.range.end).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}` : ""}
          </p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-border/80 bg-[hsl(var(--card))]/80 p-6 shadow-sm transition dark:border-border/70 dark:bg-[hsl(var(--card))]/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
            <Sparkles className="h-4 w-4" /> XP sprinti
          </h3>
          <ul className="space-y-3 text-sm">
            {xpLeaders.map((entry, index) => (
              <li
                key={`${entry.user.id}-xp`}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[hsl(var(--surface))] px-3 py-2 dark:bg-[hsl(var(--card))]/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-[hsl(var(--primary))] dark:text-[hsl(var(--foreground))] dark:hover:text-[hsl(var(--primary))]"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--primary))]">+{formatNumber(entry.total_xp ?? 0)} XP</span>
              </li>
            ))}
            {!xpLeaders.length && <li className="text-xs text-muted-foreground">Bu hafta XP yetakchilar yo'q.</li>}
          </ul>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border/80 bg-[hsl(var(--card))]/80 p-6 shadow-sm transition dark:border-border/70 dark:bg-[hsl(var(--card))]/70">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[hsl(var(--accent-purple))]">
            <Sparkles className="h-4 w-4" /> Trend mualliflar
          </h3>
          <ul className="space-y-3 text-sm">
            {authors.map((entry, index) => (
              <li
                key={`${entry.user.id}-authors`}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[hsl(var(--surface))] px-3 py-2 dark:bg-[hsl(var(--card))]/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground">#{index + 1}</span>
                  <Link
                    href={`/profile/${entry.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-[hsl(var(--accent-purple))] dark:text-[hsl(var(--foreground))] dark:hover:text-[hsl(var(--accent-purple))]"
                  >
                    {entry.user.name}
                  </Link>
                </div>
                <div className="text-right text-xs text-muted-foreground dark:text-muted-foreground">
                  <p className="font-semibold text-[hsl(var(--accent-purple))]">{formatNumber(entry.total_score ?? 0)} ovoz</p>
                  <p>{formatNumber(entry.posts_count ?? 0)} post</p>
                </div>
              </li>
            ))}
            {!authors.length && <li className="text-xs text-muted-foreground">Bu hafta trend mualliflar aniqlanmadi.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
