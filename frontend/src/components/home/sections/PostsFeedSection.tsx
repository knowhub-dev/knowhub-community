import type { PostsFeedSectionProps, SortType } from "@/components/home/sections/types";
import PostCard from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function renderPostsGrid(posts: PostsFeedSectionProps["posts"], postsLoading: boolean, postsIsError: boolean, postsError: unknown) {
  if (postsLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostCard key={`post-skeleton-${index}`} variant="skeleton" />
        ))}
      </div>
    );
  }

  if (postsIsError) {
    const postsErrorMessage = postsError instanceof Error ? postsError.message : "Postlarni yuklashda xatolik yuz berdi.";
    return (
      <div className="rounded-[var(--radius-md)] border border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/10 px-6 py-8 text-sm text-[hsl(var(--destructive))] dark:border-[hsl(var(--destructive))]/50 dark:bg-[hsl(var(--destructive))]/15 dark:text-[hsl(var(--destructive-foreground))]">
        {postsErrorMessage}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-[var(--radius-md)] border border-muted/40 bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground">
        Hozircha postlar topilmadi.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function PostsFeedSection({ sortType, setSortType, visibleTabs, posts, postsLoading, postsIsError, postsError }: PostsFeedSectionProps) {
  return (
    <section className="max-w-6xl px-6 pb-12 lg:px-8">
      <Tabs value={sortType} onValueChange={(value) => setSortType(value as SortType)} className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">Postlar</p>
            <h2 className="text-2xl font-semibold text-foreground">Hamjamiyat lentasi</h2>
            <p className="text-sm text-muted-foreground">
              Turli saralashlarga o'tib eng so'nggi, trenddagi yoki obunangizdagi muhokamalarni kuzating.
            </p>
          </div>
          <TabsList className="flex w-full flex-wrap gap-2 rounded-full border border-muted/30 bg-muted/20 p-1 sm:w-auto">
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="px-5 py-2 text-sm font-semibold">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {visibleTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {renderPostsGrid(posts, postsLoading, postsIsError, postsError)}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
