// app/posts/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PostCollaborationPanelWrapper from '@/components/PostCollaborationPanelWrapper';
import { buildCanonicalUrl, getSiteName } from '@/lib/seo';
import Script from 'next/script';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
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

const buildSnippet = (markdown?: string) =>
  markdown
    ? markdown.replace(/[#*_`>\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    : "O'qish uchun yangi post.";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const post = await getPost(slug);
  const description = post.excerpt?.trim() || buildSnippet(post.content_markdown);
  const keywords = post.tags?.map((tag) => tag.name) ?? [];
  const canonical = buildCanonicalUrl(`/posts/${post.slug}`);
  const ogImage = buildCanonicalUrl(`/posts/${post.slug}/opengraph-image`);
  const siteName = getSiteName();

  return {
    title: `${post.title} · ${siteName}`,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description,
      siteName,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

// ✅ Page component
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPost(slug);
  const snippet = buildSnippet(post.content_markdown);

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.created_at,
    author: {
      '@type': 'Person',
      name: post.user.name,
      url: buildCanonicalUrl(`/profile/${post.user.username}`),
    },
    publisher: {
      '@type': 'Organization',
      name: 'KnowHub Community',
      url: buildCanonicalUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: buildCanonicalUrl('/globe.svg'),
      },
    },
    description: snippet,
    url: buildCanonicalUrl(`/posts/${post.slug}`),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(var(--background))]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_40%_70%,rgba(16,185,129,0.08),transparent_20%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface))]/70 via-transparent to-[hsl(var(--background))]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 lg:px-8 lg:pt-14">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 px-3 py-1 transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
          >
            Blog postlari
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="rounded-full bg-[hsl(var(--surface))]/80 px-3 py-1 text-xs font-medium text-foreground">
            {post.category?.name ?? 'Jamiyat' }
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/7 via-transparent to-[hsl(var(--secondary))]/8" aria-hidden />
          <div className="relative grid gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:px-10 lg:py-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                Post tafsilotlari
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">{post.title}</h1>
              <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{snippet}</p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--surface))]/70 px-3 py-2 shadow-inner">
                  <img
                    src={post.user.avatar_url ?? '/default-avatar.png'}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full border border-border/70 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--surface))]/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formatDate(post.created_at)}
                </div>

                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{post.score} ovoz</span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">{post.answers_count} javob</span>
                </div>
              </div>

              {!!post.tags?.length && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.slug}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 px-3 py-1 text-sm font-medium text-foreground shadow-sm"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-gradient-to-b from-[hsl(var(--surface))]/90 to-[hsl(var(--background))] px-4 py-4 shadow-inner lg:px-6 lg:py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Post xulosasi</p>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {snippet || "Ushbu post tafsilotlari bilan tanishing va hamjamiyat bilan fikr almashing."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/70 bg-white/5 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">Kategoriya</p>
                  <p className="mt-1 text-foreground">{post.category?.name ?? 'Jamiyat'}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-white/5 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">Javoblar</p>
                  <p className="mt-1 text-foreground">{post.answers_count}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-white/5 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">Ovozlar</p>
                  <p className="mt-1 text-foreground">{post.score}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-white/5 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">Qo'shilgan</p>
                  <p className="mt-1 text-foreground">{formatDate(post.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-[hsl(var(--primary))]/40 bg-primary/10 px-3 py-1 font-semibold text-primary">Hamjamiyatga qo'shiling</span>
                <span className="rounded-full border border-[hsl(var(--secondary))]/40 bg-secondary/10 px-3 py-1 font-semibold text-secondary">Baham ko'ring & muhokama qiling</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-[0_18px_70px_-45px_rgba(15,23,42,0.5)]">
            <div className="prose max-w-none prose-headings:mb-4 prose-headings:mt-6 prose-headings:font-semibold prose-p:leading-relaxed prose-strong:text-foreground prose-ul:list-disc prose-li:text-foreground/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_markdown}</ReactMarkdown>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border/70 bg-[hsl(var(--surface))]/80 p-5 shadow-inner">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Post holati</h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/5 px-3 py-3">
                  <span>Ovozlar</span>
                  <span className="font-semibold text-foreground">{post.score}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/5 px-3 py-3">
                  <span>Javoblar</span>
                  <span className="font-semibold text-foreground">{post.answers_count}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/5 px-3 py-3">
                  <span>Muallif</span>
                  <span className="font-semibold text-foreground">{post.user.name}</span>
                </div>
              </div>
            </div>

            {!!post.tags?.length && (
              <div className="rounded-3xl border border-border/70 bg-[hsl(var(--surface))]/80 p-5 shadow-inner">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Teglar</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.slug}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-r from-[hsl(var(--surface))]/90 via-[hsl(var(--background))] to-[hsl(var(--surface))]/85 p-2 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.55)]">
          <div className="rounded-2xl border border-dashed border-border/80 bg-white/5 p-4 sm:p-6">
            <PostCollaborationPanelWrapper
              postSlug={post.slug}
              postOwnerId={post.user.id}
              initialContent={post.content_markdown}
            />
          </div>
        </div>
      </div>
      <Script id={`post-jsonld-${post.id}`} type="application/ld+json">
        {JSON.stringify(postJsonLd)}
      </Script>
    </div>
  );
}

// For `output: 'export'` Next requires generateStaticParams for dynamic routes.
// Provide an empty list so export build doesn't fail. If you want pre-rendered
// posts at build time, replace this to fetch slugs from the API.
export async function generateStaticParams() {
  return [];
}


