import { ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import type { DashboardData } from '@/app/dashboard/helpers/fetchDashboard';

import { LeftSidebar } from './layout/LeftSidebar';
import { MainContent } from './layout/MainContent';
import { RightSidebar } from './layout/RightSidebar';

type DashboardViewProps = {
  data: DashboardData;
};

export default function DashboardView({ data }: DashboardViewProps) {
  const name = data.profile?.name ?? 'Aurora builder';
  const headline = data.profile?.title ?? 'Keep shipping, stay curious.';

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-16 top-10 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute bottom-10 left-20 h-80 w-80 rounded-full bg-secondary/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">KnowHub Aurora</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Welcome back, {name.split(' ')[0]}</h1>
            <p className="text-base text-muted-foreground">{headline}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[hsl(var(--surface-2))]/70 px-3 py-1 font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Server-first dashboard
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[hsl(var(--surface-2))]/70 px-3 py-1 font-semibold text-foreground">
                Unified fetch layer
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-[hsl(var(--surface-2))]/70 px-3 py-1 font-semibold text-foreground">
                Aurora UI
              </span>
            </div>
          </div>
          <Link
            href="/posts/create"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-[0_12px_50px_-30px_rgba(79,70,229,0.9)] transition hover:-translate-y-0.5"
          >
            Launch new post <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr_300px]">
          <LeftSidebar
            profile={data.profile}
            xp={data.xp}
            badges={data.badges}
            missions={data.activity?.highlights?.map(text => ({ title: text, status: 'in-progress' as const }))}
          />
          <MainContent activity={data.activity} />
          <RightSidebar stats={data.stats} badges={data.badges} miniServers={data.miniServers} />
        </div>
      </div>
    </div>
  );
}
