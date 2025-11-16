'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import PostCard from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { Post } from '@/types';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

async function getBookmarks() {
  const res = await api.get('/bookmarks');
  return res.data;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Saqlangan postlar</h2>
          <p className="text-gray-600 mb-6">
            Saqlangan postlarni ko'rish uchun tizimga kiring
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

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-600">Xatolik yuz berdi</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Bookmark className="w-8 h-8 text-indigo-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Saqlangan postlar</h1>
      </div>

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Saqlangan postlar yo'q</h3>
          <p className="text-gray-600 mb-6">
            Postlarni saqlash uchun bookmark tugmasini bosing
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Postlarni ko'rish
          </Link>
        </div>
      )}
    </div>
  );
}