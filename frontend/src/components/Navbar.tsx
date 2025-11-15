'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  LogOut,
  Plus,
  ChevronDown,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type BrandingLogo = {
  url: string;
  path?: string;
};

interface NavLink {
  href: string;
  label: string;
  exact?: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [branding, setBranding] = useState<{ light?: BrandingLogo | null; dark?: BrandingLogo | null }>({});
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await api.get('/settings/logo');
        if (!active) return;
        setBranding({
          light: response.data?.light ?? null,
          dark: response.data?.dark ?? null,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Logo fetch failed', error);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const navLinks = useMemo<NavLink[]>(
    () => [
      { href: '/posts', label: 'Postlar' },
      { href: '/wiki', label: 'Wiki' },
      { href: '/containers', label: 'Mini-serverlar' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
    [],
  );

  const activeLogo = useMemo(() => {
    const selected = isDark ? branding.dark ?? branding.light : branding.light ?? branding.dark;
    return selected ?? null;
  }, [branding.dark, branding.light, isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderNavLink = (link: NavLink) => {
    const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          'relative inline-flex items-center text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground',
          isActive && 'text-foreground',
        )}
      >
        <span className="px-1 py-1">
          {link.label}
          <span
            className={cn(
              'pointer-events-none absolute inset-x-1 bottom-0 h-0.5 origin-center rounded-full bg-gradient-to-r from-primary/70 via-secondary/60 to-primary/70 transition-opacity duration-300',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
        </span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="relative border-b border-white/5 bg-surface/80 shadow-subtle backdrop-blur-md">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-primary/45 via-secondary/35 to-primary/45 opacity-70 blur-md" />
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              {activeLogo ? (
                <img src={activeLogo.url} alt="KnowHub logo" className="h-9 w-auto" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary-light to-secondary text-sm font-semibold text-white shadow-neon">
                  KH
                </div>
              )}
              <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:block">KnowHub</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">{navLinks.map(renderNavLink)}</div>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-5 md:flex">
            <SearchBar
              className="w-full max-w-md"
              variant={isDark ? 'inverted' : 'default'}
            />
            <NotificationDropdown />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:border-primary/40 hover:text-primary"
              aria-label="Mavzuni almashtirish"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-neon transition-transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  Yangi post
                </Link>
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-foreground transition hover:border-primary/40"
                  >
                    <img
                      src={user.avatar_url ?? '/default-avatar.png'}
                      alt={user.name}
                      className="h-9 w-9 rounded-full border border-white/10 object-cover"
                    />
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-lg border border-white/10 bg-surface/95 shadow-subtle backdrop-blur">
                      <div className="border-b border-white/5 px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="flex flex-col gap-1 p-2 text-sm text-muted-foreground">
                        <Link
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-foreground"
                        >
                          <User className="h-4 w-4" />
                          Profil
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                          Sozlamalar
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                        >
                          <LogOut className="h-4 w-4" />
                          Chiqish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-neon transition-transform hover:-translate-y-0.5"
                >
                  <User className="h-4 w-4" />
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:border-primary/40 hover:text-primary"
              aria-label="Mavzuni almashtirish"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:border-primary/40"
              aria-label="Navigatsiyani ochish"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-b border-white/5 bg-surface/95 shadow-subtle backdrop-blur-md md:hidden">
          <div className="space-y-6 px-6 pb-6 pt-4">
            <SearchBar variant={isDark ? 'inverted' : 'default'} />
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-xl border border-white/5 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground',
                      isActive && 'border-primary/40 bg-primary/10 text-foreground',
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <NotificationDropdown />
              {user ? (
                <Link
                  href="/posts/new"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-neon"
                >
                  <Plus className="h-4 w-4" />
                  Yangi post
                </Link>
              ) : (
                <div className="flex flex-1 flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/10 px-4 py-2 text-center text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-neon"
                  >
                    <User className="h-4 w-4" />
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
