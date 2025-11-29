import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookmarkCheck, Flame, MessageSquare } from 'lucide-react';

import type { SpotlightContent } from '@/app/home/helpers/fetchHome';
import { cn } from '@/lib/utils';

type SpotlightPostProps = {
  spotlight: SpotlightContent | null;
};

export function SpotlightPost({ spotlight }: SpotlightPostProps) {
  const hasSpotlight = Boolean(spotlight);
  const cover = spotlight?.cover_image;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/8 via-surface-1/90 to-accent/10 shadow-soft backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(79,70,229,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Flame className="h-4 w-4" />
          Spotlight
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              {spotlight?.title ?? "Aurora jamiyatidagi eng qiziqarli mavzu"}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {spotlight?.summary ??
                spotlight?.excerpt ??
                "Nufuzli mualliflar, chuqur tahlillar va jamiyatni ilhomlantiruvchi g'oyalar. Bilim markazidagi eng qimmatli post";
              }
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {spotlight?.author?.name || spotlight?.author?.username ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-1/80 px-3 py-1 font-semibold text-foreground">
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                  {spotlight.author?.name || spotlight.author?.username}
                </span>
              ) : null}
              {spotlight?.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full border border-border/50 bg-surface-1/80 px-3 py-1 font-medium text-foreground"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-lg bg-surface-1/70 px-3 py-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {spotlight?.metrics?.discussions ?? 0} muhokama
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-surface-1/70 px-3 py-2">
                <BookmarkCheck className="h-4 w-4 text-primary" />
                {spotlight?.metrics?.saves ?? 0} saqlash
              </span>
            </div>
            <Link
              href={spotlight?.cta_url ?? '/posts'}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5"
            >
              Spotlightni o'qish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/40 bg-surface-1/70 shadow-soft">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 opacity-60" />
            {cover ? (
              <Image
                src={cover}
                alt={spotlight?.title ?? 'Spotlight cover'}
                width={420}
                height={260}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-surface-2/60 text-center text-sm text-muted-foreground">
                Premium Aurora fon grafikasida spotlight vizuali
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn('absolute inset-0 rounded-3xl border border-transparent', hasSpotlight ? 'ring-1 ring-primary/40' : '')} />
    </section>
  );
}
