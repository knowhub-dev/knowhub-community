import Link from "next/link";

import type { PostSummary } from "@/components/home/types";
import { buildSnippet, timeAgo } from "@/components/home/utils";
import { ArrowRight, TrendingUp } from "lucide-react";

interface TrendSignalsSectionProps {
  spotlightPost: PostSummary | null;
  secondaryPosts: PostSummary[];
  queuePosts: PostSummary[];
}

export function TrendSignalsSection({ spotlightPost, secondaryPosts, queuePosts }: TrendSignalsSectionProps) {
  return (
    <section className="max-w-6xl px-6 pb-16 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-[hsl(var(--secondary))]" />
            <h2 className="text-xl font-semibold">Trend signallari</h2>
          </div>
          {spotlightPost ? (
            <Link
              href={`/posts/${spotlightPost.slug}`}
              className="group block overflow-hidden rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/90 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[hsl(var(--secondary))]/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] dark:border-border dark:bg-[hsl(var(--foreground))]/80"
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--secondary))]">
                Spotlight
                {spotlightPost.score ? <span className="text-[hsl(var(--secondary))]">{spotlightPost.score} ovoz</span> : null}
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-[hsl(var(--foreground))] transition group-hover:text-[hsl(var(--secondary))] dark:text-[hsl(var(--foreground))]">
                {spotlightPost.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">{buildSnippet(spotlightPost, 220)}</p>
              {spotlightPost.user && <p className="mt-4 text-xs text-muted-foreground">Muallif: {spotlightPost.user.name}</p>}
            </Link>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-border p-10 text-center text-sm text-muted-foreground dark:border-border dark:text-muted-foreground">
              Spotlight post mavjud emas.
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {secondaryPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-4 shadow-sm transition hover:border-[hsl(var(--secondary))]/60 hover:shadow-lg dark:border-border dark:bg-[hsl(var(--card))]/70"
              >
                <h4 className="text-base font-semibold text-[hsl(var(--foreground))] transition group-hover:text-[hsl(var(--secondary))] dark:text-[hsl(var(--foreground))]">{post.title}</h4>
                <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">{buildSnippet(post, 120)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-[hsl(var(--secondary))]">
                  Batafsil <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-5 shadow-sm dark:border-border dark:bg-[hsl(var(--card))]/70">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Monitoring navbat</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {queuePosts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-xl border border-transparent px-3 py-2 transition hover:border-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))]/10 dark:hover:border-[hsl(var(--secondary))]/50 dark:hover:bg-[hsl(var(--secondary))]/15"
                >
                  <Link
                    href={`/posts/${post.slug}`}
                    className="font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] dark:text-muted-foreground dark:hover:text-[hsl(var(--secondary))]"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                </li>
              ))}
              {!queuePosts.length && <li className="text-xs text-muted-foreground">Keyingi postlar hali yo'q.</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
