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
  Shield
} from 'lucide-react';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[hsl(var(--background))] border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-[hsl(var(--primary))]">
                KnowHub
              </Link>
            </div>

            {/* Main navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-[hsl(var(--foreground))]">
                <Home className="w-4 h-4 mr-2" />
                Bosh sahifa
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center px-1 pt-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Maqolalar
              </Link>
              <Link
                href="/users"
                className="inline-flex items-center px-1 pt-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <Users className="w-4 h-4 mr-2" />
                Foydalanuvchilar
              </Link>
              <Link
                href="/tags"
                className="inline-flex items-center px-1 pt-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <Tag className="w-4 h-4 mr-2" />
                Teglar
              </Link>
            </div>
          </div>

          {/* Right navigation */}
          <div className="flex items-center">
            <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  href="/posts/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Yozish
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[hsl(var(--popover))] ring-1 ring-[hsl(var(--primary))]/15 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-[hsl(var(--foreground))] border-b border-border bg-[hsl(var(--surface))]">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-[hsl(var(--muted-foreground))]">@{user.username}</p>
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
