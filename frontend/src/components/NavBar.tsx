"use client";

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import {
  Home,
  BookOpen,
  Users,
  Tag,
  Search,
  PenTool,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  Award,
  Shield,
  Crown,
} from 'lucide-react';
import MobileNav from './MobileNav';
import { cn } from '@/lib/utils';
import { isProUser } from '@/lib/user';

export default function NavBar() {
  const { user, logout } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? user?.username?.charAt(0)?.toUpperCase() ?? "?";
  const isPro = isProUser(user);
  const avatarRing = isPro
    ? 'ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.45)] border border-yellow-200/60'
    : 'border border-border';
  const proNameClasses = cn(
    'font-medium text-[hsl(var(--foreground))]',
    isPro && 'bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(251,191,36,0.35)]',
  );

  const navLinks = [
    { href: '/', label: 'Bosh sahifa', icon: Home },
    { href: '/posts', label: 'Maqolalar', icon: BookOpen },
    { href: '/users', label: 'Foydalanuvchilar', icon: Users },
    { href: '/tags', label: 'Teglar', icon: Tag },
  ];

  const navLinks = [
    { href: '/', label: 'Bosh sahifa', icon: Home },
    { href: '/posts', label: 'Maqolalar', icon: BookOpen },
    { href: '/users', label: 'Foydalanuvchilar', icon: Users },
    { href: '/tags', label: 'Teglar', icon: Tag },
  ];

  return (
    <nav className="bg-[hsl(var(--background))] border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <MobileNav navLinks={navLinks} user={user} onLogout={logout} />
              </div>

              {/* Logo */}
              <Link href="/" className="text-2xl font-bold text-[hsl(var(--primary))]">
                KnowHub
              </Link>
            </div>

            {/* Main navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right navigation */}
          <div className="flex items-center">
            <button
              className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              aria-label="Sayt bo'ylab qidirish"
              type="button"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  href="/posts/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Yozish
                </Link>

                <div className="relative group">
                  <button
                    className="flex items-center space-x-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    type="button"
                    aria-label="Profil menyusi"
                  >
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className={cn(
                          'h-8 w-8 rounded-full bg-[hsl(var(--surface))] object-cover',
                          avatarRing,
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--foreground))]',
                          avatarRing,
                        )}
                      >
                        {userInitial}
                      </span>
                    )}
                  </button>

                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-border/70 bg-[hsl(var(--popover))] shadow-lg ring-1 ring-[hsl(var(--primary))]/15 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-[hsl(var(--foreground))] border-b border-border/70 bg-[hsl(var(--surface))]">
                      <p className={proNameClasses}>{user.name}</p>
                      <p className="text-[hsl(var(--muted-foreground))]">@{user.username}</p>
                      {isPro && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-300/70">
                          <Crown className="h-3.5 w-3.5" /> Pro a'zo
                        </span>
                      )}
                      <div className="flex items-center mt-1 text-[hsl(var(--foreground))]">
                        <Award className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>{user.xp} XP</span>
                        {user.is_verified && (
                          <Shield className="w-4 h-4 text-[hsl(var(--primary))] ml-2" />
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/profile/${user.username}`}
                      className="block px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Sozlamalar
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--surface))]"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Chiqish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-[hsl(var(--foreground))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))]"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
