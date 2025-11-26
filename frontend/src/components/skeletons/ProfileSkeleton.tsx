import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border/70 bg-[hsl(var(--surface))] p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="space-y-3 rounded-xl border border-border/70 bg-[hsl(var(--surface))] p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
