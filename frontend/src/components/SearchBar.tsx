'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

interface SearchResult {
  posts?: any[];
  wiki?: any[];
  users?: any[];
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
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const isInverted = variant === 'inverted';

  // Search results
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (query.length < 2) return null;
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&limit=5`);
      return res.data as SearchResult;
    },
    enabled: query.length >= 2,
  });

  // Search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 1) {
        try {
          const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
          setSuggestions(res.data.suggestions);
        } catch (error) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close on outside click
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

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform ${
            isInverted ? 'text-white/60' : 'text-gray-400'
          }`}
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
          className={`w-full rounded-lg border pl-10 pr-10 py-2 focus:border-transparent focus:ring-2 ${
            isInverted
              ? 'border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-fuchsia-400'
              : 'border-gray-300 focus:ring-indigo-500'
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transform ${
              isInverted
                ? 'text-white/60 hover:text-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <div
          className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border shadow-lg ${
            isInverted
              ? 'border-white/10 bg-slate-950/90 text-white backdrop-blur'
              : 'border-gray-200 bg-white'
          }`}
        >
          {isLoading && (
            <div
              className={`p-4 text-center ${
                isInverted ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              <div
                className={`mx-auto h-6 w-6 animate-spin rounded-full border-b-2 ${
                  isInverted ? 'border-fuchsia-300' : 'border-indigo-600'
                }`}
              ></div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && query.length < 2 && (
            <div className="p-2">
              <div
                className={`px-2 py-1 text-xs font-medium ${
                  isInverted ? 'text-white/50' : 'text-gray-500'
                }`}
              >
                Tavsiyalar
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                    isInverted
                      ? 'text-white/80 hover:bg-white/10'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results && (
            <div className="p-2">
              {results.posts && results.posts.length > 0 && (
                <div className="mb-4">
                  <div
                    className={`px-2 py-1 text-xs font-medium ${
                      isInverted ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    Postlar
                  </div>
                  {results.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded px-3 py-2 transition ${
                        isInverted
                          ? 'text-white/80 hover:bg-white/10'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{post.title}</div>
                      <div
                        className={`text-xs ${
                          isInverted ? 'text-white/50' : 'text-gray-500'
                        }`}
                      >
                        {post.user.name} • {post.score} ↑
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.users && results.users.length > 0 && (
                <div className="mb-4">
                  <div
                    className={`px-2 py-1 text-xs font-medium ${
                      isInverted ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    Foydalanuvchilar
                  </div>
                  {results.users.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center rounded px-3 py-2 transition ${
                        isInverted
                          ? 'text-white/80 hover:bg-white/10'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div
                          className={`text-xs ${
                            isInverted ? 'text-white/50' : 'text-gray-500'
                          }`}
                        >
                          @{user.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.wiki && results.wiki.length > 0 && (
                <div>
                  <div
                    className={`px-2 py-1 text-xs font-medium ${
                      isInverted ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    Wiki
                  </div>
                  {results.wiki.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/wiki/${article.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded px-3 py-2 transition ${
                        isInverted
                          ? 'text-white/80 hover:bg-white/10'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{article.title}</div>
                      <div
                        className={`text-xs ${
                          isInverted ? 'text-white/50' : 'text-gray-500'
                        }`}
                      >
                        Wiki • Versiya {article.version}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.total === 0 && (
                <div
                  className={`p-4 text-center ${
                    isInverted ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
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