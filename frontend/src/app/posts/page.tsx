'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import PostCard from '@/components/features/posts/PostCard';
import { Post, Tag, Category } from '@/types';
import { Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PostSkeleton from '@/components/features/posts/PostSkeleton';

async function getPosts(params: { tag?: string; category?: string; search?: string; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params.tag) searchParams.append('tag', params.tag);
  if (params.category) searchParams.append('category', params.category);
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', params.page.toString());
  
  const res = await api.get(`/posts?${searchParams.toString()}`);
  return res.data;
}

async function getTags() {
  const res = await api.get('/tags');
  return res.data;
}

async function getCategories() {
  const res = await api.get('/categories');
  return res.data;
}

export default function PostsPage() {
  const [filters, setFilters] = useState({
    tag: '',
    category: '',
    search: '',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => getPosts(filters),
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  };

  if (postsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <PostSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Postlar</h1>
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
            placeholder="Postlarni qidirish..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Barcha kategoriyalar</option>
                  {categories?.map((category: Category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teg
                </label>
                <select
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Barcha teglar</option>
                  {tags?.map((tag: Tag) => (
                    <option key={tag.slug} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => setFilters({ tag: '', category: '', search: '', page: 1 })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Filtrlarni tozalash
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts?.data?.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Empty State */}
      {posts?.data?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Postlar topilmadi</h3>
          <p className="text-gray-600">Qidiruv shartlaringizni o'zgartirib ko'ring</p>
        </div>
      )}

      {/* Pagination */}
      {posts?.meta && posts.meta.last_page > 1 && (
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
              {filters.page} / {posts.meta.last_page}
            </span>
            
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= posts.meta.last_page}
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