'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as LinkIcon, ListTree, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';
import { extractHeadings, highlightCode, slugifyHeading } from '@/lib/markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const getNodeText = (node: any): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (node?.props?.children) return getNodeText(node.props.children);
  return '';
};

const Heading = ({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}) => {
  const id = slugifyHeading(getNodeText(children));
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag id={id} className="group relative scroll-mt-28 text-foreground">
      <a
        href={`#${id}`}
        className="absolute -left-6 hidden h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition hover:bg-primary/20 group-hover:opacity-100 lg:flex"
        aria-label="Jump to section"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </a>
      {children}
    </Tag>
  );
};

function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');
  const headings = useMemo(() => extractHeadings(content), [content]);

  useEffect(() => {
    const handleScroll = () => {
      const element = contentRef.current;
      if (!element) return;

      const articleTop = element.offsetTop;
      const articleHeight = element.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const distance = scrollY - articleTop;
      const total = articleHeight - viewportHeight;

      const ratio = Math.min(1, Math.max(0, total > 0 ? distance / total : 0));
      setProgress(Math.round(ratio * 100));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [content]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const headingElements = Array.from(element.querySelectorAll('h1, h2, h3, h4')) as HTMLElement[];
    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);

        if (visible[0]?.target) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: [0, 1],
      },
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [content]);

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--card))]/85 p-6 shadow-[0_18px_70px_-45px_rgba(15,23,42,0.5)] lg:p-8', className)}>
      <div className="pointer-events-none fixed inset-x-0 top-[76px] z-30 hidden h-1 bg-transparent lg:block">
        <div className="mx-auto h-full w-full max-w-6xl overflow-hidden rounded-full bg-border/60 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
            aria-label="Reading progress"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-primary/4 via-transparent to-secondary/6" aria-hidden />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
        <article
          ref={contentRef}
          className="markdown-article prose max-w-none prose-headings:mb-4 prose-headings:mt-6 prose-headings:font-semibold prose-p:leading-relaxed prose-strong:text-foreground"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <Heading level={1} {...props} />,
              h2: (props) => <Heading level={2} {...props} />,
              h3: (props) => <Heading level={3} {...props} />,
              h4: (props) => <Heading level={4} {...props} />,
              h5: (props) => <Heading level={5} {...props} />,
              h6: (props) => <Heading level={6} {...props} />,
              code({ inline, className, children, ...props }) {
                const language = className?.replace('language-', '') ?? 'text';
                const codeValue = String(children).replace(/\n$/, '');

                if (inline) {
                  return (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                }

                const highlighted = highlightCode(codeValue, language);

                return (
                  <pre className={cn('relative rounded-2xl border border-border/70 bg-[hsl(var(--surface-2))]/80 shadow-[0_16px_42px_-30px_rgba(15,23,42,0.65)]', className)}>
                    <div className="absolute inset-x-0 top-0 h-9 rounded-t-2xl bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/15" aria-hidden />
                    <code
                      className={cn('block overflow-x-auto px-4 pb-5 pt-12 text-sm leading-relaxed text-foreground', className)}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                      {...props}
                    />
                  </pre>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-border/70 bg-[hsl(var(--surface))]/75 p-5 shadow-inner">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <ListTree className="h-4 w-4" />
                Mavzular jadvali
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {headings.map((heading) => (
                  <a
                    key={`${heading.id}-${heading.level}`}
                    href={`#${heading.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition-colors duration-200',
                      activeId === heading.id
                        ? 'border-primary/40 bg-primary/10 text-foreground shadow-sm'
                        : 'hover:border-border/70 hover:bg-white/5',
                    )}
                    style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
                  >
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">H{heading.level}</span>
                    <span className="line-clamp-2 text-foreground/90">{heading.text}</span>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary">
                <Sparkles className="h-3.5 w-3.5" />
                Kod bloklari Prism-ruhli yoritilgan
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default MarkdownRenderer;
