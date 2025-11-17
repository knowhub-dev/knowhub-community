'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Category, Tag } from '@/types';
import { Shield, Trophy } from 'lucide-react';

async function getCategories() {
  const res = await api.get('/categories');
  return res.data;
}

async function getTags() {
  const res = await api.get('/tags');
  return res.data;
}

export default function NewPostForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [requiredXp, setRequiredXp] = useState(0);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await api.post('/posts', {
        title,
        content_markdown: content,
        category_id: selectedCategory,
        tags: selectedTags,
        required_xp: requiredXp,
        requires_verification: requiresVerification
      });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/posts/${data.slug}`);
      router.refresh();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    createPost.mutate();
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Post yozish uchun tizimga kirishingiz kerak
        </h2>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Sarlavha
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Kategoriya
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Tanlang...</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Teglar
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                if (selectedTags.includes(tag.name)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag.name));
                } else {
                  setSelectedTags([...selectedTags, tag.name]);
                }
              }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag.name)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Matn
        </label>
        <div className="mt-1">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900">Post sozlamalari</h3>
        
        <div>
          <label className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Minimum XP talabi</span>
          </label>
          <input
            type="number"
            min="0"
            value={requiredXp}
            onChange={(e) => setRequiredXp(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Foydalanuvchilarga bu postni o'qish uchun kerak bo'ladigan minimum XP miqdori
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={requiresVerification}
              onChange={(e) => setRequiresVerification(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Faqat tasdiqlangan foydalanuvchilar uchun
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-7">
            Bu postni faqat tasdiqlangan foydalanuvchilar o'qiy oladi
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createPost.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {createPost.isPending ? 'Yuborilmoqda...' : 'Yuborish'}
        </button>
      </div>
    </form>
  );
}