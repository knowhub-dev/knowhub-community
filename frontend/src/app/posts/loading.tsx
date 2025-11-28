import PostSkeleton from "@/components/features/posts/PostSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      <PostSkeleton count={6} />
    </div>
  );
}
