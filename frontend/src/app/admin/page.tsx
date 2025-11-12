'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminStats {
  users: {
    total: number;
    new_today: number;
    active: number;
    new_this_week?: number;
    online_now?: number;
  };
  posts: {
    total: number;
    new_today: number;
    published: number;
    draft: number;
    today?: number;
    trending?: number;
  };
  comments: {
    total: number;
    new_today: number;
    pending: number;
    today?: number;
    pending_moderation?: number;
  };
  wiki: {
    articles: number;
    new_today: number;
    published: number;
    proposals?: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
  };
  system: {
    uptime: string;
    memory_usage: string;
    disk_usage: string;
    queue_jobs?: number;
    failed_jobs?: number;
  };
  code_runs?: {
    total: number;
    successful: number;
    avg_runtime: string;
  };
  performance?: {
    avg_response_time: string;
    cache_hit_rate: string;
    slow_queries: number;
  };
  security?: {
    failed_logins_today: number;
    blocked_ips: number;
    suspicious_activity: number;
  };
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  xp: number;
  is_admin: boolean;
  is_banned: boolean;
  posts_count: number;
  comments_count: number;
  created_at: string;
  level: { name: string } | null;
}

interface PaginatedUsers {
  data: User[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get('/admin/dashboard');
  return res.data;
}

async function getAdminUsers({ page, search }: { page: number; search: string }): Promise<PaginatedUsers> {
  const res = await api.get('/admin/users', {
    params: {
      page,
      search,
    },
  });
  return res.data;
}

async function updateUserStatus({
  userId,
  data,
}: {
  userId: number;
  data: { is_banned?: boolean; is_admin?: boolean };
}) {
  const res = await api.put(`/admin/users/${userId}/status`, data);
  return res.data;
}

const formatNumber = (value?: number | string | null) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString('en-US');
  return value;
};

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'system' | 'settings'>('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  const loadStats = useCallback(async () => {
    if (!isAdmin) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
      setLastFetchedAt(new Date());
    } catch (error: any) {
      setStats(null);
      setStatsError(error?.response?.data?.message ?? error?.message ?? "Ma'lumotlarni yuklab bo'lmadi.");
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin, loadStats]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setSearchDebounce(userSearch);
      setUserPage(1);
    }, 500);
    return () => window.clearTimeout(handler);
  }, [userSearch]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage, searchDebounce],
    queryFn: () => getAdminUsers({ page: userPage, search: searchDebounce }),
    enabled: isAdmin && activeTab === 'users',
    keepPreviousData: true,
  });

  const userStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      alert('Xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleUpdateUserStatus = (userId: number, data: { is_banned?: boolean; is_admin?: boolean }) => {
    if (confirm("Bu foydalanuvchi statusini o'zgartirishni tasdiqlaysizmi?")) {
      userStatusMutation.mutate({ userId, data });
    }
  };

  const tabs = useMemo(
    () => [
      { id: 'dashboard', name: "Umumiy ko'rinish", description: 'Jamiyat statistikasi', icon: LayoutDashboard },
      { id: 'users', name: 'Foydalanuvchilar', description: "A'zolarni boshqarish", icon: Users },
      { id: 'moderation', name: 'Moderatsiya', description: 'Hisobotlar va xavfsizlik', icon: ShieldCheck },
      { id: 'system', name: 'Tizim holati', description: 'Infratuzilma monitoringi', icon: Server },
      { id: 'settings', name: 'Sozlamalar', description: 'Platforma siyosatlari', icon: Settings },
    ],
    []
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f4]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f6f6f4]">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
          <Shield className="h-10 w-10 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900">Ruxsat berilmagan</h1>
          <p className="text-sm text-slate-500">
            Bu bo'lim faqat admin huquqiga ega foydalanuvchilar uchun. Agar bu xato deb o'ylasangiz, bosh administrator bilan bog'laning.
          </p>
          <LinkButton href="/">Bosh sahifaga qaytish</LinkButton>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (statsLoading) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (statsError) {
      return (
        <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-600 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-semibold">{statsError}</p>
          </div>
          <button
            onClick={loadStats}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Qayta urinib ko'rish
          </button>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Hozircha statistik ma'lumot topilmadi.
        </div>
      );
    }

    const insightCards = [
      {
        title: "Faol a'zolar",
        value: formatNumber(stats.users.active),
        caption: `${formatNumber(stats.users.new_today)} ta yangi foydalanuvchi bugun qo'shildi`,
      },
      {
        title: 'Bugungi postlar',
        value: formatNumber(stats.posts.new_today || stats.posts.today),
        caption: `${formatNumber(stats.posts.total)} ta post jami`,
      },
      {
        title: 'Moderatsiya navbati',
        value: formatNumber(stats.comments.pending || stats.reports.pending),
        caption: `${formatNumber(stats.reports.total)} ta umumiy hisobot`,
      },
      {
        title: 'Wiki takliflari',
        value: formatNumber(stats.wiki.proposals),
        caption: `${formatNumber(stats.wiki.articles)} ta maqola mavjud`,
      },
    ];

    return (
      <div className="space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Jamiyat ko'rinishi</h2>
            <p className="text-sm text-slate-500">
              Eng muhim metrikalar. {lastFetchedAt ? `Yangilandi: ${lastFetchedAt.toLocaleTimeString()}` : ''}
            </p>
          </div>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insightCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
              <p className="mt-2 text-xs text-slate-400">{card.caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Faoliyat dinamikasi</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricLine label="Jami postlar" value={formatNumber(stats.posts.total)} trend={`+${formatNumber(stats.posts.trending ?? stats.posts.published)} trend`} />
              <MetricLine label="Jami kommentlar" value={formatNumber(stats.comments.total)} trend={`${formatNumber(stats.comments.pending)} kutmoqda`} />
              <MetricLine label="Kod bajarishlar" value={formatNumber(stats.code_runs?.total)} trend={`${formatNumber(stats.code_runs?.successful)} muvaffaqiyatli`} />
              <MetricLine label="Wiki maqolalar" value={formatNumber(stats.wiki.articles)} trend={`${formatNumber(stats.wiki.new_today)} yangi bugun`} />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Xavfsizlik ko'rsatkichi</h3>
            <MetricLine label="Muvaffaqiyatsiz login" value={formatNumber(stats.security?.failed_logins_today)} trend={`${formatNumber(stats.security?.blocked_ips)} bloklangan IP`} />
            <MetricLine label="Shubhali faollik" value={formatNumber(stats.security?.suspicious_activity)} trend="Monitoring ostida" />
            <MetricLine label="Hisobotlar" value={formatNumber(stats.reports.pending)} trend={`${formatNumber(stats.reports.resolved)} hal qilindi`} />
          </div>
        </section>
      </div>
    );
  };

  const renderUserManagement = () => {
    if (usersLoading) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (!usersData) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-600 shadow-sm">
          Foydalanuvchilarni yuklashda xatolik yuz berdi.
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Foydalanuvchilarni boshqarish</h3>
            <p className="text-sm text-slate-500">Jami: {formatNumber(usersData.total)}</p>
          </div>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Ism, username yoki email..."
              className="w-full rounded-full border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-slate-500">Foydalanuvchi</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-slate-500">Holati</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-slate-500">Faollik</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-slate-500">Ro'yxatdan o'tgan</th>
                <th className="px-6 py-3 text-right font-medium uppercase tracking-wider text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {usersData.data.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username} · {user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {user.is_admin && <StatusBadge tone="blue">Admin</StatusBadge>}
                      {user.is_banned && <StatusBadge tone="red">Ban</StatusBadge>}
                      {!user.is_admin && !user.is_banned && <StatusBadge tone="green">Aktiv</StatusBadge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.posts_count} post · {user.comments_count} izoh
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {user.is_banned ? (
                        <IconButton
                          title="Bandan chiqarish"
                          tone="green"
                          onClick={() => handleUpdateUserStatus(user.id, { is_banned: false })}
                        >
                          <UserCheck className="h-4 w-4" />
                        </IconButton>
                      ) : (
                        <IconButton
                          title="Ban qilish"
                          tone="red"
                          onClick={() => handleUpdateUserStatus(user.id, { is_banned: true })}
                        >
                          <UserX className="h-4 w-4" />
                        </IconButton>
                      )}
                      <IconButton
                        title={user.is_admin ? 'Adminlikdan olish' : 'Admin qilish'}
                        tone="blue"
                        onClick={() => handleUpdateUserStatus(user.id, { is_admin: !user.is_admin })}
                      >
                        <Shield className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {formatNumber(usersData.from)} — {formatNumber(usersData.to)} / {formatNumber(usersData.total)} foydalanuvchi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              disabled={userPage === 1}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-400 disabled:opacity-50"
            >
              Oldingisi
            </button>
            <span className="text-sm text-slate-500">
              {userPage} / {usersData.last_page}
            </span>
            <button
              onClick={() => setUserPage((p) => Math.min(usersData.last_page, p + 1))}
              disabled={userPage === usersData.last_page}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-400 disabled:opacity-50"
            >
              Keyingisi
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModeration = () => {
    if (statsLoading) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Hozircha moderatsiya ma'lumotlari mavjud emas.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Hisobotlar oqimi</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <SummaryCard title="Umumiy hisobotlar" value={formatNumber(stats.reports.total)} icon={Activity} tone="slate" />
            <SummaryCard title="Kutilayotgan" value={formatNumber(stats.reports.pending)} icon={AlertTriangle} tone="amber" />
            <SummaryCard title="Yopilgan" value={formatNumber(stats.reports.resolved)} icon={UserCheck} tone="green" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Kommentlar moderatsiyasi</h4>
            <MetricLine label="Kutayotgan kommentlar" value={formatNumber(stats.comments.pending)} trend={`${formatNumber(stats.comments.new_today)} yangi bugun`} />
            <MetricLine label="Umumiy kommentlar" value={formatNumber(stats.comments.total)} trend={`${formatNumber(stats.comments.pending_moderation)} nazoratda`} />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Xavfsizlik
            </h4>
            <MetricLine label="Bloklangan IP" value={formatNumber(stats.security?.blocked_ips)} trend={`${formatNumber(stats.security?.failed_logins_today)} muvaffaqiyatsiz login`} />
            <MetricLine label="Shubhali faollik" value={formatNumber(stats.security?.suspicious_activity)} trend="Doimiy monitoring" />
          </div>
        </div>
      </div>
    );
  };

  const renderSystem = () => {
    if (statsLoading) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Tizim ma'lumotlari mavjud emas.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Server ko'rsatkichlari</h3>
            <MetricLine label="Uptime" value={stats.system.uptime} trend={`${formatNumber(stats.system.queue_jobs)} queue`} />
            <MetricLine label="Xotira ishlatilishi" value={stats.system.memory_usage} trend={`${formatNumber(stats.system.failed_jobs)} nosoz queue`} />
            <MetricLine label="Disk ishlatilishi" value={stats.system.disk_usage} trend="Monitoring ostida" />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Performance</h3>
            <MetricLine label="O`rtacha javob vaqti" value={stats.performance?.avg_response_time ?? '—'} trend={`${stats.performance?.cache_hit_rate ?? '—'} cache hit`} />
            <MetricLine label="Sekin so'rovlar" value={formatNumber(stats.performance?.slow_queries)} trend="Optimallashtirish rejasini ko'rib chiqing" />
            <MetricLine label="Kod bajarish o'rtacha" value={stats.code_runs?.avg_runtime ?? '—'} trend={`${formatNumber(stats.code_runs?.successful)} muvaffaqiyatli`} />
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Platforma siyosatlari</h3>
      <p className="text-sm text-slate-500">
        Admin siyosatlari, rol va ruxsatlarni boshqarish uchun kelgusida alohida modul qo'shiladi. Hozircha asosiy siyosatlar backend konfiguratsiyasidan boshqariladi.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[240px,1fr]">
          <aside className="lg:sticky lg:top-10">
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Admin panel</h1>
                <p className="mt-1 text-sm text-slate-500">Jamiyatni boshqarish uchun minimalistik markaz.</p>
              </div>
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                      activeTab === tab.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </div>
                    <p className={`mt-1 text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>
                      {tab.description}
                    </p>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="space-y-10">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'moderation' && renderModeration()}
            {activeTab === 'system' && renderSystem()}
            {activeTab === 'settings' && renderSettings()}
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricLine({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
      {trend && <span className="text-xs text-slate-500">{trend}</span>}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: typeof Activity;
  tone: 'slate' | 'amber' | 'green';
}) {
  const toneClasses = {
    slate: 'text-slate-600 bg-slate-50',
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-emerald-600 bg-emerald-50',
  } as const;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm`}>
      <div className={`rounded-full ${toneClasses[tone]} p-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-base font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: 'blue' | 'red' | 'green'; children: ReactNode }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  } as const;

  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>{children}</span>;
}

function IconButton({
  onClick,
  tone,
  title,
  children,
}: {
  onClick: () => void;
  tone: 'blue' | 'red' | 'green';
  title: string;
  children: ReactNode;
}) {
  const toneClasses = {
    blue: 'text-blue-600 hover:text-blue-800',
    red: 'text-rose-600 hover:text-rose-800',
    green: 'text-emerald-600 hover:text-emerald-800',
  } as const;

  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-full border border-slate-200 p-2 transition ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
    >
      {children}
    </a>
  );
}
