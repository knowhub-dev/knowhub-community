'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import type { Post, User, WikiArticle } from '@/types';
import { cn } from '@/lib/utils';

type SearchPost = Pick<Post, 'id' | 'slug' | 'title' | 'score' | 'user'>;
type SearchUser = Pick<User, 'id' | 'name' | 'username' | 'avatar_url'>;
type SearchWikiArticle = Pick<WikiArticle, 'id' | 'slug' | 'title' | 'version'>;

interface SearchResult {
  posts?: SearchPost[];
  wiki?: SearchWikiArticle[];
  users?: SearchUser[];
  total: number;
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'inverted';
}

const SECTION_LABEL_CLASS = 'px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]';

export default function SearchBar({
  onClose,
  className = '',
  variant = 'default',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const isInverted = variant === 'inverted';

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (query.length < 2) return null;
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&limit=5`);
      return res.data as SearchResult;
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 1) {
        try {
          const res = await api.get<{ suggestions: string[] }>(
            `/search/suggestions?q=${encodeURIComponent(query)}`,
          );
          setSuggestions(res.data.suggestions);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const sectionLabelClass = cn(
    SECTION_LABEL_CLASS,
    isInverted ? 'text-white/70' : 'text-muted-foreground',
  );

  const resultRowClass = (extra?: string) =>
    cn(
      'rounded-xl px-3 py-2 text-sm transition',
      isInverted ? 'text-white/90 hover:bg-white/10' : 'text-foreground hover:bg-muted/50',
      extra,
    );

  return (
    <div ref={searchRef} className={cn('relative text-sm', className)}>
      <div className="relative">
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors',
            isInverted && 'text-white/70',
          )}
        />
        <input
          type="text"
          placeholder="Qidirish..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full rounded-2xl border px-10 py-2 text-sm shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2',
            isInverted
              ? 'border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:ring-[hsla(var(--primary),0.7)]'
              : 'border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus:ring-[hsla(var(--primary),0.65)]',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-xs transition',
              isInverted ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-3xl border shadow-2xl backdrop-blur-sm',
            isInverted
              ? 'border-white/10 bg-slate-950/90 text-white'
              : 'border-border bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-[0_20px_60px_rgba(15,23,42,0.15)]',
          )}
        >
          {isLoading && (
            <div className={cn('p-4 text-center text-sm', isInverted ? 'text-white/80' : 'text-muted-foreground')}>
              <div
                className={cn(
                  'mx-auto h-6 w-6 animate-spin rounded-full border-b-2',
                  isInverted ? 'border-white/80' : 'border-[hsl(var(--primary))]'
                )}
              />
            </div>
          )}

          {suggestions.length > 0 && query.length < 2 && (
            <div className="p-2">
              <div className={sectionLabelClass}>Tavsiyalar</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSearch(suggestion)}
                  className={resultRowClass()}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {results && (
            <div className="space-y-3 p-2">
              {results.posts && results.posts.length > 0 && (
                <div className="space-y-1">
                  <div className={sectionLabelClass}>Postlar</div>
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={resultRowClass()}
                    >
                      <div className="font-medium">{post.title}</div>
                      <div className={cn('text-xs', isInverted ? 'text-white/70' : 'text-muted-foreground')}>
                        {post.user.name} • {post.score} ↑
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.users && results.users.length > 0 && (
                <div className="space-y-1">
                  <div className={sectionLabelClass}>Foydalanuvchilar</div>
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      onClick={() => setIsOpen(false)}
                      className={resultRowClass('flex items-center gap-3')}
                    >
                      <Image
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className={cn('text-xs', isInverted ? 'text-white/70' : 'text-muted-foreground')}>
                          @{user.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.wiki && results.wiki.length > 0 && (
                <div className="space-y-1">
                  <div className={sectionLabelClass}>Wiki</div>
                  {results.wiki.map((article) => (
                    <Link
                      key={article.id}
                      href={`/wiki/${article.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={resultRowClass()}
                    >
                      <div className="font-medium">{article.title}</div>
                      <div className={cn('text-xs', isInverted ? 'text-white/70' : 'text-muted-foreground')}>
                        Wiki • Versiya {article.version}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.total === 0 && (
                <div className={cn('px-3 py-4 text-center text-sm', isInverted ? 'text-white/70' : 'text-muted-foreground')}>
                  Hech narsa topilmadi
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
