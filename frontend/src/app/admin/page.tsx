'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  LayoutDashboard,
  Loader2,
  Server,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AdminSidebar } from '@/components/AdminSidebar';
import { cn } from '@/lib/utils';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface AdminStats {
  users: { total: number; new_today: number; active?: number };
  posts: { total: number; published: number; new_today: number };
  comments: { total: number; new_today: number };
}

interface UserRow {
  id: number;
  name: string;
  username: string;
  email: string;
  xp: number;
  is_admin: boolean;
  is_banned: boolean;
  posts_count: number;
  created_at: string;
}

interface PaginatedUsers {
  data: UserRow[];
  current_page: number;
  last_page: number;
  total: number;
}

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  latency_ms: number | null;
}

interface SystemSummary {
  services: SystemService[];
  metrics: {
    uptime_seconds: number | null;
    active_users: number;
    queue_backlog: number;
  };
  updated_at: string;
}

interface SystemResources {
  cpu_usage: number;
  memory_total: number;
  memory_used: number;
  disk_total: number;
  disk_used: number;
  container_count: number;
  active_users: number;
}

const STAT_CARDS = [
  { id: 'users', title: "Umumiy foydalanuvchilar", icon: Users },
  { id: 'posts', title: 'Postlar', icon: Activity },
  { id: 'comments', title: 'Izohlar', icon: BarChart3 },
];

async function fetchAdminStats(): Promise<AdminStats> {
  const res = await api.get('/admin/dashboard');
  return res.data;
}

async function fetchUsers({ page, search }: { page: number; search: string }): Promise<PaginatedUsers> {
  const res = await api.get('/admin/users', { params: { page, search } });
  return res.data;
}

async function toggleBan(userId: number) {
  const res = await api.post(`/admin/users/${userId}/ban`);
  return res.data;
}

async function promoteUser(userId: number) {
  const res = await api.put(`/admin/users/${userId}/status`, { is_admin: true });
  return res.data;
}

async function fetchSystemSummary(): Promise<SystemSummary> {
  const res = await api.get('/status/summary');
  return res.data;
}

async function fetchSystemResources(): Promise<SystemResources> {
  const res = await api.get('/admin/system/resources');
  return res.data;
}

const formatNumber = (value: number | undefined) => value?.toLocaleString('en-US') ?? '—';

const serviceTone = {
  operational: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-200',
  degraded: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200',
  outage: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-100',
};

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    enabled: isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage, userSearch],
    queryFn: () => fetchUsers({ page: userPage, search: userSearch }),
    enabled: isAdmin && activeTab === 'users',
    keepPreviousData: true,
  });

  const { data: systemSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['system-summary'],
    queryFn: fetchSystemSummary,
    enabled: isAdmin && activeTab === 'system',
  });

  const { data: systemResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['system-resources'],
    queryFn: fetchSystemResources,
    enabled: isAdmin && activeTab === 'system',
    staleTime: 15_000,
  });

  const banMutation = useMutation({
    mutationFn: (userId: number) => toggleBan(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (userId: number) => promoteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const sidebarItems = useMemo(
    () => [
      { id: 'overview', label: "Umumiy ko'rinish", icon: LayoutDashboard, description: "Statistikalar va tahlil" },
      { id: 'users', label: 'Foydalanuvchilar', icon: Users, description: 'Profil va vakolatlar' },
      { id: 'system', label: 'Tizim sogligi', icon: Server, description: 'Monitoring va status' },
    ],
    [],
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--surface))]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--surface))]">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
          <Shield className="h-10 w-10 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Ruxsat berilmagan</h1>
          <p className="text-sm text-muted-foreground">
            Bu bo'lim faqat admin huquqiga ega foydalanuvchilar uchun. Agar bu xato deb o'ylasangiz, bosh administrator bilan bog'laning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl gap-6">
        <AdminSidebar items={sidebarItems} active={activeTab} onSelect={(id) => setActiveTab(id as typeof activeTab)} />

        <div className="w-full space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Admin panel</p>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Jamiyat boshqaruvi</h1>
            </div>
            <div className="hidden gap-2 rounded-full border border-border/80 bg-[hsl(var(--card))] px-3 py-2 text-sm text-muted-foreground sm:flex">
              <Server className="h-4 w-4" />
              <span>Live status: {systemSummary ? 'Yangilangan' : 'Monitoring'}</span>
            </div>
          </header>

          <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-4 shadow-sm">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <TabsList className="w-full justify-start gap-2 overflow-auto">
                  <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
                  <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
                  <TabsTrigger value="system">Tizim sogligi</TabsTrigger>
                </TabsList>
                <div className="hidden items-center gap-3 text-sm text-muted-foreground lg:flex">
                  <Database className="h-4 w-4" />
                  <span>Yagona boshqaruv</span>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {STAT_CARDS.map((card) => {
                    const value =
                      card.id === 'users'
                        ? stats?.users.total
                        : card.id === 'posts'
                          ? stats?.posts.total
                          : stats?.comments.total;
                    const delta =
                      card.id === 'users'
                        ? stats?.users.new_today
                        : card.id === 'posts'
                          ? stats?.posts.new_today
                          : stats?.comments.new_today;

                    return (
                      <div
                        key={card.id}
                        className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--surface))] p-5 shadow-sm"
                      >
                        <card.icon className="h-5 w-5 text-primary" />
                        <p className="mt-3 text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-3xl font-bold text-[hsl(var(--foreground))]">
                          {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(value)}
                        </p>
                        <span className="text-xs text-emerald-500">+{formatNumber(delta)} bugun</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-[hsl(var(--surface))] p-5">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Faol foydalanuvchilar</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Oxirgi 7 kun ichida tizimga kirgan foydalanuvchilar.
                    </p>
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-[hsl(var(--foreground))]">{formatNumber(stats?.users.active)}</span>
                      <span className="text-xs text-muted-foreground">aktive holatda</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-[hsl(var(--surface))] p-5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="text-lg font-semibold">Bugungi kuzatuv</h3>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Yangi foydalanuvchilar: {formatNumber(stats?.users.new_today)}</li>
                      <li>Yangi postlar: {formatNumber(stats?.posts.new_today)}</li>
                      <li>Yangi izohlar: {formatNumber(stats?.comments.new_today)}</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Foydalanuvchilar ro'yxati</h3>
                    <p className="text-sm text-muted-foreground">Aktivlik, XP va rollarni boshqarish</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="search"
                      className="w-full rounded-lg border border-border/70 bg-[hsl(var(--surface))] px-3 py-2 text-sm focus:border-primary focus:outline-none md:w-64"
                      placeholder="Ism yoki email"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/70">
                  <div className="overflow-x-auto bg-[hsl(var(--card))]">
                    <table className="min-w-full divide-y divide-border/70">
                      <thead className="bg-[hsl(var(--surface))]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Foydalanuvchi</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">XP</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Postlar</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/70">
                        {usersLoading && <TableSkeleton rows={5} />}

                        {!usersLoading && users?.data?.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                              Foydalanuvchilar topilmadi.
                            </td>
                          </tr>
                        )}

                        {users?.data?.map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <p className="font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username} · {user.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-primary">{formatNumber(user.xp)}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{formatNumber(user.posts_count)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-semibold',
                                  user.is_banned
                                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-100'
                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-100',
                                )}
                              >
                                {user.is_banned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  isLoading={banMutation.isPending && banMutation.variables === user.id}
                                  onClick={() => banMutation.mutate(user.id)}
                                >
                                  {user.is_banned ? 'Unban' : 'Ban'}
                                </Button>
                                <Button
                                  variant={user.is_admin ? 'secondary' : 'outline'}
                                  size="sm"
                                  disabled={user.is_admin}
                                  isLoading={promoteMutation.isPending && promoteMutation.variables === user.id}
                                  onClick={() => promoteMutation.mutate(user.id)}
                                >
                                  {user.is_admin ? 'Admin' : 'Promote'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {users && users.last_page > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-[hsl(var(--surface))] px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                      {users.current_page} / {users.last_page} · {formatNumber(users.total)} foydalanuvchi
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={userPage === 1}
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      >
                        Oldingi
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={userPage === users.last_page}
                        onClick={() => setUserPage((p) => Math.min(users.last_page, p + 1))}
                      >
                        Keyingi
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-[hsl(var(--surface))] p-5 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Xizmatlar holati</h3>
                    </div>
                    {summaryLoading ? (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {systemSummary?.services.map((service) => (
                          <div
                            key={service.name}
                            className={cn(
                              'rounded-xl border border-border/70 p-4',
                              serviceTone[service.status],
                            )}
                          >
                            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                            <p className="mt-2 text-xs">Status: {service.status}</p>
                            {service.latency_ms !== null && <p className="text-xs">Latency: {service.latency_ms} ms</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-[hsl(var(--surface))] p-5">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">Tezkor metrikalar</h3>
                    </div>
                    {resourcesLoading ? (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>CPU ishlatilishi: {systemResources ? `${systemResources.cpu_usage}%` : '—'}</li>
                        <li>
                          Xotira: {systemResources ? `${formatNumber(systemResources.memory_used)}MB / ${formatNumber(systemResources.memory_total)}MB` : '—'}
                        </li>
                        <li>
                          Disk: {systemResources ? `${formatNumber(systemResources.disk_used)}GB / ${formatNumber(systemResources.disk_total)}GB` : '—'}
                        </li>
                        <li>Aktiv konteynerlar: {formatNumber(systemResources?.container_count)}</li>
                        <li>Onlayn foydalanuvchilar: {formatNumber(systemResources?.active_users)}</li>
                      </ul>
                    )}
                  </div>
                </div>

                {systemSummary && (
                  <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-4 text-sm text-muted-foreground">
                    Yangilanish vaqti: {new Date(systemSummary.updated_at).toLocaleString()} · Navbatchi vazifalar: {formatNumber(systemSummary.metrics.queue_backlog)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
