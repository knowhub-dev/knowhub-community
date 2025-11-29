import { AuroraBackground } from '@/components/backgrounds';
import type { HomeLandingData, TagSummary } from '@/app/home/helpers/fetchHome';

import { CommunityHeroes } from './sections/CommunityHeroes';
import { FeedShowcase } from './sections/FeedShowcase';
import { HeroSection } from './sections/HeroSection';
import { QuickActions } from './sections/QuickActions';
import { SpotlightPost } from './sections/SpotlightPost';
import { StatsStrip } from './sections/StatsStrip';
import { TrendingTags } from './sections/TrendingTags';

type GuestLandingViewProps = {
  data: HomeLandingData;
};

function deriveTagsFromFeed(feed: HomeLandingData['feed']): TagSummary[] {
  const tagMap = new Map<string, TagSummary>();

  feed.forEach((item) => {
    item.tags?.forEach((tag) => {
      if (!tag.name || !tag.slug) return;
      const existing = tagMap.get(tag.slug);
      tagMap.set(tag.slug, {
        name: tag.name,
        slug: tag.slug,
        usage_count: tag.usage_count ?? existing?.usage_count ?? 0,
      });
    });
  });

  return Array.from(tagMap.values()).slice(0, 12);
}

export default function GuestLandingView({ data }: GuestLandingViewProps) {
  const trendingTags = (data.stats?.trending_tags ?? []).length ? data.stats?.trending_tags ?? [] : deriveTagsFromFeed(data.feed);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="pointer-events-none absolute inset-0">
        <AuroraBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background/60 dark:from-primary/15" />
      </div>

      <div className="relative z-10 space-y-10 pb-16">
        <HeroSection stats={data.stats} feedHighlights={data.feed.slice(0, 4)} spotlight={data.spotlight} />

        <div className="container space-y-10">
          <StatsStrip stats={data.stats} />

          <div className="grid gap-8 xl:grid-cols-[2fr,1.05fr]">
            <SpotlightPost spotlight={data.spotlight} />
            <QuickActions />
          </div>

          <FeedShowcase feed={data.feed} />

          <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
            <CommunityHeroes heroes={data.heroes} />
            <TrendingTags tags={trendingTags} />
          </div>
        </div>
      </div>
    </div>
  );
}
