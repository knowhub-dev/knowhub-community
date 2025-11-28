'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import MarkdownEditor from '@/components/features/posts/MarkdownEditor';
import { Category, Tag } from '@/types';
import { Shield, Trophy, Sparkles, Loader2, Check, Tag as TagIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const [tagQuery, setTagQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      toast.success('Post muvaffaqiyatli chop etildi! 🚀');
      setErrors({});
      router.push(`/posts/${data.slug}`);
      router.refresh();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 422) {
        const validationErrors = axiosError.response.data?.errors ?? {};
        const mappedErrors: Record<string, string> = {
          title: validationErrors.title?.[0],
          content: validationErrors.content?.[0] || validationErrors.content_markdown?.[0],
          category: validationErrors.category_id?.[0],
          tags: validationErrors.tags?.[0],
        };
        setErrors((prev) => ({ ...prev, ...mappedErrors }));
        toast.error("Iltimos, kiritilgan ma'lumotlarni tekshiring");
      } else {
        toast.error('Xatolik yuz berdi');
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localErrors: Record<string, string> = {};

    if (!title.trim()) {
      localErrors.title = 'Sarlavha talab qilinadi';
    }
    if (!content.trim()) {
      localErrors.content = 'Kontent kiritilishi shart';
    }
    if (!selectedCategory) {
      localErrors.category = 'Kategoriya tanlang';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error("Iltimos, majburiy maydonlarni to'ldiring");
      return;
    }

    setErrors({});
    createPost.mutate();
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const filteredTags = useMemo(
    () =>
      tags?.filter((tag) => tag.name.toLowerCase().includes(tagQuery.toLowerCase())) || [],
    [tags, tagQuery]
  );

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
      <Toaster position="top-right" />
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
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proyektlaringiz haqidagi eng jasur g'oya..."
            status={errors.title ? 'error' : 'default'}
            className="bg-transparent text-2xl font-semibold text-white placeholder:text-white/40"
          />
          {errors.title ? (
            <p className="mt-2 text-sm text-red-300">{errors.title}</p>
          ) : null}
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
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            status={errors.category ? 'error' : 'default'}
            errorMessage={errors.category}
            aria-label="Kategoriya tanlash"
          >
            <option value="" disabled>
              Kategoriya tanlang
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div>
              <p className="font-semibold text-white">Teglar</p>
              <p className="text-xs text-white/60">Mazmunni tezroq topish uchun rangli teglar tanlang.</p>
            </div>
            <Sparkles className="h-4 w-4 text-blue-300" />
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <TagIcon className="h-4 w-4 text-indigo-300" />
                <span>Bir nechta tegni tanlang yoki qidiring</span>
              </div>
              <Badge variant="outline" className="border-white/20 text-white">
                {selectedTags.length} tanlandi
              </Badge>
            </div>

            <Input
              placeholder="Teglarni qidiring..."
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              className="bg-slate-900/60 text-white placeholder:text-white/60"
              status={errors.tags ? 'error' : 'default'}
            />

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {filteredTags.map((tag) => {
                const active = selectedTags.includes(tag.name);
                return (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      'justify-start gap-2 border-white/20 bg-slate-900/60 text-sm text-white',
                      active && 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 text-white'
                    )}
                  >
                    {active ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    {tag.name}
                  </Button>
                );
              })}
            </div>

            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            {errors.tags ? <p className="text-sm text-red-300">{errors.tags}</p> : null}
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
          {errors.content ? <p className="text-sm text-red-300">{errors.content}</p> : null}
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <Trophy className="h-4 w-4 text-amber-300" /> Minimum XP talabi
            </label>
            <Input
              type="number"
              min="0"
              value={requiredXp}
              onChange={(e) => setRequiredXp(Number(e.target.value))}
              className="bg-slate-900/70 text-white"
              status={errors.requiredXp ? 'error' : 'default'}
            />
            <p className="text-xs text-white/60">O'quvchilar uchun minimal XP darajasini belgilang.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="h-4 w-4 text-cyan-300" /> Faqat tasdiqlangan foydalanuvchilar
            </label>
            <Button
              type="button"
              variant={requiresVerification ? 'default' : 'outline'}
              onClick={() => setRequiresVerification((prev) => !prev)}
              className="flex w-full items-center justify-between border-white/20 bg-slate-900/70 text-white"
            >
              <span>Tasdiqlangan profilgagina ruxsat etish</span>
              <span
                className={cn(
                  'inline-flex h-6 w-12 items-center rounded-full border border-white/20 bg-slate-800 transition-all',
                  requiresVerification && 'border-emerald-400 bg-emerald-500/20'
                )}
              >
                <span
                  className={cn(
                    'mx-1 h-4 w-4 rounded-full bg-white transition-transform',
                    requiresVerification ? 'translate-x-5 bg-emerald-300' : 'translate-x-0'
                  )}
                />
              </span>
            </Button>
            <p className="text-xs text-white/60">Kuchli moderatsiya talab etiladigan mavzular uchun tavsiya etiladi.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={createPost.isPending}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-0 w-1/3 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
            {createPost.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Yuborilmoqda...
              </span>
            ) : (
              '🚀 Publish to Community'
            )}
          </Button>
          <p className="text-center text-xs text-white/60">Kodlash, dizayn va tajribalarni bo'lishing. Jamiyat sizni kutmoqda.</p>
        </div>
      </div>
    </form>
  );
}
