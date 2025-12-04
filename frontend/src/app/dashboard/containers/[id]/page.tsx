'use client';

import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, GitBranch, RefreshCw, Settings, Trash2, UploadCloud, Play, Square } from 'lucide-react';

import { containerFileService } from '@/lib/services/containerFiles';
import { containerService, getContainerStats } from '@/lib/services/containers';
import { Container, ContainerStats } from '@/types/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const containerId = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: container, isLoading } = useQuery<Container>({
    queryKey: ['container', containerId],
    queryFn: () => containerService.getContainer(containerId),
    enabled: Number.isFinite(containerId),
  });

  const { data: stats, isFetching: isFetchingStats } = useQuery<ContainerStats>({
    queryKey: ['container', containerId, 'stats'],
    queryFn: () => getContainerStats(containerId),
    refetchInterval: 5000,
    enabled: Number.isFinite(containerId),
  });

  const [envEntries, setEnvEntries] = useState<EnvEntry[]>(initialEnvEntries(container?.env_vars));
  const [gitUrl, setGitUrl] = useState('');
  const [gitMessage, setGitMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEnvEntries(initialEnvEntries(container?.env_vars));
  }, [container?.env_vars]);

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

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => containerFileService.uploadStaticFiles(containerId, files),
    onSuccess: () => {
      setUploadMessage('Fayllar muvaffaqiyatli yuklandi.');
    },
    onError: () => setUploadMessage('Fayllarni yuklashda muammo yuz berdi.'),
  });

  const resetFilesMutation = useMutation({
    mutationFn: () => containerFileService.resetFiles(containerId),
    onSuccess: () => setUploadMessage('Yuklangan fayllar tozalandi.'),
    onError: () => setUploadMessage('Fayllarni o‘chirishda xatolik yuz berdi.'),
  });

  const stopMutation = useMutation({
    mutationFn: () => containerService.stopContainer(containerId),
    onSuccess: () => queryClient.invalidateQueries(['container', containerId]),
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      await containerService.stopContainer(containerId);
      return containerService.startContainer(containerId);
    },
    onSuccess: () => queryClient.invalidateQueries(['container', containerId]),
  });

  const deleteMutation = useMutation({
    mutationFn: () => containerService.deleteContainer(containerId),
    onSuccess: () => router.push('/dashboard'),
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

  const publicDomain = process.env.NEXT_PUBLIC_DOMAIN_SUFFIX ?? process.env.NEXT_PUBLIC_DOMAIN ?? 'knowhub.uz';
  const domainSuffix = container?.subdomain ? `${container.subdomain}.${publicDomain}` : null;

  const handleAddRow = () => setEnvEntries((prev) => [...prev, { key: '', value: '' }]);
  const handleChangeEntry = (index: number, field: keyof EnvEntry, value: string) => {
    setEnvEntries((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };
  const handleRemoveEntry = (index: number) => setEnvEntries((prev) => prev.filter((_, idx) => idx !== index));

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadMessage(null);
    uploadMutation.mutate(Array.from(files));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

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
            {domainSuffix && (
              <Link href={`https://${domainSuffix}`} target="_blank" rel="noreferrer" className="text-sm text-primary">
                https://{domainSuffix}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => queryClient.invalidateQueries(['container', containerId, 'stats'])}
              isLoading={isFetchingStats}
            >
              <RefreshCw className="h-4 w-4" /> Refresh stats
            </Button>
            {domainSuffix && (
              <Link href={`https://${domainSuffix}`} target="_blank" rel="noreferrer">
                <Button variant="default">
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
            <Settings className="h-4 w-4" /> Overview (Boshqaruv)
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Sozlamalar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2 text-lg font-semibold capitalize">{container.status}</div>
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

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jamoaga ko‘rinadigan havola</p>
                <p className="text-lg font-semibold text-foreground">
                  {domainSuffix ? `https://${domainSuffix}` : 'URL tayyorlanmoqda'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => restartMutation.mutate()}
                  isLoading={restartMutation.isLoading}
                >
                  <Play className="h-4 w-4" /> Restart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => stopMutation.mutate()}
                  isLoading={stopMutation.isLoading}
                  disabled={stopMutation.isLoading}
                >
                  <Square className="h-4 w-4" /> Stop
                </Button>
              </div>
            </div>

            <div
              className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center"
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-foreground">FileManager — index.html va CSS yuklang</p>
                <p className="text-xs">Drag &amp; drop orqali yuklang yoki kompyuteringizdan tanlang.</p>
                <Input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(event) => handleFiles(event.target.files)}
                  accept=".html,.css,.js,.txt"
                  className="mt-3 max-w-xs cursor-pointer text-sm"
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Fayl tanlang
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetFilesMutation.mutate()}
                    isLoading={resetFilesMutation.isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Reset files
                  </Button>
                </div>
                {uploadMessage && <p className="text-xs text-foreground">{uploadMessage}</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Git Integration</h3>
                <p className="text-sm text-muted-foreground">Repo URL ni kiriting, keyingi bosqichda avtomatik klonlash.</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setGitMessage('Git manzili saqlandi.');
                }}
              >
                <GitBranch className="mr-2 h-4 w-4" /> Saqlash
              </Button>
            </div>
            <Input
              value={gitUrl}
              onChange={(event) => setGitUrl(event.target.value)}
              placeholder="https://github.com/user/repo.git"
            />
            {gitMessage && <p className="text-xs text-foreground">{gitMessage}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Environment Variables</h3>
                <p className="text-sm text-muted-foreground">Ishga tushirish uchun sozlamalarni shu yerda saqlang.</p>
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
              <Button variant="default" isLoading={updateEnvMutation.isLoading} onClick={() => updateEnvMutation.mutate()}>
                Save changes
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-destructive">Dangerous Zone</h3>
                <p className="text-sm text-muted-foreground">Serverni butunlay o‘chirish.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                isLoading={deleteMutation.isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Server
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
