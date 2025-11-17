'use client';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { User } from '@/types';
import { Search, Filter, Users, Award, FileText, UserPlus } from 'lucide-react';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';

type LevelOption = { id: number; name: string; slug: string; icon?: string | null };

type Filters = {
  search: string;
  level: number | '';
  sort: string;
  page: number;
};

async function getUsers(params: Filters) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.level) searchParams.append('level', String(params.level));
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.page) searchParams.append('page', params.page.toString());

  const res = await api.get(`/users?${searchParams.toString()}`);
  return res.data;
}

async function getLevels() {
  const res = await api.get('/levels');
  return res.data?.data ?? [];
}

export default function UsersPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    level: '',
    sort: 'xp',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });

  const { data: levels } = useQuery<LevelOption[]>({
    queryKey: ['levels'],
    queryFn: getLevels,
  });

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value as never, page: 1 }));
  };

  const levelOptions = useMemo(() => levels ?? [], [levels]);

  if (usersLoading) return <LoadingSpinner />;

  if (usersError) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Foydalanuvchilarni yuklashda xatolik</h1>
        <p className="text-gray-600">Iltimos, sahifani yangilab qayta urinib ko'ring.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <Users className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Foydalanuvchilar</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrlar
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Foydalanuvchilarni qidirish..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daraja
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Barcha darajalar</option>
                  {levelOptions.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saralash
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="xp">XP bo'yicha</option>
                  <option value="posts">Postlar soni</option>
                  <option value="followers">Kuzatuvchilar soni</option>
                  <option value="recent">Yangi ro'yxatdan o'tganlar</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => setFilters({ search: '', level: '', sort: 'xp', page: 1 })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Filtrlarni tozalash
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users?.data?.map((user: User) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {user.name}
                  </Link>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              
              <FollowButton userId={user.id} />
            </div>

            {/* User Level */}
            {user.level && (
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">{user.level.name}</span>
                <span className="text-sm text-gray-500">({user.xp} XP)</span>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="w-4 h-4 text-gray-400 mr-1" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.stats?.posts_count || 0}</p>
                <p className="text-xs text-gray-500">Postlar</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <UserPlus className="w-4 h-4 text-gray-400 mr-1" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.stats?.followers_count || 0}</p>
                <p className="text-xs text-gray-500">Kuzatuvchi</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-gray-400 mr-1" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.stats?.following_count || 0}</p>
                <p className="text-xs text-gray-500">Kuzatadi</p>
              </div>
            </div>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {user.badges.slice(0, 3).map((badge: any) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                    >
                      {badge.icon} {badge.name}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <span className="text-xs text-gray-500">+{user.badges.length - 3} ko'proq</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users?.data?.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Foydalanuvchilar topilmadi</h3>
          <p className="text-gray-600">Qidiruv shartlaringizni o'zgartirib ko'ring</p>
        </div>
      )}

      {/* Pagination */}
      {users?.meta && users.meta.last_page > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Oldingi
            </button>
            
            <span className="px-4 py-2 text-gray-700">
              {filters.page} / {users.meta.last_page}
            </span>
            
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= users.meta.last_page}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}