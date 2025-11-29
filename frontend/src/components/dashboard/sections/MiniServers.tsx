import { Cloud, Globe2, Server, WifiOff } from 'lucide-react';

import type { DashboardMiniServer } from '@/app/dashboard/helpers/fetchDashboard';

type MiniServersProps = {
  servers: DashboardMiniServer[];
};

export function MiniServers({ servers }: MiniServersProps) {
  const items = servers.length
    ? servers
    : [
        { id: 'solvera', name: 'Solvera API Proxy', status: 'online', uptime: 99.9, latency_ms: 42, region: 'eu-central-1' },
        { id: 'docs', name: 'Docs Preview', status: 'maintenance', uptime: 97.2, latency_ms: 88, region: 'us-east-1' },
      ];

  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/70 p-5 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mini servers</p>
          <p className="text-sm text-muted-foreground">Preview your personal infra.</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          <Cloud className="h-3.5 w-3.5" />
          Aurora edge
        </div>
      </div>

      <div className="space-y-3">
        {items.map(server => {
          const status = server.status ?? 'offline';
          const isOnline = status === 'online';
          const isMaintenance = status === 'maintenance';

          return (
            <div
              key={server.id ?? server.name}
              className="relative overflow-hidden rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/70 p-4 shadow-inner"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary/10 p-2 text-primary shadow-inner">
                    <Server className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{server.name}</p>
                    <p className="text-xs text-muted-foreground">{server.region ?? 'edge'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={
                      isOnline
                        ? 'text-green-500'
                        : isMaintenance
                          ? 'text-amber-400'
                          : 'text-muted-foreground'
                    }
                  >
                    {isOnline ? 'Online' : isMaintenance ? 'Maintenance' : 'Offline'}
                  </span>
                  {isOnline ? <Globe2 className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="relative mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <span>Uptime {server.uptime ?? '—'}%</span>
                <span>Latency {server.latency_ms ?? '—'}ms</span>
                <span>Region {server.region ?? 'edge'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
