import { api } from '@/lib/api';
import { generateStaticMetadata } from '@/lib/metadata-helpers';
import { Folder, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const generateMetadata = generateStaticMetadata({
  title: 'Kategoriyalar',
  description: 'Eng mashhur mavzular va ularni o‘rganish bo‘yicha postlar to‘plami.',
  path: '/categories',
});

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count: number;
  icon?: string;
}

async function getCategories() {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Folder className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategoriyalar</h1>
        <p className="text-xl text-gray-600">
          Mavzular bo'yicha postlarni topish va o'rganish
        </p>
      </div>

      {/* Categories Grid */}
      {categories && categories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/posts?category=${category.slug}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-indigo-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{category.icon || '📁'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>{category.posts_count} post</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kategoriyalar topilmadi</h3>
          <p className="text-gray-600">Hozircha kategoriyalar mavjud emas</p>
        </div>
      )}
    </div>
  );
}