'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <-- useMutation va useQueryClient qo'shildi
import { api } from '@/lib/api';
import { 
  LayoutDashboard, Users, FileText, MessageSquare, Settings, 
  BarChart3, Shield, Database, Bell, Image, Tag, TrendingUp, 
  AlertTriangle, CheckCircle, Clock, Activity, Server, Globe, 
  Mail, Ban, Edit, Trash2, Eye, Download, BookOpen, Zap, Code, 
  Search, ChevronLeft, ChevronRight, UserCheck, UserX // <-- Yangi icon'lar
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

// =======================================================
// INTERFEYSLAR (O'zgarishsiz)
// =======================================================
interface AdminStats {
  users: { total: number; new_today: number; active: number; new_this_week?: number; online_now?: number };
  posts: { total: number; new_today: number; published: number; draft: number; today?: number; trending?: number };
  comments: { total: number; new_today: number; pending: number; today?: number; pending_moderation?: number };
  wiki: { articles: number; new_today: number; published: number; proposals?: number };
  reports: { total: number; pending: number; resolved: number };
  system: { uptime: string; memory_usage: string; disk_usage: string; queue_jobs?: number; failed_jobs?: number };
  code_runs?: { total: number; successful: number; avg_runtime: string };
  performance?: { avg_response_time: string; cache_hit_rate: string; slow_queries: number };
  security?: { failed_logins_today: number; blocked_ips: number; suspicious_activity: number };
}
// ... Boshqa interfeyslar ...
// Foydalanuvchi uchun interfeys qo'shamiz
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

// =======================================================
// API FUNKSIYALARI
// =======================================================
async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const res = await api.get('/admin/dashboard');
    return res.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

// YANGI FUNKSIYA: Foydalanuvchilarni olish
async function getAdminUsers({ page, search }: { page: number; search: string }): Promise<PaginatedUsers> {
  const res = await api.get('/admin/users', {
    params: {
      page: page,
      search: search,
    }
  });
  return res.data;
}

// YANGI FUNKSIYA: Foydalanuvchi statusini o'zgartirish
async function updateUserStatus({ userId, data }: { userId: number; data: { is_banned?: boolean; is_admin?: boolean } }) {
  const res = await api.put(`/admin/users/${userId}/status`, data);
  return res.data;
}

async function getRecentActivity() { /* ... avvalgidek ... */ }
async function getSystemLogs() { /* ... avvalgidek ... */ }

// =======================================================
// ADMIN SAHIFASI KOMPONENTI
// =======================================================
export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard uchun state'lar
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Foydalanuvchilar (Users) bo'limi uchun state'lar
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  const queryClient = useQueryClient(); // Keshni boshqarish uchun

  // Dashboard statistikasi uchun useQuery
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin && activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab, isAdmin]);

  // YANGI: Foydalanuvchilar ro'yxati uchun useQuery
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage, searchDebounce], // Kesh kaliti
    queryFn: () => getAdminUsers({ page: userPage, search: searchDebounce }),
    enabled: !!isAdmin && activeTab === 'users', // Faqat "users" bo'limida ishlasin
    keepPreviousData: true, // Sahifa o'zgarayotganda eski ma'lumotni ko'rsatib tur
  });

  // YANGI: Qidiruv (search) uchun debounce (darhol so'rov yubormaslik)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(userSearch);
      setUserPage(1); // Qidiruv boshlanganda 1-sahifaga qaytish
    }, 500); // 500ms kutish
    return () => clearTimeout(handler);
  }, [userSearch]);

  // YANGI: Foydalanuvchini ban/admin qilish uchun useMutation
  const userStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      // Muvaffaqiyatli bo'lsa, "admin-users" keshini yangilaymiz
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('Foydalanuvchi statusi yangilandi!');
    },
    onError: (error: any) => {
      alert('Xatolik: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleUpdateUserStatus = (userId: number, data: { is_banned?: boolean; is_admin?: boolean }) => {
    if (confirm(`Haqiqatan ham bu foydalanuvchi statusini o'zgartirmoqchimisiz?`)) {
      userStatusMutation.mutate({ userId, data });
    }
  };

  // Auth tekshiruvi (avvalgidek)
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* ... "Ruxsat berilmagan" kodi ... */}
      </div>
    );
  }

  // Bo'limlar ro'yxati (avvalgidek)
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Foydalanuvchilar', icon: Users },
    { id: 'posts', name: 'Postlar', icon: FileText },
    { id: 'comments', name: 'Kommentlar', icon: MessageSquare },
    { id: 'wiki', name: 'Wiki', icon: BookOpen },
    { id: 'reports', name: 'Hisobotlar', icon: AlertTriangle },
    { id: 'activity', name: 'Faoliyat', icon: Activity },
    { id: 'logs', name: 'Loglar', icon: Database },
    { id: 'settings', name: 'Sozlamalar', icon: Settings },
    { id: 'system', name: 'Tizim', icon: Server },
  ];
  
  // Dashboard'ni ko'rsatish funksiyasi (avvalgidek)
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* ... Dashboard kodi (o'zgarishsiz) ... */}
    </div>
  );

  // =======================================================
  // YANGI: Foydalanuvchilarni ko'rsatish funksiyasi
  // =======================================================
  const renderUserManagement = () => {
    if (usersLoading) {
      return <LoadingSpinner />;
    }
    
    if (!usersData) {
      return <div className="text-red-500">Foydalanuvchilarni yuklashda xatolik.</div>
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Foydalanuvchilarni Boshqarish ({usersData.total})</h3>
          <div className="mt-2 relative">
            <input 
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Ism, username yoki email bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foydalanuvchi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holati</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistika (Post/Komm)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ro'yxatdan o'tgan</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData.data.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username} | {user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_admin && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Admin</span>}
                    {user.is_banned && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ban</span>}
                    {!user.is_admin && !user.is_banned && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktiv</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.posts_count} post / {user.comments_count} komm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {user.is_banned ? (
                      <button onClick={() => handleUpdateUserStatus(user.id, { is_banned: false })} className="text-green-600 hover:text-green-900" title="Bandan chiqarish">
                        <UserCheck className="w-5 h-5" />
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateUserStatus(user.id, { is_banned: true })} className="text-red-600 hover:text-red-900" title="Ban qilish">
                        <UserX className="w-5 h-5" />
                      </button>
                    )}
                    {user.is_admin ? (
                       <button onClick={() => handleUpdateUserStatus(user.id, { is_admin: false })} className="text-yellow-600 hover:text-yellow-900" title="Adminlikdan olish">
                        <Shield className="w-5 h-5" />
                      </button>
                    ) : (
                       <button onClick={() => handleUpdateUserStatus(user.id, { is_admin: true })} className="text-blue-600 hover:text-blue-900" title="Admin qilish">
                        <Shield className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sahifalash (Pagination) */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Oldingisi</button>
            <button onClick={() => setUserPage(p => p + 1)} disabled={userPage === usersData.last_page} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Keyingisi</button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{usersData.from}</span> dan <span className="font-medium">{usersData.to}</span> gacha. Jami: <span className="font-medium">{usersData.total}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Sahifa raqamlarini soddalashtirilgan ko'rinishi */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                  {userPage} / {usersData.last_page}
                </span>
                <button onClick={() => setUserPage(p => p + 1)} disabled={userPage === usersData.last_page} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>

      </div>
    );
  };


  // =======================================================
  // ASOSIY QAYTARISH QISMI (YANGILANDI)
  // =======================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <div className="mb-8 flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
        <div>
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
             loading ? <LoadingSpinner /> : renderDashboard()
          )}
          
          {/* Foydalanuvchilar */}
          {activeTab === 'users' && (
            renderUserManagement()
          )}

          {/* Qolgan bo'limlar */}
          {activeTab !== 'dashboard' && activeTab !== 'users' && (
            <div className="text-gray-500">Boshqa bo'limlar hali ishlab chiqilmoqda.</div>
          )}
        </div>
      </div>
    </div>
  );
}