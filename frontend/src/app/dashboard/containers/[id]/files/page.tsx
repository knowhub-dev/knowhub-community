'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, HardDrive } from 'lucide-react';
import { FileExplorer } from '@/components/containers/FileExplorer';

export default function ContainerFilesPage() {
  const params = useParams();
  const containerId = Number(params?.id);

  if (!containerId) {
    return <p className="p-6 text-sm text-red-600">Invalid container id.</p>;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/containers"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Containers
            </Link>
            <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
              <HardDrive className="h-4 w-4 text-primary" /> Container Files
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Manage uploaded code via bind-mounted storage for this container.</div>
        </div>

        <FileExplorer containerId={containerId} />
      </div>
    </div>
  );
}
