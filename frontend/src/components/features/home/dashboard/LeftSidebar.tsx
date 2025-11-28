import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Flame, Home, Layers3, Tags, Wand2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CommunityLink = {
  name: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
};

export type NavigationLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type LeftSidebarProps = {
  menuLinks?: NavigationLink[];
  communities?: CommunityLink[];
  className?: string;
};

const defaultMenuLinks: NavigationLink[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Popular', href: '/posts?sort=popular', icon: Flame },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Wiki', href: '/wiki', icon: BookOpen },
];

const defaultCommunities: CommunityLink[] = [
  { name: 'DevOps & Mini-Services', href: '/communities/devops', icon: Layers3 },
  { name: 'AI Builders', href: '/communities/ai-builders', icon: Wand2 },
  { name: 'Open Source Translators', href: '/communities/translators', icon: BookOpen },
];

export function LeftSidebar({
  menuLinks = defaultMenuLinks,
  communities = defaultCommunities,
  className,
}: LeftSidebarProps) {
  return (
    <aside
      className={cn(
        'rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-glass backdrop-blur-md',
        className,
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Menu</p>
        <nav className="mt-4 space-y-1">
          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10"
            >
              <item.icon className="h-4 w-4 text-primary" aria-hidden />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">My Communities</p>
        <div className="mt-4 space-y-3">
          {communities.map((community) => (
            <Link
              key={community.href}
              href={community.href}
              className="group flex items-center gap-3 rounded-2xl border border-border/40 bg-card/40 px-3 py-3 transition hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {community.icon ? <community.icon className="h-4 w-4" aria-hidden /> : <Layers3 className="h-4 w-4" aria-hidden />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{community.name}</p>
                {community.description ? (
                  <p className="text-xs text-muted-foreground">{community.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
