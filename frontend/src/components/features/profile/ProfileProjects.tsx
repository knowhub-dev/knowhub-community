import { Layers, Rocket } from 'lucide-react';

import ContainerCard from '@/components/features/containers/ContainerCard';
import type { Container } from '@/types/container';

interface ProfileProjectsProps {
  containers?: Container[] | null;
}

export function ProfileProjects({ containers }: ProfileProjectsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects</p>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Mini-services gallery</h3>
        </div>
        <Rocket className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
      </div>

      {containers?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {containers.map((container) => (
            <ContainerCard key={container.id} container={container} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-8 text-center text-sm text-muted-foreground">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--background))]">
            <Layers className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
          </div>
          <p className="mt-3">No deployed containers yet. Launch your first mini-service to showcase it here.</p>
        </div>
      )}
    </div>
  );
}
