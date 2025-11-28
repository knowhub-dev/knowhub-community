'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import {
  BarChart3,
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  Calendar,
  Award,
  Code,
  BookOpen,
  PenTool
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { isProUser } from '@/lib/user';

async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}

async function getDashboardActivity() {
  const res = await api.get('/dashboard/activity');
  return res.data;
}

async function getTrending() {
  const res = await api.get('/dashboard/trending');
  return res.data;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    enabled: !!user,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: getDashboardActivity,
    enabled: !!user,
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['dashboard', 'trending'],
    queryFn: getTrending,
    enabled: !!user,
  });

  const hasRecentPosts = activity?.recent_posts && activity.recent_posts.length > 0;
  const hasRecentComments = activity?.recent_comments && activity.recent_comments.length > 0;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Dashboard ko'rish uchun tizimga kiring
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tizimga kirish
          </Link>
        </div>
      </div>
    );
  }

  if (statsLoading || activityLoading || trendingLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border/70 bg-white p-6 space-y-4">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border border-border/70 bg-white p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border/60 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-white p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border/60 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">KnowHub Community statistikalari va faoliyat</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jami foydalanuvchilar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
              <p className="text-xs text-green-600">+{stats?.users?.new_this_month || 0} bu oy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jami postlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.posts?.total || 0}</p>
              <p className="text-xs text-green-600">+{stats?.posts?.this_week || 0} bu hafta</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jami kommentlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.comments?.total || 0}</p>
              <p className="text-xs text-green-600">+{stats?.comments?.today || 0} bugun</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Code className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kod ishga tushirish</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.code_runs?.total || 0}</p>
              <p className="text-xs text-green-600">{stats?.code_runs?.successful || 0} muvaffaqiyatli</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sizning faoliyatingiz</h2>
          
          {/* Recent Posts */}
          {hasRecentPosts ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">So'nggi postlaringiz</h3>
              <div className="space-y-2">
                {activity?.recent_posts?.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={PenTool}
              title="Hozircha postlaringiz yo‘q"
              description="Biror g'oya bilan jamiyatni ilhomlantiring."
              action={{ label: 'Post yozish', href: '/posts/create' }}
            />
          )}

          {/* Recent Comments */}
          {hasRecentComments ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">So'nggi kommentlaringiz</h3>
              <div className="space-y-2">
                {activity?.recent_comments?.map((comment: any) => (
                  <Link
                    key={comment.id}
                    href={`/posts/${comment.post.slug}#comment-${comment.id}`}
                    className={cn(
                      'block rounded-lg p-3 transition-colors border',
                      isProUser(comment.user)
                        ? 'bg-yellow-500/5 border-yellow-200/70 hover:bg-yellow-500/10'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100',
                    )}
                  >
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {comment.content_markdown.substring(0, 100)}...
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {comment.post.title} • {new Date(comment.created_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={MessageCircle}
              title="Hozircha kommentlaringiz yo‘q"
              description="Postlarga fikr bildirib suhbatlarni boshlang."
              action={{ label: 'Postlarni ko‘rish', href: '/posts' }}
            />
          )}
        </div>

        {/* Trending Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trend kontent</h2>
          
          {/* Trending Posts */}
          {trending?.posts && trending.posts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">🔥 Trend postlar</h3>
              <div className="space-y-2">
                {trending.posts.slice(0, 5).map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{post.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{post.user.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>↑ {post.score}</span>
                        <span>💬 {post.answers_count}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {trending?.tags && trending.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Mashhur teglar</h3>
              <div className="flex flex-wrap gap-2">
                {trending.tags.slice(0, 10).map((tag: any) => (
                  <Link
                    key={tag.slug}
                    href={`/posts?tag=${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors"
                  >
                    #{tag.name}
                    <span className="ml-1 text-indigo-500">({tag.usage_count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tezkor harakatlar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/posts/create"
            className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-indigo-700">Yangi post</span>
          </Link>
          
          <Link
            href="/wiki/create"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Wiki maqola</span>
          </Link>
          
          <Link
            href="/leaderboard"
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Award className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-700">Reyting</span>
          </Link>
          
          <Link
            href="/analytics"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Analitika</span>
          </Link>
        </div>
      </div>
    </div>
  );
}