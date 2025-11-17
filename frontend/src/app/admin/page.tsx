'use client';

import { type ReactNode, type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';
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
    active?: number;
    active_today?: number;
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

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
  solvera?: {
    enabled: boolean;
    api_base: string;
    model: string;
    temperature: number;
    max_tokens: number;
    persona?: string | null;
    has_api_key?: boolean;
  };
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

async function clearPlatformCache() {
  const res = await api.post('/admin/cache/clear');
  return res.data;
}

async function optimizePlatform() {
  const res = await api.post('/admin/system/optimize');
  return res.data;
}

async function backupDatabaseNow() {
  const res = await api.post('/admin/database/backup');
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
  const [solveraEnabled, setSolveraEnabled] = useState(true);
  const [solveraApiBase, setSolveraApiBase] = useState('');
  const [solveraModel, setSolveraModel] = useState('gtp-5');
  const [solveraTemperature, setSolveraTemperature] = useState(0.25);
  const [solveraMaxTokens, setSolveraMaxTokens] = useState(800);
  const [solveraPersona, setSolveraPersona] = useState('');
  const [solveraApiKeyInput, setSolveraApiKeyInput] = useState('');
  const [hasSolveraKey, setHasSolveraKey] = useState(false);
  const [toolMessage, setToolMessage] = useState<string | null>(null);
  const [toolError, setToolError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!isAdmin) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
      setLastFetchedAt(new Date());
    } catch (error: unknown) {
      setStats(null);
      setStatsError(getErrorMessage(error, "Ma'lumotlarni yuklab bo'lmadi."));
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
    setSolveraEnabled(Boolean(systemSettings.solvera?.enabled ?? true));
    setSolveraApiBase(systemSettings.solvera?.api_base ?? '');
    setSolveraModel(systemSettings.solvera?.model ?? 'gtp-5');
    setSolveraTemperature(systemSettings.solvera?.temperature ?? 0.25);
    setSolveraMaxTokens(systemSettings.solvera?.max_tokens ?? 800);
    setSolveraPersona(systemSettings.solvera?.persona ?? '');
    setHasSolveraKey(Boolean(systemSettings.solvera?.has_api_key));
  }, [systemSettings]);

  const userStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: unknown) => {
      alert(`Xatolik: ${getErrorMessage(error, "Noma'lum xatolik")}`);
    },
  });

  const systemSettingsMutation = useMutation({
    mutationFn: putSystemSettings,
    onSuccess: () => {
      refetchSystemSettings();
      setSolveraApiKeyInput('');
    },
    onError: (error: unknown) => {
      alert(`Sozlamalarni yangilashda xatolik: ${getErrorMessage(error, "Noma'lum xatolik")}`);
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      refetchSystemSettings();
    },
    onError: (error: unknown) => {
      alert(`Logo yuklashda xatolik: ${getErrorMessage(error, "Noma'lum xatolik")}`);
    },
  });

  const logoDeleteMutation = useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => {
      refetchSystemSettings();
    },
    onError: (error: unknown) => {
      alert(`Logo o'chirishda xatolik: ${getErrorMessage(error, "Noma'lum xatolik")}`);
    },
  });

  const cacheClearMutation = useMutation({
    mutationFn: clearPlatformCache,
    onSuccess: (data) => {
      setToolMessage(data?.message ?? 'Cache muvaffaqiyatli tozalandi');
      setToolError(null);
    },
    onError: (error: unknown) => {
      setToolError(getErrorMessage(error, 'Cache tozalashda xatolik')); 
      setToolMessage(null);
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: optimizePlatform,
    onSuccess: (data) => {
      setToolMessage(data?.message ?? 'Optimallashtirish yakunlandi');
      setToolError(null);
    },
    onError: (error: unknown) => {
      setToolError(getErrorMessage(error, 'Optimallashtirishda xatolik'));
      setToolMessage(null);
    },
  });

  const backupMutation = useMutation({
    mutationFn: backupDatabaseNow,
    onSuccess: (data) => {
      setToolMessage(data?.message ?? 'Zaxira nusxa yaratildi');
      setToolError(null);
    },
    onError: (error: unknown) => {
      setToolError(getErrorMessage(error, 'Zaxira nusxa olishda xatolik'));
      setToolMessage(null);
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
          <LinkButton href="/">Bosh sahifaga qaytish</LinkButton>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (statsLoading) {
      return (
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (statsError) {
      return (
        <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
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
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-8 text-center text-sm text-muted-foreground shadow-sm">
          Hozircha statistik ma'lumot topilmadi.
        </div>
      );
    }

    const insightCards = [
      {
        title: "Faol a'zolar",
        value: formatNumber(stats.users.active ?? stats.users.active_today),
        caption: `${formatNumber(stats.users.new_today ?? stats.users.today ?? stats.users.active_today)} ta yangi foydalanuvchi bugun qo'shildi`,
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
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Jamiyat ko'rinishi</h2>
            <p className="text-sm text-muted-foreground">
              Eng muhim metrikalar. {lastFetchedAt ? `Yangilandi: ${lastFetchedAt.toLocaleTimeString()}` : ''}
            </p>
          </div>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-border hover:text-[hsl(var(--foreground))] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insightCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-4 text-3xl font-semibold text-[hsl(var(--foreground))]">{card.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{card.caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4 rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Faoliyat dinamikasi</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricLine label="Jami postlar" value={formatNumber(stats.posts.total)} trend={`+${formatNumber(stats.posts.trending ?? stats.posts.published)} trend`} />
              <MetricLine label="Jami kommentlar" value={formatNumber(stats.comments.total)} trend={`${formatNumber(stats.comments.pending)} kutmoqda`} />
              <MetricLine label="Kod bajarishlar" value={formatNumber(stats.code_runs?.total)} trend={`${formatNumber(stats.code_runs?.successful)} muvaffaqiyatli`} />
              <MetricLine label="Wiki maqolalar" value={formatNumber(stats.wiki.articles)} trend={`${formatNumber(stats.wiki.new_today)} yangi bugun`} />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Xavfsizlik ko'rsatkichi</h3>
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
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-10 text-center shadow-sm">
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
      <div className="rounded-3xl border border-border bg-[hsl(var(--card))] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Foydalanuvchilarni boshqarish</h3>
            <p className="text-sm text-muted-foreground">Jami: {formatNumber(usersData.total)}</p>
          </div>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Ism, username yoki email..."
              className="w-full rounded-full border border-border/70 bg-[hsl(var(--card))] py-2 pl-10 pr-4 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-0"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-muted-foreground">Foydalanuvchi</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-muted-foreground">Holati</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-muted-foreground">Faollik</th>
                <th className="px-6 py-3 text-left font-medium uppercase tracking-wider text-muted-foreground">Ro'yxatdan o'tgan</th>
                <th className="px-6 py-3 text-right font-medium uppercase tracking-wider text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70 bg-[hsl(var(--card))]">
              {usersData.data.map((user) => (
                <tr key={user.id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-[hsl(var(--foreground))]">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username} · {user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {user.is_admin && <StatusBadge tone="blue">Admin</StatusBadge>}
                      {user.is_banned && <StatusBadge tone="red">Ban</StatusBadge>}
                      {!user.is_admin && !user.is_banned && <StatusBadge tone="green">Aktiv</StatusBadge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.posts_count} post · {user.comments_count} izoh
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
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

        <div className="flex flex-col gap-4 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {formatNumber(usersData.from)} — {formatNumber(usersData.to)} / {formatNumber(usersData.total)} foydalanuvchi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              disabled={userPage === 1}
              className="rounded-full border border-border/70 bg-[hsl(var(--card))] px-3 py-2 text-sm text-muted-foreground hover:border-border disabled:opacity-50"
            >
              Oldingisi
            </button>
            <span className="text-sm text-muted-foreground">
              {userPage} / {usersData.last_page}
            </span>
            <button
              onClick={() => setUserPage((p) => Math.min(usersData.last_page, p + 1))}
              disabled={userPage === usersData.last_page}
              className="rounded-full border border-border/70 bg-[hsl(var(--card))] px-3 py-2 text-sm text-muted-foreground hover:border-border disabled:opacity-50"
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
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-8 text-sm text-muted-foreground shadow-sm">
          Hozircha moderatsiya ma'lumotlari mavjud emas.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Hisobotlar oqimi</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <SummaryCard title="Umumiy hisobotlar" value={formatNumber(stats.reports.total)} icon={Activity} tone="slate" />
            <SummaryCard title="Kutilayotgan" value={formatNumber(stats.reports.pending)} icon={AlertTriangle} tone="amber" />
            <SummaryCard title="Yopilgan" value={formatNumber(stats.reports.resolved)} icon={UserCheck} tone="green" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h4 className="text-base font-semibold text-[hsl(var(--foreground))]">Kommentlar moderatsiyasi</h4>
            <MetricLine label="Kutayotgan kommentlar" value={formatNumber(stats.comments.pending)} trend={`${formatNumber(stats.comments.new_today)} yangi bugun`} />
            <MetricLine label="Umumiy kommentlar" value={formatNumber(stats.comments.total)} trend={`${formatNumber(stats.comments.pending_moderation)} nazoratda`} />
          </div>
          <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h4 className="text-base font-semibold text-[hsl(var(--foreground))]">Xavfsizlik
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
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-10 text-center shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-8 text-sm text-muted-foreground shadow-sm">
          Tizim ma'lumotlari mavjud emas.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Server ko'rsatkichlari</h3>
            <MetricLine label="Uptime" value={stats.system.uptime} trend={`${formatNumber(stats.system.queue_jobs)} queue`} />
            <MetricLine label="Xotira ishlatilishi" value={stats.system.memory_usage} trend={`${formatNumber(stats.system.failed_jobs)} nosoz queue`} />
            <MetricLine label="Disk ishlatilishi" value={stats.system.disk_usage} trend="Monitoring ostida" />
          </div>
          <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Performance</h3>
            <MetricLine label="O`rtacha javob vaqti" value={stats.performance?.avg_response_time ?? '—'} trend={`${stats.performance?.cache_hit_rate ?? '—'} cache hit`} />
            <MetricLine label="Sekin so'rovlar" value={formatNumber(stats.performance?.slow_queries)} trend="Optimallashtirish rejasini ko'rib chiqing" />
            <MetricLine label="Kod bajarish o'rtacha" value={stats.code_runs?.avg_runtime ?? '—'} trend={`${formatNumber(stats.code_runs?.successful)} muvaffaqiyatli`} />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">Tezkor tizim vositalari</h3>
              <p className="text-sm text-muted-foreground">Cache, optimizatsiya va zaxira nusxasini bir bosishda ishga tushiring.</p>
            </div>
            {(toolMessage || toolError) && (
              <p className={`text-sm ${toolError ? 'text-red-600' : 'text-green-600'}`}>
                {toolError ?? toolMessage}
              </p>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => cacheClearMutation.mutate()}
              disabled={cacheClearMutation.isPending}
              className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] disabled:opacity-60"
            >
              {cacheClearMutation.isPending ? 'Cache tozalanmoqda...' : 'Cache-ni tozalash'}
            </button>
            <button
              onClick={() => optimizeMutation.mutate()}
              disabled={optimizeMutation.isPending}
              className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] disabled:opacity-60"
            >
              {optimizeMutation.isPending ? 'Optimallashtirilmoqda...' : 'Optimallashtirish'}
            </button>
            <button
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))] disabled:opacity-60"
            >
              {backupMutation.isPending ? 'Zaxira olinmoqda...' : 'Zaxira nusxa'}
            </button>
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
        solvera_enabled: solveraEnabled,
        solvera_api_base: solveraApiBase || 'https://api.solvera.ai',
        solvera_model: solveraModel,
        solvera_temperature: Number(solveraTemperature),
        solvera_max_tokens: Number(solveraMaxTokens),
        solvera_persona: solveraPersona,
        ...(solveraApiKeyInput ? { solvera_api_key: solveraApiKeyInput } : {}),
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
        <div className="flex items-center justify-center rounded-3xl border border-border bg-[hsl(var(--card))] p-12 shadow-sm">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <form onSubmit={handleSave} className="space-y-10 rounded-3xl border border-border bg-[hsl(var(--card))] p-8 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Brending va SEO</h3>
          <p className="mt-1 text-sm text-muted-foreground">Sayt logotipi, nomi va qidiruvga oid meta ma\'lumotlarni boshqaring.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Sayt nomi</span>
              <input
                value={siteTitle}
                onChange={(event) => setSiteTitle(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="KnowHub Community"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Tagline</span>
              <input
                value={siteTagline}
                onChange={(event) => setSiteTagline(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Dasturchilar hamjamiyati"
              />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Meta tavsif (description)</span>
              <textarea
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                maxLength={160}
                className="mt-2 h-28 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="KnowHub — dasturchilar uchun hamjamiyat."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Meta keywords (vergul bilan)</span>
              <input
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="knowhub, dasturlash, hamjamiyat"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {(['light', 'dark'] as Array<'light' | 'dark'>).map((type) => {
            const logo = branding[type];
            return (
              <div key={type} className="rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">{type === 'light' ? 'Light rejim logosi' : 'Dark rejim logosi'}</h4>
                    <p className="text-xs text-muted-foreground">PNG, SVG yoki WebP (2MB gacha)</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-indigo-300 hover:text-indigo-600">
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
                <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted">
                  {logo ? (
                    <img src={logo.url} alt={`${type} logo preview`} className="max-h-20" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Logo yuklanmagan</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Faollik sozlamalari</h4>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Ro'yxatdan o'tish ochiq</span>
                <input
                  type="checkbox"
                  checked={registrationEnabled}
                  onChange={(event) => setRegistrationEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border/70 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Kodni bajarish imkoniyati</span>
                <input
                  type="checkbox"
                  checked={codeExecutionEnabled}
                  onChange={(event) => setCodeExecutionEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border/70 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>AI tavsiyalar faol</span>
                <input
                  type="checkbox"
                  checked={aiSuggestionsEnabled}
                  onChange={(event) => setAiSuggestionsEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border/70 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Limitlar</h4>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span>Kunlik post limiti</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxPostsPerDay}
                  onChange={(event) => setMaxPostsPerDay(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Texnik xizmat rejimi</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(event) => setMaintenanceMode(event.target.checked)}
                  className="h-4 w-4 rounded border-border/70 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">SolVera AI sozlamalari</h4>
              <p className="text-xs text-muted-foreground">gtp-5 modelini boshqarish, persona va API sozlamalarini yangilang.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
              <input
                type="checkbox"
                checked={solveraEnabled}
                onChange={(event) => setSolveraEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-border/70 text-indigo-600 focus:ring-indigo-500"
              />
              Faol
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              API bazaviy URL
              <input
                value={solveraApiBase}
                onChange={(event) => setSolveraApiBase(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="https://api.solvera.ai"
              />
            </label>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Model nomi
              <input
                value={solveraModel}
                onChange={(event) => setSolveraModel(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="gtp-5"
              />
            </label>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Temperatura (0 - 1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={solveraTemperature}
                onChange={(event) => setSolveraTemperature(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Maksimal tokenlar
              <input
                type="number"
                min={16}
                max={32768}
                value={solveraMaxTokens}
                onChange={(event) => setSolveraMaxTokens(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Persona (yo'riqnoma)
              <textarea
                value={solveraPersona}
                onChange={(event) => setSolveraPersona(event.target.value)}
                className="mt-2 h-32 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="SolVera qanday ohangda javob berishi kerak?"
              />
            </label>
            <div className="space-y-2 rounded-xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-4 text-sm">
              <p className="font-semibold text-[hsl(var(--foreground))]">API kaliti</p>
              <input
                type="password"
                value={solveraApiKeyInput}
                onChange={(event) => setSolveraApiKeyInput(event.target.value)}
                placeholder={hasSolveraKey ? 'Saqlangan (yangilash uchun kiriting)' : 'Kalitni kiriting'}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <p className="text-xs text-muted-foreground">
                Kalitni faqat yangilash yoki almashtirish kerak bo'lsa kiriting. Saqlangan holat: {hasSolveraKey ? 'mavjud' : 'kiritilmagan'}.
              </p>
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
    <div className="min-h-screen bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[240px,1fr]">
          <aside className="lg:sticky lg:top-10">
            <div className="space-y-6 rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
              <div>
                <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Admin panel</h1>
                <p className="mt-1 text-sm text-muted-foreground">Jamiyatni boshqarish uchun minimalistik markaz.</p>
              </div>
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                      activeTab === tab.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white shadow-lg'
                        : 'border-border bg-[hsl(var(--card))] text-muted-foreground hover:border-border/70 hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </div>
                    <p className={`mt-1 text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-muted-foreground'}`}>
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
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-muted/60 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-[hsl(var(--foreground))]">{value}</span>
      {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
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
    slate: 'text-muted-foreground bg-muted',
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-emerald-600 bg-emerald-50',
  } as const;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-border bg-[hsl(var(--card))] px-4 py-4 shadow-sm`}>
      <div className={`rounded-full ${toneClasses[tone]} p-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-base font-semibold text-[hsl(var(--foreground))]">{value}</p>
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
      className={`rounded-full border border-border p-2 transition ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-border hover:text-[hsl(var(--foreground))]"
    >
      {children}
    </a>
  );
}
