import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowUpRight,
  Clock,
  Eye,
  MessageCircle,
  Sparkles,
  Timer,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Post } from '@/types';

import BookmarkButton from './BookmarkButton';
import VoteButtons from './VoteButtons';

const getAvatar = (name: string, avatarUrl?: string) =>
  avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

const estimateReadTime = (content: string) => {
  const words = content ? content.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 220));
};

const buildExcerpt = (content: string, limit = 160) => {
  const sanitized = content.replace(/[#*_>`]/g, ' ').replace(/\s+/g, ' ').trim();
  if (sanitized.length <= limit) {
    return sanitized;
  }
  return `${sanitized.slice(0, limit)}…`;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

type PostCardVariant = 'standard' | 'compact' | 'highlighted' | 'skeleton';

type PostCardProps =
  | {
      post: Post;
      variant?: Exclude<PostCardVariant, 'skeleton'>;
      className?: string;
    }
  | {
      variant: 'skeleton';
      className?: string;
    };

type EnrichedPost = Post & {
  views?: number;
  views_count?: number;
};

const baseCardStyles =
  'group relative overflow-hidden rounded-lg border border-border/70 bg-surface/90 shadow-subtle backdrop-blur-md transition-all duration-200';

const variantStyles: Record<Exclude<PostCardVariant, 'skeleton'>, string> = {
  standard: 'p-6 hover:-translate-y-0.5 hover:shadow-neon',
  compact: 'p-4 hover:-translate-y-0.5 hover:shadow-neon',
  highlighted:
    'p-6 border-primary/70 bg-surface/95 ring-1 ring-inset ring-primary/35 hover:-translate-y-1 hover:shadow-neon',
};

function SkeletonCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        baseCardStyles,
        'p-6 animate-pulse border-border/50 bg-surface/70',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted/40" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-muted/40" />
          <div className="h-3 w-1/2 rounded bg-muted/30" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-5 w-3/4 rounded bg-muted/40" />
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-4 w-5/6 rounded bg-muted/30" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-muted/30" />
        <div className="h-9 w-24 rounded bg-muted/40" />
      </div>
    </article>
  );
}

function PostCardContent({
  post,
  variant,
  className,
}: {
  post: Post;
  variant: Exclude<PostCardVariant, 'skeleton'>;
  className?: string;
}) {
  const formattedDate = useMemo(() => formatDate(post.created_at), [post.created_at]);
  const readTime = useMemo(
    () => estimateReadTime(post.content_markdown),
    [post.content_markdown],
  );
  const excerpt = useMemo(
    () => buildExcerpt(post.content_markdown, variant === 'compact' ? 120 : 180),
    [post.content_markdown, variant],
  );
  const views = useMemo(() => {
    const { views, views_count, score } = post as EnrichedPost;
    return views ?? views_count ?? Math.max(score * 12, 48);
  }, [post]);

  const cardClasses = cn(baseCardStyles, variantStyles[variant], className);

  return (
    <article className={cardClasses}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={getAvatar(post.user.name, post.user.avatar_url)}
            alt={post.user.name}
            className="h-12 w-12 rounded-full border border-primary/30 object-cover shadow-subtle"
          />
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                {post.user.name}
              </span>
              <span className="h-1 w-1 rounded-full bg-muted/60" aria-hidden />
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {readTime} min o'qish
              </span>
              <span className="h-1 w-1 rounded-full bg-muted/60" aria-hidden />
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {views.toLocaleString('en-US')} marta ko'rildi
              </span>
            </div>
          </div>
        </div>
        {post.user.level && (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {post.user.level.name}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {post.category && (
          <Link
            href={`/posts?category=${post.category.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/10"
          >
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            {post.category.name}
          </Link>
        )}

        <Link href={`/posts/${post.slug}`} className="block">
          <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary-light">
            {post.title}
          </h3>
          {variant !== 'compact' && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
          )}
          {variant === 'compact' && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{excerpt}</p>
          )}
        </Link>

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.slug}
                href={`/posts?tag=${tag.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-muted/40 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
            )}
          </div>
        ) : null}

        {post.is_ai_suggested ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            AI tavsiya
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.answers_count} izoh
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {views.toLocaleString('en-US')} ko'rish
          </span>
        </div>
        <div className="flex items-center gap-3">
          <VoteButtons type="post" id={post.id} score={post.score} />
          <BookmarkButton postId={post.id} />
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10"
          >
            <ArrowUpRight className="h-4 w-4" />
            Ulashish
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PostCard(props: PostCardProps) {
  if (props.variant === 'skeleton') {
    return <SkeletonCard className={props.className} />;
  }

  const { post, variant = 'standard', className } = props;
  return <PostCardContent post={post} variant={variant} className={className} />;
}
