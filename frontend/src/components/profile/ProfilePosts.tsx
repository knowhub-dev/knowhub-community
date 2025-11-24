import Link from 'next/link';
import { ExternalLink, ScrollText, Sparkles } from 'lucide-react';

import type { Post } from '@/types';

interface ProfilePostsProps {
  posts?: Post[] | null;
  username: string;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

export function ProfilePosts({ posts, username }: ProfilePostsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Posts & Wiki</p>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Published contributions</h3>
        </div>
        <ScrollText className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
      </div>

      {posts?.length ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-4 shadow-subtle backdrop-blur transition hover:-translate-y-0.5 hover:shadow-neon"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/posts/${post.slug}`} className="text-lg font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]">
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{formatDate(post.created_at)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-[hsl(var(--accent-purple))]" /> {post.score} kudos
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{post.content_markdown}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {post.tags?.map((tag) => (
                  <span key={tag.slug} className="rounded-full bg-[hsl(var(--muted))]/50 px-3 py-1">#{tag.name}</span>
                ))}
                <Link
                  href={`/posts/${post.slug}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]"
                >
                  Read <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-8 text-center text-sm text-muted-foreground">
          @{username} has not published any posts yet.
        </div>
      )}
    </div>
  );
}
