import Link from "next/link";
import { Activity, AlertTriangle, MessageCircle, PenSquare, Sparkles } from "lucide-react";

import type { ActivityEvent } from "./types";
import { timeAgo } from "./utils";

interface ActivityFeedProps {
  feed: ActivityEvent[];
  variant?: "compact" | "full";
  limit?: number;
}

const activityIcon = (type: ActivityEvent["type"]) => {
  switch (type) {
    case "post":
      return <PenSquare className="h-4 w-4" />;
    case "comment":
      return <MessageCircle className="h-4 w-4" />;
    case "badge":
      return <Sparkles className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const activityDescription = (event: ActivityEvent) => {
  if (event.type === "post") {
    return (
      <div>
        <p className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">{event.payload?.title}</p>
        {event.payload?.excerpt && (
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">{event.payload.excerpt}</p>
        )}
      </div>
    );
  }

  if (event.type === "comment" && event.payload?.post) {
    return (
      <div>
        <p className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">
          Izoh: {event.payload.post.title}
        </p>
        {event.payload.excerpt && (
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">{event.payload.excerpt}</p>
        )}
      </div>
    );
  }

  if (event.type === "badge" && event.payload?.name) {
    return (
      <p className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">{event.payload.name}</p>
    );
  }

  return <span className="font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))]">Faollik</span>;
};

export function ActivityFeed({ feed, variant = "full", limit }: ActivityFeedProps) {
  const items = typeof limit === "number" ? feed.slice(0, limit) : feed;

  if (!items.length) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="mt-4 space-y-3">
        {items.map((event) => (
          <div key={`${event.type}-${event.id}`} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border/60 bg-[hsl(var(--surface))] p-4">
            <div className="mt-1 rounded-full bg-[hsl(var(--foreground))]/10 p-2">{activityIcon(event.type)}</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {event.user ? (
                  <Link href={`/profile/${event.user.username}`} className="font-medium text-[hsl(var(--foreground))] transition hover:text-[hsl(var(--primary))]">
                    {event.user.name}
                  </Link>
                ) : (
                  <span className="font-medium text-muted-foreground">Anonim</span>
                )}
                <span>•</span>
                <span>{timeAgo(event.created_at)}</span>
              </div>
              {activityDescription(event)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="max-w-6xl px-6 pb-20 lg:px-8">
      <div className="flex items-center gap-3 pb-6">
        <Activity className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h2 className="text-xl font-semibold">Hamjamiyat pulsi</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((event) => (
          <div
            key={`${event.type}-${event.id}`}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border/80 bg-[hsl(var(--card))]/80 p-4 shadow-sm transition hover:border-[hsl(var(--primary))]/60 hover:shadow-lg dark:border-border/70 dark:bg-[hsl(var(--card))]/70"
          >
            <div className="mt-1 rounded-full bg-[hsl(var(--foreground))]/80 p-2 dark:bg-[hsl(var(--foreground))]/30">{activityIcon(event.type)}</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                {event.user ? (
                  <Link
                    href={`/profile/${event.user.username}`}
                    className="font-medium text-[hsl(var(--foreground))] transition hover:text-[hsl(var(--primary))] dark:text-muted-foreground dark:hover:text-[hsl(var(--primary))]"
                  >
                    {event.user.name}
                  </Link>
                ) : (
                  <span className="font-medium text-muted-foreground">Anonim</span>
                )}
                <span>•</span>
                <span>{timeAgo(event.created_at)}</span>
              </div>
              {activityDescription(event)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
