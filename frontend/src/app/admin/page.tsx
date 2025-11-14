'use client';

import { type ReactNode, type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
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

interface BrandingSettings {
  light?: { url: string } | null;
  dark?: { url: string } | null;
}

interface SystemSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_posts_per_day: number;
  max_comments_per_day: number;
  code_execution_enabled: boolean;
  ai_suggestions_enabled: boolean;
  email_notifications_enabled: boolean;
  auto_moderation_enabled: boolean;
  site_title: string;
  site_tagline: string;
  seo_meta_description?: string | null;
  seo_meta_keywords: string[];
  branding: BrandingSettings;
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

async function getSystemSettings(): Promise<SystemSettings> {
  const res = await api.get('/admin/settings');
  return res.data;
}

async function putSystemSettings(payload: Partial<SystemSettings>) {
  const res = await api.put('/admin/settings', payload);
  return res.data;
}

async function uploadLogo({ type, file }: { type: 'light' | 'dark'; file: File }) {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('file', file);

  const res = await api.post('/admin/branding/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

async function deleteLogo(type: 'light' | 'dark') {
  const res = await api.delete('/admin/branding/logo', {
    data: { type },
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
  const [siteTitle, setSiteTitle] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [codeExecutionEnabled, setCodeExecutionEnabled] = useState(true);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [maxPostsPerDay, setMaxPostsPerDay] = useState(10);
  const [maxCommentsPerDay, setMaxCommentsPerDay] = useState(50);

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

  const {
    data: systemSettings,
    isLoading: settingsLoading,
    refetch: refetchSystemSettings,
  } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: getSystemSettings,
    enabled: isAdmin && activeTab === 'settings',
  });

  useEffect(() => {
    if (!systemSettings) return;
    setSiteTitle(systemSettings.site_title ?? '');
    setSiteTagline(systemSettings.site_tagline ?? '');
    setSeoDescription(systemSettings.seo_meta_description ?? '');
    setSeoKeywords(systemSettings.seo_meta_keywords?.join(', ') ?? '');
    setMaintenanceMode(Boolean(systemSettings.maintenance_mode));
    setRegistrationEnabled(Boolean(systemSettings.registration_enabled));
    setCodeExecutionEnabled(Boolean(systemSettings.code_execution_enabled));
    setAiSuggestionsEnabled(Boolean(systemSettings.ai_suggestions_enabled));
    setMaxPostsPerDay(systemSettings.max_posts_per_day ?? 10);
    setMaxCommentsPerDay(systemSettings.max_comments_per_day ?? 50);
  }, [systemSettings]);

  const userStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      alert('Xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  const systemSettingsMutation = useMutation({
    mutationFn: putSystemSettings,
    onSuccess: () => {
      refetchSystemSettings();
    },
    onError: (error: any) => {
      alert('Sozlamalarni yangilashda xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      refetchSystemSettings();
    },
    onError: (error: any) => {
      alert('Logo yuklashda xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  const logoDeleteMutation = useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => {
      refetchSystemSettings();
    },
    onError: (error: any) => {
      alert('Logo o\'chirishda xatolik: ' + (error.response?.data?.message || error.message));
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

  const renderSettings = () => {
    const branding = systemSettings?.branding ?? ({} as BrandingSettings);
    const saving = systemSettingsMutation.isPending;

    const handleSave = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const keywords = seoKeywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      systemSettingsMutation.mutate({
        site_title: siteTitle,
        site_tagline: siteTagline,
        seo_meta_description: seoDescription,
        seo_meta_keywords: keywords,
        maintenance_mode: maintenanceMode,
        registration_enabled: registrationEnabled,
        code_execution_enabled: codeExecutionEnabled,
        ai_suggestions_enabled: aiSuggestionsEnabled,
        max_posts_per_day: Number(maxPostsPerDay),
        max_comments_per_day: Number(maxCommentsPerDay),
      });
    };

    const handleLogoChange = (type: 'light' | 'dark') => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      logoUploadMutation.mutate({ type, file });
      event.target.value = '';
    };

    const handleRemoveLogo = (type: 'light' | 'dark') => {
      if (confirm('Logo ni o\'chirishni tasdiqlaysizmi?')) {
        logoDeleteMutation.mutate(type);
      }
    };

    if (settingsLoading && !systemSettings) {
      return (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <form onSubmit={handleSave} className="space-y-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Brending va SEO</h3>
          <p className="mt-1 text-sm text-slate-500">Sayt logotipi, nomi va qidiruvga oid meta ma\'lumotlarni boshqaring.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Sayt nomi</span>
              <input
                value={siteTitle}
                onChange={(event) => setSiteTitle(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="KnowHub Community"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Tagline</span>
              <input
                value={siteTagline}
                onChange={(event) => setSiteTagline(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Dasturchilar hamjamiyati"
              />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Meta tavsif (description)</span>
              <textarea
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                maxLength={160}
                className="mt-2 h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="KnowHub — dasturchilar uchun hamjamiyat."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Meta keywords (vergul bilan)</span>
              <input
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="knowhub, dasturlash, hamjamiyat"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {(['light', 'dark'] as Array<'light' | 'dark'>).map((type) => {
            const logo = branding[type];
            return (
              <div key={type} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{type === 'light' ? 'Light rejim logosi' : 'Dark rejim logosi'}</h4>
                    <p className="text-xs text-slate-500">PNG, SVG yoki WebP (2MB gacha)</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
                      Yuklash
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoChange(type)}
                      />
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(type)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {logo ? (
                    <img src={logo.url} alt={`${type} logo preview`} className="max-h-20" />
                  ) : (
                    <span className="text-xs text-slate-400">Logo yuklanmagan</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-semibold text-slate-900">Faollik sozlamalari</h4>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Ro'yxatdan o'tish ochiq</span>
                <input
                  type="checkbox"
                  checked={registrationEnabled}
                  onChange={(event) => setRegistrationEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Kodni bajarish imkoniyati</span>
                <input
                  type="checkbox"
                  checked={codeExecutionEnabled}
                  onChange={(event) => setCodeExecutionEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>AI tavsiyalar faol</span>
                <input
                  type="checkbox"
                  checked={aiSuggestionsEnabled}
                  onChange={(event) => setAiSuggestionsEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-semibold text-slate-900">Limitlar</h4>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span>Kunlik post limiti</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxPostsPerDay}
                  onChange={(event) => setMaxPostsPerDay(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="block">
                <span>Kunlik izoh limiti</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxCommentsPerDay}
                  onChange={(event) => setMaxCommentsPerDay(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Texnik xizmat rejimi</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(event) => setMaintenanceMode(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    );
  };

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
