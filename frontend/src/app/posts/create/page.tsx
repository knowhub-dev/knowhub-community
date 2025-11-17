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
import { AiProgressUpdate, AiSuggestion, AiSuggestionStatus, createAiSuggestionStream } from '@/lib/services/ai-suggestions';

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
  const { user } = useAuth();
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kirish talab qilinadi</h1>
          <p className="text-gray-600 mb-6">Post yaratish uchun tizimga kiring</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/posts"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ortga
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Yangi Post Yaratish</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Tahrirlash' : 'Ko\'rish'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Nashr qilish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || 'Post sarlavhasi'}</h1>
            <div className="prose prose-lg max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
              ) : (
                <p className="text-gray-500">Post kontenti bu yerda ko'rsatiladi...</p>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Post sarlavhasi *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Muhokama uchun sarlavha..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriya *
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teglar
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tagName) => (
                  <span
                    key={tagName}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {tagName}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tagName)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
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
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post rasmi (ixtiyoriy)
              </label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Post rasmi preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer"
                    >
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Rasm yuklash uchun bosing</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (max 5MB)</p>
                    </label>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label htmlFor="content-editor" className="block text-sm font-medium text-gray-700 mb-2">
                Post kontenti *
              </label>
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  {!editor ? (
                    <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Editor yuklanmoqda...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {toolbarGroups.map((group, groupIndex) => (
                          <div key={`group-${groupIndex}`} className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                            {group.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                onClick={action.command}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm border border-transparent hover:bg-white hover:border-gray-200 ${
                                  action.isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'text-gray-700'
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
                      <div className="border border-gray-300 rounded-lg min-h-[384px]">
                        <EditorContent id="content-editor" editor={editor} className="prose max-w-none p-4 focus:outline-none" />
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
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
            <div className="flex justify-end space-x-4">
              <Link
                href="/posts"
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Bekor qilish
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Nashr qilish
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
