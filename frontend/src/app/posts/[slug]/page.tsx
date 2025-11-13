// app/posts/[slug]/page.tsx
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostCollaborationPanelWrapper from '@/components/PostCollaborationPanelWrapper';

interface Post {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  score: number;
  answers_count: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    level?: {
      name: string;
    };
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  ai_suggestion?: {
    model: string;
    content_markdown: string;
  };
  is_ai_suggested: boolean;
}

// 🔑 Bitta postni olish (SSR)
async function getPost(slug: string): Promise<Post> {
  try {
    const res = await api.get(`/posts/${slug}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

// ✅ Page component
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPost(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none">
            {post.content_markdown}
          </ReactMarkdown>
        </div>

        <PostCollaborationPanelWrapper
          postSlug={post.slug}
          postOwnerId={post.user.id}
          initialContent={post.content_markdown}
        />
      </div>
    </div>
  );
}

// For `output: 'export'` Next requires generateStaticParams for dynamic routes.
// Provide an empty list so export build doesn't fail. If you want pre-rendered
// posts at build time, replace this to fetch slugs from the API.
export async function generateStaticParams() {
  return [];
}


