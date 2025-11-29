import Link from 'next/link';
import { ArrowRight, Bookmark, Clock3, MessageCircle, Sparkle } from 'lucide-react';

import type { HomeFeedItem } from '@/app/home/helpers/fetchHome';

function formatRelative(date?: string) {
  if (!date) return 'hozir';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(date));
}

type FeedShowcaseProps = {
  feed: HomeFeedItem[];
};

export function FeedShowcase({ feed }: FeedShowcaseProps) {
  const items = feed.length ? feed.slice(0, 6) : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Jamiyat oqimi</p>
          <h3 className="text-2xl font-semibold text-foreground">Tezkor postlar va muhokamalar</h3>
          <p className="text-sm text-muted-foreground">So'nggi nashrlar SSR orqali darhol yuklanadi.</p>
        </div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-1/70 px-4 py-2 text-sm font-semibold text-foreground shadow-soft backdrop-blur-xs transition hover:border-primary/60 hover:text-primary"
        >
          Barcha postlar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface-1/70 p-8 text-center text-muted-foreground">
          Hozircha postlar mavjud emas. Birinchi bo'lib fikr bildiring!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item.id ?? index}-${item.title}`}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface-1/80 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                  <Sparkle className="h-3.5 w-3.5" />
                  {formatRelative(item.created_at)}
                </span>
                <span>{item.user?.name || item.user?.username || "Jamiyat a'zosi"}</span>
              </div>

              <h4 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">{item.title}</h4>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.excerpt ?? item.summary ?? ''}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.tags?.slice(0, 3).map((tag) => (
                  <span key={tag.slug} className="rounded-full bg-surface-2/70 px-3 py-1 font-medium text-foreground">
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2/60 px-2 py-1">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    {item.stats?.comments ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2/60 px-2 py-1">
                    <Bookmark className="h-3.5 w-3.5 text-primary" />
                    {item.stats?.saves ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                  <Clock3 className="h-3.5 w-3.5" />
                  Real-time
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
