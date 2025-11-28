import { Skeleton } from "@/components/ui/skeleton";

interface PostSkeletonProps {
  count?: number;
  className?: string;
}

export default function PostSkeleton({ count = 1, className }: PostSkeletonProps) {
  return (
    <div className={className ?? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
