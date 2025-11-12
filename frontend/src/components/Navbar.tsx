'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Menu, X, User, LogOut, Plus, ChevronDown, Settings } from 'lucide-react';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { user, logout } = useAuth();

  // Profile dropdown ni tashqariga bosilganda yopish
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

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors ${
        isHome
          ? 'border-b border-white/10 bg-slate-950/60 shadow-none backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/30'
          : 'border-b border-gray-200 bg-white shadow-sm'
      }`}
    >
      <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
                isHome
                  ? 'bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/40'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              KH
            </div>
            <span
              className={`hidden text-xl font-bold sm:block ${
                isHome ? 'text-white' : 'text-gray-900'
              }`}
            >
              KnowHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/posts"
              className={`${
                isHome
                  ? 'font-medium text-white/70 transition-colors hover:text-white'
                  : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
              }`}
            >
              Postlar
            </Link>
            <Link
              href="/users"
              className={`${
                isHome
                  ? 'font-medium text-white/70 transition-colors hover:text-white'
                  : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
              }`}
            >
              Foydalanuvchilar
            </Link>
            <Link
              href="/wiki"
              className={`${
                isHome
                  ? 'font-medium text-white/70 transition-colors hover:text-white'
                  : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
              }`}
            >
              Wiki
            </Link>
            <Link
              href="/leaderboard"
              className={`${
                isHome
                  ? 'font-medium text-white/70 transition-colors hover:text-white'
                  : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
              }`}
            >
              Reyting
            </Link>
          </div>

          {/* Search Bar */}
          <SearchBar
            className="hidden md:flex flex-1 max-w-md mx-8"
            variant={isHome ? 'inverted' : 'default'}
          />

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationDropdown />
                <Link
                  href="/dashboard"
                  className={`${
                    isHome
                      ? 'font-medium text-white/70 transition-colors hover:text-white'
                      : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/posts/create"
                  className={`inline-flex items-center rounded-lg px-4 py-2 font-medium transition-colors ${
                    isHome
                      ? 'bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/30 hover:from-fuchsia-400 hover:via-indigo-500 hover:to-sky-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post yozish
                </Link>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={handleProfileToggle}
                    className={`flex items-center space-x-2 focus:outline-none ${
                      isHome
                        ? 'text-white/80 transition-colors hover:text-white'
                        : 'text-gray-700 transition-colors hover:text-indigo-600'
                    }`}
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileOpen && (
                    <div
                      className={`absolute right-0 z-50 mt-2 w-48 rounded-lg border shadow-lg ${
                        isHome
                          ? 'border-white/10 bg-slate-950/90 text-white backdrop-blur'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Link
                        href={`/profile/${user.username}`}
                        className={`flex items-center px-4 py-2 transition-colors ${
                          isHome
                            ? 'text-white/80 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Link>
                      <Link
                        href="/settings/profile"
                        className={`flex items-center px-4 py-2 transition-colors ${
                          isHome
                            ? 'text-white/80 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Sozlamalar
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-2 transition-colors ${
                          isHome
                            ? 'text-white/80 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Chiqish
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className={`${
                    isHome
                      ? 'font-medium text-white/80 transition-colors hover:text-white'
                      : 'font-medium text-gray-700 transition-colors hover:text-indigo-600'
                  }`}
                >
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  className={`rounded-lg px-4 py-2 transition-colors ${
                    isHome
                      ? 'bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/30 hover:from-fuchsia-400 hover:via-indigo-500 hover:to-sky-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-lg p-2 md:hidden ${
              isHome
                ? 'text-white/80 transition-colors hover:bg-white/10'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className={`md:hidden border-t py-4 ${
              isHome
                ? 'border-white/10 bg-slate-950/80 text-white backdrop-blur'
                : 'border-gray-200'
            }`}
          >
            <div className="space-y-4">
              {/* Mobile Search */}
              <SearchBar
                onClose={() => setIsOpen(false)}
                variant={isHome ? 'inverted' : 'default'}
              />

              {/* Mobile Links */}
              <div className="space-y-2">
                <Link
                  href="/posts"
                  className={`block rounded-lg px-3 py-2 ${
                    isHome
                      ? 'text-white/80 transition-colors hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Postlar
                </Link>
                <Link
                  href="/users"
                  className={`block rounded-lg px-3 py-2 ${
                    isHome
                      ? 'text-white/80 transition-colors hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Foydalanuvchilar
                </Link>
                <Link
                  href="/wiki"
                  className={`block rounded-lg px-3 py-2 ${
                    isHome
                      ? 'text-white/80 transition-colors hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Wiki
                </Link>
                <Link
                  href="/leaderboard"
                  className={`block rounded-lg px-3 py-2 ${
                    isHome
                      ? 'text-white/80 transition-colors hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Reyting
                </Link>
              </div>

              {/* Mobile Auth */}
              {user ? (
                <div
                  className={`space-y-2 border-t pt-4 ${
                    isHome ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <Link
                    href="/posts/create"
                    className={`flex items-center rounded-lg px-3 py-2 ${
                      isHome
                        ? 'bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/30'
                        : 'bg-indigo-600 text-white'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post yozish
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`block rounded-lg px-3 py-2 ${
                      isHome
                        ? 'text-white/80 transition-colors hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/profile/${user.username}`}
                    className={`flex items-center rounded-lg px-3 py-2 ${
                      isHome
                        ? 'text-white/80 transition-colors hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    {user.name}
                  </Link>
                  <Link
                    href="/settings/profile"
                    className={`flex items-center rounded-lg px-3 py-2 ${
                      isHome
                        ? 'text-white/80 transition-colors hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Sozlamalar
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 ${
                      isHome
                        ? 'text-white/80 transition-colors hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Chiqish
                  </button>
                </div>
              ) : (
                <div
                  className={`space-y-2 border-t pt-4 ${
                    isHome ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <Link
                    href="/auth/login"
                    className={`block rounded-lg px-3 py-2 ${
                      isHome
                        ? 'text-white/80 transition-colors hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/auth/register"
                    className={`block rounded-lg px-3 py-2 text-center ${
                      isHome
                        ? 'bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/30'
                        : 'bg-indigo-600 text-white'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
