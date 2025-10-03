import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, CreditCard as Edit, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  created_at: string;
  updated_at: string;
  version: number;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    level?: {
      name: string;
    };
  };
}

async function getWikiArticle(slug: string): Promise<WikiArticle> {
  try {
    const res = await api.get(`/wiki/${slug}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function WikiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getWikiArticle(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/wiki"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Wiki ga qaytish
            </Link>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Edit className="w-4 h-4 mr-1" />
                Tahrirlash
              </button>
            </div>
          </div>

          <div className="flex items-center text-green-600 mb-2">
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Wiki Maqola</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={article.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.user.name)}`}
                alt={article.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{article.user.name}</div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(article.updated_at).toLocaleDateString('uz-UZ')}</span>
                  {article.user.level && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-green-600">{article.user.level.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <span>Versiya {article.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content_markdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* Article Info */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <BookOpen className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Wiki Maqola Haqida</p>
              <p>
                Bu maqola hamjamiyat tomonidan yaratilgan va tahrirlanadi.
                Agar xato topsangiz yoki yaxshilashlar taklif qilmoqchi bo'lsangiz,
                tahrirlash tugmasini bosing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
