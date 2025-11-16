'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Hash, TrendingUp, Search } from 'lucide-react';

import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count?: number;
}

async function getTags() {
  try {
    const res = await api.get('/tags');
    return res.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

async function getTrendingTags() {
  try {
    const res = await api.get('/tags/trending');
    return res.data;
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return [];
  }
}

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrending, setShowTrending] = useState(true);

  const { data: allTags, isLoading: allLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    retry: 1,
  });

  const { data: trendingTags, isLoading: trendingLoading } = useQuery({
    queryKey: ['tags', 'trending'],
    queryFn: getTrendingTags,
    retry: 1,
  });

  const filteredTags =
    (showTrending ? trendingTags : allTags)?.filter((tag: Tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  if (allLoading || trendingLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(var(--secondary))]/15 text-[hsl(var(--secondary))]">
          <Hash className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Teglar
          </h1>
          <p className="text-lg text-muted-foreground">
            Mavzular bo'yicha postlarni toping, kuzating va hamjamiyat ritmini biling.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-[hsl(var(--card))]/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 p-1">
          <Button
            type="button"
            variant={showTrending ? 'default' : 'ghost'}
            onClick={() => setShowTrending(true)}
            className={cn(
              'gap-2 rounded-full px-5 text-sm font-medium',
              showTrending ? 'shadow-[0_10px_40px_rgba(56,189,248,0.35)]' : 'text-muted-foreground',
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Trend teglar
          </Button>
          <Button
            type="button"
            variant={!showTrending ? 'default' : 'ghost'}
            onClick={() => setShowTrending(false)}
            className={cn(
              'gap-2 rounded-full px-5 text-sm font-medium',
              !showTrending ? 'shadow-[0_10px_40px_rgba(16,185,129,0.35)]' : 'text-muted-foreground',
            )}
          >
            <Hash className="h-4 w-4" />
            Barcha teglar
          </Button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Teglarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredTags.length > 0 ? (
        <div className="rounded-3xl border border-border bg-[hsl(var(--surface))] p-6 shadow-inner">
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag: Tag) => (
              <Link
                key={tag.slug}
                href={`/posts?tag=${tag.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              >
                <Hash className="h-4 w-4 text-muted-foreground transition group-hover:text-[hsl(var(--primary))]" />
                <span>{tag.name}</span>
                {typeof tag.usage_count === 'number' && (
                  <Badge variant="secondary" className="rounded-full bg-muted text-xs font-semibold">
                    {tag.usage_count}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))]/80 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Hash className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {searchTerm ? 'Teglar topilmadi' : 'Teglar mavjud emas'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm
              ? "Boshqa kalit so'zlar bilan urinib ko'ring"
              : "Postlar yaratilganda teglar avtomatik paydo bo'ladi"}
          </p>
        </div>
      )}
    </div>
  );
}
