'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BookOpen, Search, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

async function getWikiArticles() {
  try {
    const res = await api.get('/wiki');
    return res.data;
  } catch (error) {
    console.error('Error fetching wiki articles:', error);
    return { data: [] };
  }
}

export default function WikiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: wikiData, isLoading, error } = useQuery({
    queryKey: ['wiki'],
    queryFn: getWikiArticles,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const filteredArticles = wikiData?.data?.filter((article: WikiArticle) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Wiki</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Hamjamiyat tomonidan yaratilgan bilim bazasi. Dasturlash bo'yicha maqolalar, 
              qo'llanmalar va eng yaxshi amaliyotlar.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Wiki maqolalarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Maqolalarni yuklab bo'lmadi</h3>
            <p className="text-gray-600">Iltimos, keyinroq qayta urinib ko'ring</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article: WikiArticle) => (
              <Link
                key={article.id}
                href={`/wiki/${article.slug}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.content_markdown.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <img
                      src={article.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.user.name)}`}
                      alt={article.user.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{article.user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(article.created_at).toLocaleDateString('uz-UZ')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Hech qanday maqola topilmadi' : 'Hozircha wiki maqolalari yo\'q'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Boshqa kalit so\'zlar bilan urinib ko\'ring' 
                : 'Birinchi wiki maqolasini yaratish uchun hamjamiyatga qo\'shiling!'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ro'yxatdan o'tish
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
