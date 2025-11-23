'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Category, Tag } from '@/types';
import { Shield, Trophy, Sparkles } from 'lucide-react';

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
  const [livePreview, setLivePreview] = useState(true);

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

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
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
    <form onSubmit={handleSubmit} className="space-y-8 p-8 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="gradient-text text-xs font-semibold uppercase tracking-[0.3em]">Yangi Post</p>
          <h2 className="text-2xl font-semibold text-white">Dokumentday yozing, klubday yarating.</h2>
          <p className="text-sm text-white/70">Minimal chiziqlar, maksimal ilhom. Tegishli kategoriyani tanlang va boshlang!</p>
        </div>
        <span className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 sm:block">
          Creator Mode
        </span>
      </div>

      <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_-60px_rgba(99,102,241,0.7)] backdrop-blur-xl">
        <div className="relative group">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proyektlaringiz haqidagi eng jasur g'oya..."
            className="w-full bg-transparent text-4xl font-extrabold leading-tight text-white placeholder:text-white/40 focus:outline-none"
            required
          />
          <div className="absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div>
              <p className="font-semibold text-white">Kategoriya</p>
              <p className="text-xs text-white/60">Ko'proq to'g'ri auditoriyaga chiqish uchun yo'nalishni tanlang.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">Scroll</span>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories?.map((category) => {
              const isActive = String(category.id) === String(selectedCategory);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(String(category.id))}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                      : 'border border-white/10 bg-white/10 text-white/80 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  {category.name}
                  {isActive && <span className="absolute inset-0 rounded-full border border-white/30 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div>
              <p className="font-semibold text-white">Teglar</p>
              <p className="text-xs text-white/60">Mazmunni tezroq topish uchun rangli teglar tanlang.</p>
            </div>
            <Sparkles className="h-4 w-4 text-blue-300" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => {
              const active = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`group relative overflow-hidden rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 text-white shadow-[0_10px_40px_-15px_rgba(99,102,241,0.6)]'
                      : 'border border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {tag.name}
                  <span
                    className={`absolute inset-0 -z-10 scale-110 bg-white/10 blur-md transition-opacity duration-500 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Kontent</p>
              <p className="text-xs text-white/60">Markdown bilan yozing, dasturchilar uchun kod muharriri ruhida.</p>
            </div>
            <button
              type="button"
              onClick={() => setLivePreview((prev) => !prev)}
              className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
            >
              <span>Live Preview</span>
              <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-900/80">
                <span
                  className={`absolute left-1 h-4 w-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-lg transition-transform duration-300 ${
                    livePreview ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-950/70 shadow-[0_25px_90px_-45px_rgba(94,92,255,0.8)] transition-all duration-500 focus-within:border-purple-200/60 focus-within:shadow-[0_30px_100px_-40px_rgba(94,92,255,1)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100/80">
              <span>KnowHub Markdown Studio</span>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              </div>
            </div>
            <div className="creator-editor-shell p-4">
              <MarkdownEditor value={content} onChange={setContent} preview={livePreview ? 'live' : 'edit'} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <Trophy className="h-4 w-4 text-amber-300" /> Minimum XP talabi
            </label>
            <input
              type="number"
              min="0"
              value={requiredXp}
              onChange={(e) => setRequiredXp(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            />
            <p className="text-xs text-white/60">O'quvchilar uchun minimal XP darajasini belgilang.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="h-4 w-4 text-cyan-300" /> Faqat tasdiqlangan foydalanuvchilar
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={requiresVerification}
                onChange={(e) => setRequiresVerification(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-slate-900 text-indigo-500 focus:ring-indigo-400/60"
              />
              Tasdiqlangan profilgagina ruxsat etish
            </label>
            <p className="text-xs text-white/60">Kuchli moderatsiya talab etiladigan mavzular uchun tavsiya etiladi.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={createPost.isPending}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-0 w-1/3 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
            {createPost.isPending ? 'Yuborilmoqda...' : '🚀 Publish to Community'}
          </button>
          <p className="text-center text-xs text-white/60">Kodlash, dizayn va tajribalarni bo'lishing. Jamiyat sizni kutmoqda.</p>
        </div>
      </div>
    </form>
  );
}
