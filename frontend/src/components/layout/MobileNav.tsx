"use client";

import Link from "next/link";
import { Crown, Menu, PenTool, LogIn, LogOut, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isProUser } from "@/lib/user";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileNavProps {
  navLinks: NavLink[];
  user?: { name?: string | null; username?: string | null; avatar_url?: string | null } | null;
  onLogout?: () => void;
}

export default function MobileNav({ navLinks, user, onLogout }: MobileNavProps) {
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? user?.username?.charAt(0)?.toUpperCase() ?? "?";
  const isPro = isProUser(user as any);
  const avatarRing = isPro
    ? 'ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.4)] border border-yellow-200/60'
    : 'border border-border/70';
  const nameClasses = cn(
    'text-sm font-semibold text-[hsl(var(--foreground))]',
    isPro && 'bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(251,191,36,0.35)]',
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-[hsl(var(--surface))] p-2 text-[hsl(var(--foreground))] shadow-sm hover:border-[hsl(var(--primary))] md:hidden"
          aria-label="Mobil menyuni ochish"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[85vw] max-w-sm border-border/70">
        <SheetHeader className="items-start text-left">
          <SheetTitle className="text-xl font-bold text-[hsl(var(--foreground))]">KnowHub</SheetTitle>
          <p className="text-sm text-muted-foreground">Bilim almashish hamjamiyati</p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-[hsl(var(--surface))] p-3">
            {user ? (
              user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.name ?? "Foydalanuvchi"}
                  className={cn('h-12 w-12 rounded-full object-cover', avatarRing)}
                />
              ) : (
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--foreground))]',
                    avatarRing,
                  )}
                >
                  {userInitial}
                </span>
              )
            ) : (
              <Skeleton className="h-12 w-12 rounded-full" />
            )}
            <div className="space-y-1">
              <p className={nameClasses}>{user?.name ?? "Mehmon"}</p>
              <p className="text-xs text-muted-foreground">{user?.username ? `@${user.username}` : "Tizimga kirmagansiz"}</p>
              {isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-300/70">
                  <Crown className="h-3.5 w-3.5" /> Pro a'zo
                </span>
              )}
            </div>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]"
                >
                  <link.icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="space-y-2">
            {user ? (
              <>
                <SheetClose asChild>
                  <Link
                    href="/posts/create"
                    className="flex items-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm hover:brightness-110"
                  >
                    <PenTool className="h-4 w-4" />
                    Yozish
                  </Link>
                </SheetClose>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--surface))]"
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <SheetClose asChild>
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border/70 px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                  >
                    <LogIn className="h-4 w-4" />
                    Kirish
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:brightness-110"
                  >
                    <UserPlus className="h-4 w-4" />
                    Ro'yxatdan o'tish
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
