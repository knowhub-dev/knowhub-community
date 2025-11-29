import { Tag } from 'lucide-react';

import type { TagSummary } from '@/app/home/helpers/fetchHome';

type TrendingTagsProps = {
  tags: TagSummary[];
};

export function TrendingTags({ tags }: TrendingTagsProps) {
  const list = tags.length ? tags.slice(0, 10) : [];

  return (
    <section className="rounded-3xl border border-border/60 bg-surface-1/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Tag className="h-4 w-4" />
        Trend teglari
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Hamjamiyatda ko'p muhokama qilinayotgan mavzular.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {list.length === 0 ? (
          <span className="text-sm text-muted-foreground">Hozircha trend teglar yo'q.</span>
        ) : (
          list.map((tag) => (
            <span
              key={tag.slug}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2/80 px-4 py-2 text-sm font-semibold text-foreground shadow-soft"
            >
              #{tag.name}
              {typeof tag.usage_count === 'number' ? <span className="text-xs text-muted-foreground">{tag.usage_count}</span> : null}
            </span>
          ))
        )}
      </div>
    </section>
  );
}
