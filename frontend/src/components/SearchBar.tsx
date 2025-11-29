'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Post, User, WikiArticle } from '@/types';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';

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

export default function SearchBar({
  onClose,
  className = '',
  variant = 'default',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (query.length >= 1) {
        try {
          const res = await api.get<{ suggestions: string[] }>(
            `/search/suggestions?q=${encodeURIComponent(query)}`,
            { signal: controller.signal },
          );
          setSuggestions(res.data.suggestions);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [query]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
    router.push(href);
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
    }
  };

  return (
    <div className={cn('relative text-sm', className)}>
      <div className="relative">
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors',
            isInverted && 'text-white/70',
          )}
        />
        <Input
          placeholder="Qidirish..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          className={cn(
            'h-11 rounded-2xl pl-10 text-sm shadow-sm',
            isInverted
              ? 'border-white/25 bg-white/10 text-white placeholder:text-white/70 focus-visible:ring-[hsla(var(--primary),0.65)] focus-visible:ring-offset-0'
              : 'border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus-visible:ring-[hsla(var(--primary),0.65)]',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-muted',
              isInverted
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <CommandDialog open={isOpen} onOpenChange={handleDialogChange}>
        <Command className="border-border/70 bg-background text-foreground">
          <CommandInput
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tezkor qidiruv..."
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Natijalar yuklanmoqda...
              </div>
            )}

            {suggestions.length > 0 && query.length < 2 && (
              <CommandGroup heading="Tavsiyalar">
                {suggestions.map((suggestion) => (
                  <CommandItem key={suggestion} onClick={() => setQuery(suggestion)}>
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results && (
              <div className="space-y-2">
                {results.posts && results.posts.length > 0 && (
                  <CommandGroup heading="Postlar">
                    {results.posts.map((post) => (
                      <CommandItem key={post.id} onClick={() => handleNavigate(`/posts/${post.slug}`)}>
                        <div className="space-y-1">
                          <div className="font-medium leading-tight">{post.title}</div>
                          <div className={cn('text-xs text-muted-foreground', isInverted && 'text-white/70')}>
                            {post.user.name} • {post.score} ↑
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.users && results.users.length > 0 && (
                  <CommandGroup heading="Foydalanuvchilar">
                    {results.users.map((user) => (
                      <CommandItem
                        key={user.id}
                        onClick={() => handleNavigate(`/profile/${user.username}`)}
                        className="items-center"
                      >
                        <Image
                          src={
                            user.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                          }
                          alt={user.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium leading-tight">{user.name}</div>
                          <div className={cn('text-xs text-muted-foreground', isInverted && 'text-white/70')}>
                            @{user.username}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.total === 0 && query.length >= 2 && !isLoading && (
                  <CommandEmpty>Hech narsa topilmadi</CommandEmpty>
                )}
              </div>
            )}

            {!results && !isLoading && query.length >= 2 && (
              <CommandEmpty>Natijalar topilmadi</CommandEmpty>
            )}

            {!isLoading && query.length < 2 && suggestions.length === 0 && (
              <CommandEmpty>Qidirishni boshlang</CommandEmpty>
            )}

            <CommandSeparator />
            <div className="px-4 py-2 text-[0.7rem] text-muted-foreground sm:hidden">
              {"Mobil qurilmalarda qidiruv oynasi to‘liq ekran shaklida ochiladi."}
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
