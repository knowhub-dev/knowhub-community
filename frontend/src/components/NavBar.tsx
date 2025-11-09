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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                KnowHub
              </Link>
            </div>

            {/* Main navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-gray-900">
                <Home className="w-4 h-4 mr-2" />
                Bosh sahifa
              </Link>
              <Link href="/posts" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                <BookOpen className="w-4 h-4 mr-2" />
                Maqolalar
              </Link>
              <Link href="/users" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                <Users className="w-4 h-4 mr-2" />
                Foydalanuvchilar
              </Link>
              <Link href="/tags" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
                <Tag className="w-4 h-4 mr-2" />
                Teglar
              </Link>
            </div>
          </div>

          {/* Right navigation */}
          <div className="flex items-center">
            <button className="p-2 text-gray-500 hover:text-gray-900">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="ml-4 flex items-center space-x-4">
                <Link href="/posts/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  <PenTool className="w-4 h-4 mr-2" />
                  Yozish
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-900">
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500">@{user.username}</p>
                      <div className="flex items-center mt-1">
                        <Award className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>{user.xp} XP</span>
                        {user.is_verified && (
                          <Shield className="w-4 h-4 text-blue-500 ml-2" />
                        )}
                      </div>
                    </div>
                    <Link href={`/profile/${user.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4 inline mr-2" />
                      Profil
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Sozlamalar
                    </Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Chiqish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-4">
                <Link href="/login" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <LogIn className="w-4 h-4 mr-2" />
                  Kirish
                </Link>
                <Link href="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
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