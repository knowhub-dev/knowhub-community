'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User } from '@/types';
import { Trophy, Medal, Award, Users, FileText, UserPlus, Calendar } from 'lucide-react';
import Link from 'next/link';

async function getLeaderboard(params: { period?: string; type?: string }) {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.append('period', params.period);
  if (params.type) searchParams.append('type', params.type);
  
  const res = await api.get(`/users/leaderboard?${searchParams.toString()}`);
  return res.data;
}

export default function LeaderboardPage() {
  const [filters, setFilters] = useState({
    period: 'all',
    type: 'xp'
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: () => getLeaderboard(filters),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getStatValue = (user: User, type: string) => {
    switch (type) {
      case 'xp':
        return user.xp;
      case 'posts':
        return user.stats?.posts_count || 0;
      case 'followers':
        return user.stats?.followers_count || 0;
      default:
        return 0;
    }
  };

  const getStatLabel = (type: string) => {
    switch (type) {
      case 'xp':
        return 'XP';
      case 'posts':
        return 'Postlar';
      case 'followers':
        return 'Kuzatuvchilar';
      default:
        return '';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Reyting jadvali</h1>
        </div>
        <p className="text-gray-600">Eng faol va muvaffaqiyatli foydalanuvchilar</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Davr
            </label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Barcha vaqt</option>
              <option value="month">Bu oy</option>
              <option value="week">Bu hafta</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Mezon
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="xp">XP bo'yicha</option>
              <option value="posts">Postlar soni</option>
              <option value="followers">Kuzatuvchilar soni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {users && users.length >= 3 && (
        <div className="mb-8">
          <div className="flex items-end justify-center space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg p-6 mb-4 transform translate-y-4">
                <img
                  src={users[1].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(users[1].name)}`}
                  alt={users[1].name}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />
                <Medal className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="font-bold text-white">{users[1].name}</p>
                <p className="text-sm text-gray-100">{getStatValue(users[1], filters.type)} {getStatLabel(filters.type)}</p>
              </div>
              <div className="bg-gray-300 h-20 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-lg p-6 mb-4">
                <img
                  src={users[0].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(users[0].name)}`}
                  alt={users[0].name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white"
                />
                <Trophy className="w-10 h-10 text-yellow-700 mx-auto mb-2" />
                <p className="font-bold text-white text-lg">{users[0].name}</p>
                <p className="text-sm text-yellow-100">{getStatValue(users[0], filters.type)} {getStatLabel(filters.type)}</p>
              </div>
              <div className="bg-yellow-400 h-24 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-yellow-800">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg p-6 mb-4 transform translate-y-4">
                <img
                  src={users[2].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(users[2].name)}`}
                  alt={users[2].name}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />
                <Award className="w-8 h-8 text-amber-700 mx-auto mb-2" />
                <p className="font-bold text-white">{users[2].name}</p>
                <p className="text-sm text-amber-100">{getStatValue(users[2], filters.type)} {getStatLabel(filters.type)}</p>
              </div>
              <div className="bg-amber-500 h-16 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-800">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">To'liq reyting</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {users?.map((user: User, index: number) => (
            <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  
                  <div>
                    <Link
                      href={`/profile/${user.username}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {user.name}
                    </Link>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                  
                  {user.level && (
                    <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                      <span>{user.level.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {getStatValue(user, filters.type)}
                  </p>
                  <p className="text-sm text-gray-500">{getStatLabel(filters.type)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {users?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ma'lumotlar topilmadi</h3>
          <p className="text-gray-600">Tanlangan davr uchun ma'lumotlar mavjud emas</p>
        </div>
      )}
    </div>
  );
}