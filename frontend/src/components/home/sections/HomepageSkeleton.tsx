export function HomepageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-4 rounded-[32px] border border-border/60 bg-[hsl(var(--card))]/70 p-8 shadow-[0_25px_75px_rgba(15,23,42,0.08)] backdrop-blur animate-pulse">
          <div className="h-6 w-40 rounded-full bg-muted/30" />
          <div className="h-10 w-3/4 rounded-full bg-muted/30" />
          <div className="h-4 w-5/6 rounded-full bg-muted/20" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`hero-stat-${index}`} className="h-20 rounded-[var(--radius-md)] bg-muted/20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/70 shadow-lg backdrop-blur animate-pulse" />
          <div className="h-32 rounded-[var(--radius-md)] border border-border/70 bg-[hsl(var(--card))]/70 shadow-lg backdrop-blur animate-pulse" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`skeleton-card-${index}`} className="h-64 rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/60 shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}
