'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import SearchBar from "./SearchBar";
import NotificationDropdown from "./NotificationDropdown";
import { NavLink } from "./NavLink";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type BrandingLogo = {
  url: string;
  path?: string;
};

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [branding, setBranding] = useState<{ light?: BrandingLogo | null; dark?: BrandingLogo | null }>({});
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuVariant, setMobileMenuVariant] = useState<'left' | 'bottom'>('left');

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

  const navLinks = useMemo<NavItem[]>(
    () => [
      { href: '/posts', label: 'Blog' },
      { href: '/wiki', label: 'Wiki' },
      { href: '/containers', label: 'Mini-serverlar' },
      { href: '/leaderboard', label: 'Liderlar' },
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

  useEffect(() => {
    const updateVariant = () => {
      if (typeof window === 'undefined') return;
      setMobileMenuVariant(window.innerWidth < 480 ? 'bottom' : 'left');
    };

    updateVariant();
    window.addEventListener('resize', updateVariant);
    return () => window.removeEventListener('resize', updateVariant);
  }, []);

  const renderDesktopAuth = () => {
    if (user) {
      return (
        <div className="flex items-center gap-3">
          <Link
            href="/posts/create"
            className="hidden rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-4 py-2 text-sm font-semibold text-white shadow-neon transition hover:-translate-y-0.5 lg:flex lg:items-center lg:gap-2"
          >
            <Plus className="h-4 w-4" />
            Yangi post
          </Link>
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface))]/80 px-2 py-1 text-sm text-foreground transition hover:border-[hsl(var(--primary))]"
            >
              <img
                src={user.avatar_url ?? '/default-avatar.png'}
                alt={user.name}
                className="h-9 w-9 rounded-full border border-border/70 object-cover"
              />
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-border/70 bg-[hsl(var(--card))]/95 shadow-xl backdrop-blur">
                <div className="border-b border-border/60 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex flex-col gap-1 p-2 text-sm text-muted-foreground">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[hsl(var(--surface))]/70 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[hsl(var(--surface))]/70 hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Sozlamalar
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
        >
          Kirish
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-4 py-2 text-sm font-semibold text-white shadow-neon transition-transform hover:-translate-y-0.5"
        >
          <User className="h-4 w-4" />
          Ro'yxatdan o'tish
        </Link>
      </div>
    );
  };

  const renderMobileAuth = () => {
    if (user) {
      return (
        <Link
          href={`/profile/${user.username}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-[hsl(var(--surface))]/70"
        >
          <img src={user.avatar_url ?? '/default-avatar.png'} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        </Link>
      );
    }

    return (
      <>
        <Link
          href="/auth/login"
          className="hidden rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] sm:inline-flex"
        >
          Kirish
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-semibold text-white"
        >
          <User className="h-3.5 w-3.5" />
          Ro'yxatdan o'tish
        </Link>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-[hsl(var(--background))]/80 shadow-[0_6px_30px_-10px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container flex h-20 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            {activeLogo ? (
              <img src={activeLogo.url} alt="KnowHub logo" className="h-12 w-auto" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary text-xl font-semibold text-white shadow-neon">
                KH
              </div>
            )}
            <div className="hidden flex-col leading-tight md:flex">
              <span className="text-[1.65rem] font-bold tracking-tight text-foreground">KnowHub</span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">community</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 p-1 shadow-inner md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
          <SearchBar className="w-full max-w-md" variant={isDark ? 'inverted' : 'default'} />
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 px-2.5 py-1.5 shadow-inner">
            <NotificationDropdown />
            <span className="h-6 w-px bg-[hsl(var(--border))]/60" />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              aria-label="Mavzuni almashtirish"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          {renderDesktopAuth()}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
          <SearchBar className="hidden w-full max-w-xs sm:block" variant={isDark ? 'inverted' : 'default'} />
          <NotificationDropdown />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 text-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            aria-label="Mavzuni almashtirish"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {renderMobileAuth()}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-[hsl(var(--surface))]/70 text-foreground transition hover:border-[hsl(var(--primary))]"
                aria-label="Navigatsiyani ochish"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </SheetTrigger>

            <SheetContent
              side={mobileMenuVariant}
              className={cn(
                "w-[92vw] max-w-sm border-border/60 bg-[hsl(var(--background))]/85 shadow-2xl backdrop-blur-xl sm:max-w-md",
                mobileMenuVariant === 'bottom' && 'rounded-t-3xl pb-10 pt-6',
              )}
            >
              <SheetHeader className="items-start text-left">
                <SheetTitle className="text-xl font-bold text-[hsl(var(--foreground))]">Navigatsiya</SheetTitle>
                <p className="text-sm text-muted-foreground">Menyuga va asosiy amallarga tezkor ulanish</p>
              </SheetHeader>

              {mobileMenuVariant === 'bottom' && <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-border" />}

              <div className="mt-6 space-y-5">
                <SearchBar variant={isDark ? 'inverted' : 'default'} />
                <div className="grid gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <NavLink
                        {...link}
                        variant="list"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      />
                    </SheetClose>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-[hsl(var(--surface))]/70 px-4 py-3 shadow-inner">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mavzu</p>
                    <p className="text-xs text-muted-foreground">Yorqin / Tungi rejim</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-[hsl(var(--background))]/80 text-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                    aria-label="Mavzuni almashtirish"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-[hsl(var(--surface))]/70 px-4 py-3 shadow-inner">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-[hsl(var(--background))]/80 text-foreground">
                      {user ? <NotificationDropdown /> : <Sun className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Bildirishnomalar</p>
                      <p className="text-xs text-muted-foreground">So'nggi yangiliklardan xabardor bo'ling</p>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-4 py-2 text-xs font-semibold text-white shadow-neon"
                    >
                      Yopish
                    </button>
                  </SheetClose>
                </div>

                <div className="flex flex-col gap-3">
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/posts/create"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-4 py-3 text-sm font-semibold text-white shadow-neon"
                        >
                          <Plus className="h-4 w-4" />
                          Yangi post
                        </Link>
                      </SheetClose>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          logout();
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 px-4 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-200"
                      >
                        <LogOut className="h-4 w-4" />
                        Chiqish
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="rounded-full border border-border/60 px-4 py-2 text-center text-sm font-medium text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-foreground"
                        >
                          Kirish
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-4 py-2 text-sm font-semibold text-white shadow-neon"
                        >
                          <User className="h-4 w-4" />
                          Ro'yxatdan o'tish
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
