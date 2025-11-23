'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { containerService } from '@/lib/services/containers';
import { CreateContainerDto, Container } from '@/types/container';
import { useAuth } from '@/providers/AuthProvider';
import { ShieldCheck, Github, Cpu, Database, Globe2, Lock } from 'lucide-react';
import Link from 'next/link';

type EnvRow = { key: string; value: string };

const defaultEnvRows: EnvRow[] = [
  { key: 'GIT_CLONE_URL', value: '' },
  { key: 'GIT_CLONE_BRANCH', value: 'main' },
];

export default function MiniServicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ['containers', 'options'],
    queryFn: containerService.getOptions,
  });

  const { data: containers = [], isLoading: containersLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: containerService.getContainers,
  });

  const templates = options?.templates ?? [];
  const defaultTemplate = templates[0]?.type ?? 'node';
  const miniSettings = options?.mini_services;
  const minXpRequired = miniSettings?.min_xp_required ?? options?.min_xp_required ?? 0;
  const maxPerUser = miniSettings?.max_per_user ?? options?.max_containers_per_user ?? null;
  const mysqlPerUser = miniSettings?.mysql_instances_per_user ?? 2;
  const domainSuffix = options?.domain_suffix ? `.${options.domain_suffix}` : '';
  const canCreate = Boolean(options?.can_create && (miniSettings?.enabled ?? true));

  const [formData, setFormData] = useState<CreateContainerDto>({
    name: '',
    subdomain: '',
    type: defaultTemplate,
    cpu_limit: 1,
    memory_limit: 512,
    disk_limit: 2048,
  });
  const [envRows, setEnvRows] = useState<EnvRow[]>(defaultEnvRows);

  useEffect(() => {
    if (templates.length) {
      setFormData((prev) => ({ ...prev, type: prev.type || templates[0]?.type }));
    }
  }, [templates]);

  const xpGateMessage = useMemo(() => {
    if (!user) return 'Mini serverlarni ishga tushirish uchun avvalo tizimga kiring.';
    if (user?.xp === undefined) return null;
    if (user.xp >= minXpRequired) return null;
    const remaining = Math.max(minXpRequired - (user?.xp ?? 0), 0);
    return `Yana ${remaining} XP to'plang va o'zingizning mini serveringizni yoqing.`;
  }, [user, minXpRequired]);

  const remainingSlots = useMemo(() => {
    if (maxPerUser === null) return null;
    return Math.max(maxPerUser - (options?.current_count ?? 0), 0);
  }, [maxPerUser, options?.current_count]);

  const createMutation = useMutation({
    mutationFn: containerService.createContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      setFormData((prev) => ({ ...prev, name: '', subdomain: '' }));
    },
  });

  const normalizedEnvVars = useMemo(() => {
    const result: Record<string, string> = {};
    envRows.forEach(({ key, value }) => {
      if (!key.trim() || !value.trim()) return;
      result[key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')] = value.trim();
    });
    return result;
  }, [envRows]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || (user?.xp ?? 0) < minXpRequired) return;

    createMutation.mutate({ ...formData, env_vars: normalizedEnvVars });
  };

  const addEnvRow = () => setEnvRows((rows) => [...rows, { key: '', value: '' }]);

  const updateEnvRow = (index: number, next: Partial<EnvRow>) => {
    setEnvRows((rows) => rows.map((row, idx) => (idx === index ? { ...row, ...next } : row)));
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <header className="rounded-3xl border border-border bg-[hsl(var(--card))] p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))/10] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary))]">
                <ShieldCheck className="h-4 w-4" />
                Mini serverlar — xavfsiz, avtonom va sizga tegishli
              </div>
              <h1 className="text-3xl font-bold tracking-tight">O&apos;z loyihangizni mini serverda ishga tushiring</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Har bir foydalanuvchiga izolyatsiya qilingan Docker muhiti, maxsus subdomen va ikki dona MySQL
                ma&apos;lumotlar bazasi kvotasi ajratiladi. GitHub’dan klonlash, xavfsiz env sozlamalar va bir nechta
                runtime obrazlari yordamida loyihangizni bir necha daqiqada tayyorlang.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[hsl(var(--muted))]/40 p-4 text-sm">
              <p className="font-semibold">Joriy holat</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>XP holati: {user?.xp ?? 0} / {minXpRequired} XP</li>
                <li>Ruxsat: {(miniSettings?.enabled ?? true) ? 'Faol' : 'Oʻchirilgan'}</li>
                <li>
                  Slotlar: {remainingSlots === null ? 'Cheksiz' : `${remainingSlots} / ${maxPerUser}`}
                </li>
                <li>MySQL kvotasi: {mysqlPerUser} ta instansiya</li>
              </ul>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <section className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Yangi mini server</h2>
                <p className="text-sm text-muted-foreground">Subdomen, runtime va Git sozlamalarini tanlang.</p>
              </div>
              {domainSuffix && (
                <span className="rounded-full bg-[hsl(var(--muted))]/70 px-3 py-1 text-xs text-muted-foreground">
                  Domen suffiksi: {domainSuffix}
                </span>
              )}
            </div>

            {xpGateMessage && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {xpGateMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Loyihangiz nomi
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                    placeholder="my-portfolio"
                    required
                  />
                </label>
                <label className="text-sm font-medium">
                  Subdomen
                  <div className="mt-2 flex items-center">
                    <input
                      value={formData.subdomain ?? ''}
                      onChange={(event) =>
                        setFormData({ ...formData, subdomain: event.target.value.toLowerCase() })
                      }
                      className="w-full rounded-l-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                      placeholder="project"
                      minLength={options?.subdomain_min_length ?? 3}
                      maxLength={options?.subdomain_max_length ?? 30}
                    />
                    <span className="rounded-r-xl border border-l-0 border-border bg-[hsl(var(--muted))]/60 px-3 py-2 text-xs text-muted-foreground">
                      {domainSuffix}
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Runtime template
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                  >
                    {templates.map((template) => (
                      <option
                        key={template.type}
                        value={template.type}
                        className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                      >
                        {template.type.toUpperCase()} — {template.image}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  GitHub repository (ixtiyoriy)
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-[hsl(var(--muted))]/40 px-3 py-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={envRows[0]?.value ?? ''}
                      onChange={(event) => updateEnvRow(0, { value: event.target.value })}
                      placeholder="https://github.com/user/repo"
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  {!miniSettings?.git_clone_enabled && (
                    <p className="mt-1 text-xs text-amber-600">Admin Git klonlashni vaqtincha o&apos;chirib qo&apos;ygan.</p>
                  )}
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm font-medium">
                  CPU (yadro)
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={formData.cpu_limit}
                    onChange={(event) => setFormData({ ...formData, cpu_limit: parseInt(event.target.value, 10) })}
                    className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                  />
                </label>
                <label className="text-sm font-medium">
                  Xotira (MB)
                  <input
                    type="number"
                    min={256}
                    max={4096}
                    step={128}
                    value={formData.memory_limit}
                    onChange={(event) => setFormData({ ...formData, memory_limit: parseInt(event.target.value, 10) })}
                    className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                  />
                </label>
                <label className="text-sm font-medium">
                  Disk (MB)
                  <input
                    type="number"
                    min={1024}
                    max={10240}
                    step={512}
                    value={formData.disk_limit}
                    onChange={(event) => setFormData({ ...formData, disk_limit: parseInt(event.target.value, 10) })}
                    className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Env sozlamalari</p>
                    <p className="text-xs text-muted-foreground">Tokenlar, repo URL va MySQL DSN larni shu yerga joylang.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addEnvRow}
                    className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
                  >
                    + Maydon qo&apos;shish
                  </button>
                </div>
                <div className="space-y-2">
                  {envRows.map((row, index) => (
                    <div key={`${row.key}-${index}`} className="grid gap-2 md:grid-cols-[1fr,1fr]">
                      <input
                        value={row.key}
                        onChange={(event) => updateEnvRow(index, { key: event.target.value })}
                        placeholder="KEY"
                        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                      />
                      <input
                        value={row.value}
                        onChange={(event) => updateEnvRow(index, { value: event.target.value })}
                        placeholder="qiymat yoki DSN"
                        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/20]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Xavfsizlik: har bir container izolyatsiya qilingan, rootfs o&apos;qish rejimida va qo&apos;shimcha capability lar o&apos;chirilgan.
                  Admin panel orqali git klonlash va kvotalar boshqariladi.
                </div>
                <button
                  type="submit"
                  disabled={!canCreate || createMutation.isPending || (user?.xp ?? 0) < minXpRequired}
                  className="inline-flex items-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[hsl(var(--primary))/85] disabled:cursor-not-allowed disabled:bg-[hsl(var(--primary))/50]"
                >
                  {createMutation.isPending ? 'Yaratilmoqda...' : 'Mini serverni ishga tushirish'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Cpu className="h-4 w-4" /> Resurs va xavfsizlik qoidalari
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>Minimal XP: {minXpRequired} — admin tomonidan boshqariladi.</li>
                <li>Slotlar: {maxPerUser ?? 'cheklanmagan'} ta container / foydalanuvchi.</li>
                <li>MySQL: har foydalanuvchiga {mysqlPerUser} ta ajratilgan instansiya.</li>
                <li>Git klonlash: {miniSettings?.git_clone_enabled === false ? 'oʻchirilgan' : 'faol'}.</li>
                <li>Subdomenlar: {domainSuffix || 'aniqlanmoqda'} prefiksidan foydalaniladi.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Database className="h-4 w-4" /> MySQL ajratmalari
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Har bir container uchun ikkita alohida MySQL instansiya rezerv qilinadi. Credential va DSN lar container envlarda
                avtomatik paydo bo&apos;lishi uchun <code className="rounded bg-[hsl(var(--muted))]/60 px-1">DB_HOST_1</code> va
                <code className="rounded bg-[hsl(var(--muted))]/60 px-1">DB_HOST_2</code> kabi kalitlardan foydalaning.
              </p>
              <div className="mt-3 rounded-xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-3 text-xs">
                <p className="font-semibold text-[hsl(var(--foreground))]">GitHub deploy oqimi</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                  <li>Repo URL va tarmoqni kiriting.</li>
                  <li>Env sozlamalariga <code>GIT_CLONE_URL</code> va <code>GIT_CLONE_BRANCH</code> qo&apos;shing.</li>
                  <li>Yaratilgach, webhook va deploy loglari container kartasida ko&apos;rinadi.</li>
                </ol>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="h-4 w-4" /> Subdomen nazorati
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Subdomen qoidalarga rioya qiling: kichik harflar, raqamlar va tire. Rezervdagi prefikslar (admin tomonidan belgilangan)
                avtomatik rad etiladi. SSL sertifikatlar va xavfsiz marshrutlash invers-proksi orqali qo&apos;llanadi.
              </p>
              <Link
                href="/admin"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
              >
                Admin panelda sozlash
              </Link>
            </div>

            <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4" /> Himoya qatlamlari
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Har bir mini server no-new-privileges, capabilities drop va PID limitlari bilan ishga tushiriladi. Env kalitlari uchun yuqori
                register talab etiladi va sirli ma&apos;lumotlar loglarda filtrlanadi.
              </p>
            </div>
          </aside>
        </div>

        <section className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Loyihalarim</h3>
            <p className="text-xs text-muted-foreground">Netlify uslubidagi tezkor ko&apos;rish: holat, subdomen va resurslar.</p>
          </div>
          {containersLoading || loadingOptions ? (
            <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {containers.map((container: Container) => (
                <div
                  key={container.id}
                  className="rounded-2xl border border-border bg-[hsl(var(--muted))]/30 p-4 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{container.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {container.subdomain ? `${container.subdomain}${domainSuffix}` : 'Subdomen belgilanmagan'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        container.status === 'running'
                          ? 'bg-emerald-100 text-emerald-700'
                          : container.status === 'failed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {container.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">Runtime</p>
                      <p className="truncate">{container.image}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">CPU / RAM</p>
                      <p>
                        {container.cpu_limit} core / {container.memory_limit} MB
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">Disk</p>
                      <p>{container.disk_limit} MB</p>
                    </div>
                  </div>
                </div>
              ))}

              {!containers.length && (
                <div className="rounded-2xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/30 p-6 text-center text-sm text-muted-foreground">
                  Hozircha loyihangiz yo&apos;q. Yuqoridagi forma orqali birinchisini ishga tushiring.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
