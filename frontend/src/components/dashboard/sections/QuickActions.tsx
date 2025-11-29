import { PenSquare, PlusCircle, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';

type QuickActionsProps = {
  primaryCta?: string;
};

const actions = [
  { label: 'Create post', href: '/posts/create', icon: PenSquare },
  { label: 'Start mini-service', href: '/mini-services', icon: Rocket },
  { label: 'Log today\'s win', href: '/profile', icon: Sparkles },
];

export function QuickActions({ primaryCta }: QuickActionsProps) {
  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/70 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actions</p>
          <p className="text-sm text-muted-foreground">Move faster with quick jumps.</p>
        </div>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-glow"
        >
          <PlusCircle className="h-4 w-4" />
          {primaryCta ?? 'New'}
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/70 px-3 py-2 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_10px_40px_-28px_rgba(99,102,241,0.8)]"
            >
              <span className="rounded-lg bg-primary/10 p-2 text-primary shadow-inner">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
