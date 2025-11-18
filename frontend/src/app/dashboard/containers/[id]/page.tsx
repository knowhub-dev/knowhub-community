'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, RefreshCw, Settings, TerminalSquare } from 'lucide-react';

import { containerService, getContainerLogs, getContainerStats } from '@/lib/services/containers';
import { Container, ContainerStats } from '@/types/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogViewer } from '@/components/containers/LogViewer';
import ResourceChart, { ResourcePoint } from '@/components/containers/ResourceChart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EnvEntry {
  key: string;
  value: string;
}

const initialEnvEntries = (envVars?: Record<string, string> | null): EnvEntry[] => {
  if (!envVars) return [{ key: '', value: '' }];
  const entries = Object.entries(envVars).map(([key, value]) => ({ key, value }));
  return entries.length ? entries : [{ key: '', value: '' }];
};

export default function ContainerDashboardPage() {
  const params = useParams<{ id: string }>();
  const containerId = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: container, isLoading } = useQuery<Container>({
    queryKey: ['container', containerId],
    queryFn: () => containerService.getContainer(containerId),
    enabled: Number.isFinite(containerId),
  });

  const { data: stats } = useQuery<ContainerStats>({
    queryKey: ['container', containerId, 'stats'],
    queryFn: () => getContainerStats(containerId),
    refetchInterval: 5000,
    enabled: Number.isFinite(containerId),
  });

  const { data: logs, refetch: refetchLogs } = useQuery<{ lines: string[] }>({
    queryKey: ['container', containerId, 'logs'],
    queryFn: () => getContainerLogs(containerId),
    refetchInterval: 4000,
    enabled: Number.isFinite(containerId),
  });

  const [envEntries, setEnvEntries] = useState<EnvEntry[]>(initialEnvEntries(container?.env_vars));
  const [metrics, setMetrics] = useState<ResourcePoint[]>([]);

  useEffect(() => {
    setEnvEntries(initialEnvEntries(container?.env_vars));
  }, [container?.env_vars]);

  useEffect(() => {
    if (!stats) return;
    setMetrics((prev) => {
      const next = [...prev, { timestamp: new Date().toISOString(), value: stats.cpu_usage }];
      return next.slice(-20);
    });
  }, [stats]);

  const updateEnvMutation = useMutation({
    mutationFn: () =>
      containerService.updateContainerEnv(
        containerId,
        Object.fromEntries(envEntries.filter((e) => e.key).map((e) => [e.key, e.value])),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(['container', containerId]);
    },
  });

  const statusBadge = useMemo(() => {
    const status = container?.status ?? 'created';
    const color =
      status === 'running'
        ? 'bg-emerald-500/80 text-emerald-50'
        : status === 'stopped'
          ? 'bg-amber-500/80 text-white'
          : 'bg-slate-500/70 text-white';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${color}`}>
        {status}
      </span>
    );
  }, [container?.status]);

  const handleAddRow = () => setEnvEntries((prev) => [...prev, { key: '', value: '' }]);
  const handleChangeEntry = (index: number, field: keyof EnvEntry, value: string) => {
    setEnvEntries((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };
  const handleRemoveEntry = (index: number) => setEnvEntries((prev) => prev.filter((_, idx) => idx !== index));

  if (isLoading || !container) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        <div className="h-96 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const domainSuffix = container.subdomain
    ? `${container.subdomain}.${process.env.NEXT_PUBLIC_DOMAIN ?? 'example.com'}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        {statusBadge}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 dark:bg-gray-900/50 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Mini Service</p>
            <h1 className="text-3xl font-bold">{container.name}</h1>
            {container.subdomain && <p className="text-sm text-muted-foreground">{domainSuffix}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries(['container', containerId, 'stats'])}>
              <RefreshCw className="h-4 w-4" /> Refresh stats
            </Button>
            {container.subdomain && (
              <Link href={`https://${domainSuffix}`} target="_blank" rel="noreferrer">
                <Button variant="primary">
                  <ExternalLink className="h-4 w-4" /> Visit site
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/10 backdrop-blur border border-white/10">
          <TabsTrigger value="overview" className="gap-2">
            <Settings className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="terminal" className="gap-2">
            <TerminalSquare className="h-4 w-4" /> Terminal
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2 text-lg font-semibold">{container.status}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-sm text-muted-foreground">CPU</p>
              <div className="mt-2 text-lg font-semibold">{stats ? stats.cpu_usage.toFixed(2) : '0.00'}%</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-sm text-muted-foreground">Memory</p>
              <div className="mt-2 text-lg font-semibold">{stats ? stats.memory_usage.toFixed(2) : '0.00'} MB</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ResourceChart title="CPU Usage" data={metrics} unit="%" color="#a855f7" />
            <ResourceChart
              title="Memory Usage"
              data={metrics.map((entry) => ({ ...entry, value: stats?.memory_usage ?? entry.value }))}
              unit="MB"
              color="#22c55e"
            />
          </div>
        </TabsContent>

        <TabsContent value="terminal">
          <LogViewer lines={logs?.lines ?? []} onRefresh={() => refetchLogs()} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Environment Variables</h3>
                <p className="text-sm text-muted-foreground">Update the runtime configuration for your mini-service.</p>
              </div>
              <Button variant="secondary" onClick={handleAddRow}>
                Add variable
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {envEntries.map((entry, index) => (
                <div key={`env-${index}`} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] items-center">
                  <div className="space-y-2">
                    <Label htmlFor={`key-${index}`}>Key</Label>
                    <Input
                      id={`key-${index}`}
                      value={entry.key}
                      onChange={(e) => handleChangeEntry(index, 'key', e.target.value.toUpperCase())}
                      placeholder="API_KEY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`value-${index}`}>Value</Label>
                    <Input
                      id={`value-${index}`}
                      value={entry.value}
                      onChange={(e) => handleChangeEntry(index, 'value', e.target.value)}
                      placeholder="super-secret"
                    />
                  </div>
                  <div className="flex h-full items-end">
                    <Button variant="ghost" className="text-sm" onClick={() => handleRemoveEntry(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="primary" isLoading={updateEnvMutation.isLoading} onClick={() => updateEnvMutation.mutate()}>
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
