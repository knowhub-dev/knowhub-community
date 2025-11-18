'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Eye, X, Code2, Bold, Italic, Heading2, List, ListOrdered, Image as ImageIcon, Table as TableIcon, AtSign, Undo2, Redo2, Type } from 'lucide-react';
import Link from 'next/link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Mention from '@tiptap/extension-mention';
import AiSuggestionsPanel from '@/components/AiSuggestionsPanel';
import { Button } from '@/components/ui/button';
import { AiProgressUpdate, AiSuggestion, AiSuggestionStatus, createAiSuggestionStream } from '@/lib/services/ai-suggestions';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

async function getCategories() {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: [] };
  }
}

async function getTags() {
  try {
    const res = await api.get('/tags');
    return res.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { data: [] };
  }
}

export default function CreatePostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [aiStatus, setAiStatus] = useState<AiSuggestionStatus>('idle');
  const [aiProgress, setAiProgress] = useState<AiProgressUpdate | undefined>();
  const [aiTransport, setAiTransport] = useState<'sse' | 'websocket'>('sse');
  const [aiError, setAiError] = useState<string | undefined>();
  const [aiReplayKey, setAiReplayKey] = useState(0);
  const streamCleanupRef = useRef<() => void>();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    retry: 1,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    retry: 1,
  });

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }).extend({
        addKeyboardShortcuts() {
          return {
            'Mod-b': () => this.editor.commands.toggleBold(),
            'Mod-i': () => this.editor.commands.toggleItalic(),
            'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
          };
        },
      }),
      Placeholder.configure({
        placeholder: 'Postni shu yerga yozing...',
      }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-indigo-600 font-semibold',
        },
        suggestion: {
          items: ({ query }) => {
            const mentions = ['@developer', '@designer', '@community'];
            if (!query) return mentions;
            return mentions.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
          },
          render: () => ({
            onStart() {},
            onUpdate() {},
            onKeyDown() {
              return false;
            },
            onExit() {},
          }),
        },
      }),
    ],
    content,
    autofocus: true,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const handleInsertImage = () => {
    if (!editor) return;
    const src = imagePreview || window.prompt('Rasm URL manzilini kiriting');
    if (src) {
      editor.chain().focus().setImage({ src }).run();
    }
  };

  const toolbarGroups = useMemo(() => {
    if (!editor) return [];

    const actions = [
      [
        {
          label: 'Sarlavha',
          icon: <Heading2 className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
          shortcut: 'Mod+Alt+2',
        },
        {
          label: 'Paragraf',
          icon: <Type className="w-4 h-4" />,
          command: () => editor.chain().focus().setParagraph().run(),
          isActive: editor.isActive('paragraph'),
        },
      ],
      [
        {
          label: 'Qalin',
          icon: <Bold className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
          shortcut: 'Mod+B',
        },
        {
          label: 'Kursiv',
          icon: <Italic className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
          shortcut: 'Mod+I',
        },
      ],
      [
        {
          label: 'Kod bloki',
          icon: <Code2 className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive('codeBlock'),
        },
      ],
      [
        {
          label: 'Ro\'yxat',
          icon: <List className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
        },
        {
          label: 'Raqamli ro\'yxat',
          icon: <ListOrdered className="w-4 h-4" />,
          command: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
        },
        {
          label: 'Shift+Tab',
          icon: <Undo2 className="w-4 h-4" />,
          command: () => editor.chain().focus().liftListItem('listItem').run(),
          shortcut: 'Shift+Tab',
        },
      ],
      [
        {
          label: 'Jadval',
          icon: <TableIcon className="w-4 h-4" />,
          command: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          isActive: editor.isActive('table'),
        },
        {
          label: 'Rasm',
          icon: <ImageIcon className="w-4 h-4" />,
          command: handleInsertImage,
        },
        {
          label: 'Mention',
          icon: <AtSign className="w-4 h-4" />,
          command: () => editor.chain().focus().insertContent([
            { type: 'mention', attrs: { id: 'user', label: '@user' } },
            { type: 'text', text: ' ' },
          ]).run(),
        },
      ],
      [
        {
          label: 'Ortga',
          icon: <Undo2 className="w-4 h-4" />,
          command: () => editor.chain().focus().undo().run(),
        },
        {
          label: 'Qayta',
          icon: <Redo2 className="w-4 h-4" />,
          command: () => editor.chain().focus().redo().run(),
        },
      ],
    ];

    return actions;
  }, [editor, imagePreview]);

  useEffect(() => {
    if (!content.trim()) {
      setAiSuggestions([]);
      setAiStatus('idle');
      setAiProgress(undefined);
      setAiError(undefined);
      streamCleanupRef.current?.();
      streamCleanupRef.current = undefined;
      return;
    }

    const controller = new AbortController();
    const debounceTimer = window.setTimeout(() => {
      streamCleanupRef.current?.();
      setAiProgress(undefined);
      setAiError(undefined);

      const cleanup = createAiSuggestionStream({
        content,
        transport: aiTransport,
        signal: controller.signal,
        onSuggestion: (suggestion) => {
          setAiSuggestions((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === suggestion.id);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = { ...updated[existingIndex], ...suggestion };
              return updated;
            }

            return [suggestion, ...prev].slice(0, 20);
          });
        },
        onStatusChange: (status) => {
          setAiStatus(status);
          if (status === 'rate_limited') {
            setAiError('AI vaqtincha javob bera olmadi. Bir ozdan so\'ng qayta urinib ko\'ring.');
          }
          if (status === 'error') {
            setAiError('AI tavsiyalar oqimida xatolik yuz berdi.');
          }
          if (status === 'done') {
            streamCleanupRef.current?.();
            streamCleanupRef.current = undefined;
          }
        },
        onProgress: (payload) => setAiProgress(payload),
        onError: (message) => setAiError(message),
      });

      streamCleanupRef.current = cleanup;
    }, 600);

    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
      streamCleanupRef.current?.();
    };
  }, [content, aiTransport, aiReplayKey]);

  const handleApplySuggestion = (text: string) => {
    if (!editor || !text) return;
    editor.chain().focus().insertContent(text).run();
  };

  const handleRetryStream = () => {
    setAiSuggestions([]);
    setAiError(undefined);
    setAiProgress(undefined);
    setAiStatus('connecting');
    setAiReplayKey((key) => key + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !selectedCategory) {
      alert('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        content_markdown: content.trim(),
        category_id: parseInt(selectedCategory),
        tags: selectedTags
      };

      const res = await api.post('/posts', postData);

      if (res.data.success) {
        router.push(`/posts/${res.data.data.slug}`);
      } else {
        throw new Error('Post yaratishda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Post yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <div className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-[hsl(var(--card))] p-8 text-center shadow-xl">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-semibold">Kirish talab qilinadi</h1>
          <p className="text-sm text-muted-foreground">Post yaratish uchun tizimga kiring</p>
          <Button asChild className="w-full justify-center text-base font-semibold">
            <Link href="/auth/login">Kirish</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="border-b border-border/60 bg-[hsl(var(--surface))]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="gap-2 rounded-full border border-border/60 bg-[hsl(var(--card))] px-4">
              <Link href="/posts">
                <ArrowLeft className="h-4 w-4" /> Ortga
              </Link>
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">SolVera yordamida</p>
              <h1 className="text-3xl font-semibold leading-tight">Yangi Post Yaratish</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-full border-border/70 bg-[hsl(var(--card))] px-4"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Tahrirlash' : "Ko'rish"}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 rounded-full px-5">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary-foreground))] border-t-transparent" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Nashr qilish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {showPreview ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Post ko'rinishi</h2>
                <Link href="/posts/create" className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline">
                  Asosiy rejaga qaytish
                </Link>
              </div>
              <div className="prose max-w-none text-[hsl(var(--foreground))]">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{title || 'Post sarlavhasi'}</h1>
                <p className="text-sm text-muted-foreground">
                  Kategoriya: {selectedCategory || 'Tanlanmagan'} | Teglar: {selectedTags.length ? selectedTags.join(', ') : 'Teglar tanlanmagan'}
                </p>
                <div className="mt-6 rounded-2xl border border-border/60 bg-[hsl(var(--surface))] p-4">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-muted-foreground">Post kontenti bu yerda ko'rsatiladi...</p>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <AiSuggestionsPanel
                suggestions={aiSuggestions}
                status={aiStatus}
                progress={aiProgress}
                transport={aiTransport}
                onTransportChange={setAiTransport}
                onApply={handleApplySuggestion}
                onRetry={handleRetryStream}
                errorMessage={aiError}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Post sarlavhasi *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Muhokama uchun sarlavha..."
                className="w-full rounded-xl border border-border/60 bg-[hsl(var(--surface))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/30"
                required
              />
            </div>

            {/* Category */}
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <label htmlFor="category" className="mb-2 block text-sm font-medium">
                Kategoriya *
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-[hsl(var(--surface))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/30"
                required
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <label className="mb-2 block text-sm font-medium">
                Teglar
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTags.map((tagName) => (
                  <span
                    key={tagName}
                    className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/15 px-3 py-1 text-sm font-medium text-[hsl(var(--primary))]"
                  >
                    {tagName}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tagName)}
                      className="text-[hsl(var(--primary))] transition hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: Tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                      selectedTags.includes(tag.name)
                        ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]'
                        : 'border-border/60 bg-[hsl(var(--surface))] text-muted-foreground hover:border-border hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <label className="mb-2 block text-sm font-medium">
                Post rasmi (ixtiyoriy)
              </label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Post rasmi preview"
                      className="h-48 w-full max-w-md rounded-2xl border border-border/70 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute right-2 top-2 rounded-full bg-[hsl(var(--destructive))] p-1 text-[hsl(var(--destructive-foreground))] shadow transition hover:brightness-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-border/70 p-6 text-center transition hover:border-[hsl(var(--primary))]/60">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setImagePreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--surface))] text-muted-foreground">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="mb-1 text-sm font-medium text-[hsl(var(--foreground))]">Rasm yuklash uchun bosing</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF (max 5MB)</p>
                    </label>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-lg">
              <label htmlFor="content-editor" className="mb-2 block text-sm font-medium">
                Post kontenti *
              </label>
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  {!editor ? (
                    <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-border/60 bg-[hsl(var(--surface))]">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent"></div>
                        <p className="text-muted-foreground">Editor yuklanmoqda...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {toolbarGroups.map((group, groupIndex) => (
                          <div key={`group-${groupIndex}`} className="flex items-center space-x-2 rounded-xl border border-border/60 bg-[hsl(var(--surface))] px-2 py-1 shadow-sm">
                            {group.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                onClick={action.command}
                                className={`flex items-center space-x-1 rounded-lg border px-2 py-1 text-sm transition ${
                                  action.isActive
                                    ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]'
                                    : 'border-transparent text-[hsl(var(--foreground))] hover:border-border/60 hover:bg-[hsl(var(--muted))]/60'
                                }`}
                                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                              >
                                {action.icon}
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="min-h-[384px] rounded-2xl border border-border/60 bg-[hsl(var(--surface))]">
                        <EditorContent id="content-editor" editor={editor} className="prose prose-neutral max-w-none p-4 focus:outline-none dark:prose-invert" />
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p><strong>TipTap WYSIWYG Editor</strong> - toolbar orqali heading, matn uslublari, kod bloklari, ro'yxatlar, jadval va mention qo'shish mumkin. Qisqa tugmalar: <code>Mod+B</code>, <code>Mod+I</code>, <code>Shift+Tab</code>.</p>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <AiSuggestionsPanel
                    suggestions={aiSuggestions}
                    status={aiStatus}
                    progress={aiProgress}
                    transport={aiTransport}
                    onTransportChange={setAiTransport}
                    onApply={handleApplySuggestion}
                    onRetry={handleRetryStream}
                    errorMessage={aiError}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button asChild variant="outline" className="gap-2 rounded-full border-border/70 bg-[hsl(var(--card))] px-6">
                <Link href="/posts">Bekor qilish</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 rounded-full px-6">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary-foreground))] border-t-transparent" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Nashr qilish
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
