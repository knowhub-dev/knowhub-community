import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

import type { ServiceHealthStatus, SystemStatusSummary } from "./types";
import { formatDuration, formatNumber } from "./utils";

interface SystemStatusWidgetProps {
  status: SystemStatusSummary | null;
}

export function SystemStatusWidget({ status }: SystemStatusWidgetProps) {
  const services = status?.services ?? [];
  const metrics = status?.metrics ?? {};
  const updatedAt = status?.updated_at;

  const statusCopy: Record<ServiceHealthStatus, { label: string; className: string; icon: ReactNode }> = {
    operational: {
      label: "Barqaror",
      className: "bg-[hsl(var(--secondary))]/15 text-[hsl(var(--secondary))]",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    degraded: {
      label: "Sekin",
      className: "bg-[hsl(var(--accent-pink))]/15 text-[hsl(var(--accent-pink))]",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    outage: {
      label: "Nosoz",
      className: "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  };

  const aggregateStatus = services.reduce<ServiceHealthStatus>((current, service) => {
    if (service.status === "outage") return "outage";
    if (service.status === "degraded" && current === "operational") return "degraded";
    return current;
  }, "operational");

  const badge = statusCopy[aggregateStatus];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-[hsl(var(--surface))] p-6 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Tizim holati</p>
          <h3 className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">Real vaqt nazorati</h3>
        </div>
        <Link
          href="/status"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
        >
          Ko'rish <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-[hsl(var(--card))]/90 px-4 py-3">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.icon}
          {badge.label}
        </div>
        <p className="text-xs text-muted-foreground">Yangilangan: {updatedAt ? new Date(updatedAt).toLocaleTimeString("uz-UZ") : "—"}</p>
      </div>
      <div className="mt-6 space-y-3">
        {(services.length ? services.slice(0, 3) : new Array(3).fill(null)).map((service, index) => {
          if (!service) {
            return <div key={`skeleton-${index}`} className="h-14 animate-pulse rounded-2xl bg-[hsl(var(--card))]/70" />;
          }
          const copy = statusCopy[service.status];
          return (
            <div key={service.name} className="flex items-center justify-between rounded-2xl border border-border bg-[hsl(var(--card))]/90 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${copy.className}`}>
                {copy.icon}
                {copy.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-3 text-center text-xs sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Faol a'zolar</p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatNumber(metrics.active_users)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Navbat</p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">{formatNumber(metrics.queue_backlog)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-[hsl(var(--card))]/90 p-4">
          <p className="text-muted-foreground">Uptime</p>
          <p className="mt-2 text-xl font-semibold text-[hsl(var(--foreground))]">{formatDuration(metrics.uptime_seconds)}</p>
        </div>
      </div>
    </div>
  );
}
