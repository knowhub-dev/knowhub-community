'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  footer?: React.ReactNode;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

export default function Sidebar({
  items,
  footer,
  defaultCollapsed = false,
  onCollapseChange,
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();

  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, [collapsed, onCollapseChange]);

  return (
    <aside
      className={cn(
        'relative flex h-full w-64 flex-col rounded-2xl border border-border/70 bg-surface/95 p-4 shadow-subtle backdrop-blur-lg transition-[width] duration-300 ease-out',
        collapsed && 'w-20 p-3',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground shadow-subtle transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
        aria-label={collapsed ? 'Sidebarni kengaytirish' : 'Sidebarni yigish'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <nav className="mt-2 flex flex-1 flex-col gap-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200',
                'hover:text-foreground',
                collapsed && 'justify-center gap-0 px-0 py-2.5',
                isActive && 'text-foreground',
                !isActive &&
                  !collapsed &&
                  'after:absolute after:inset-y-2 after:-left-1 after:w-1 after:rounded-full after:bg-primary/50 after:opacity-0 after:transition-opacity group-hover:after:opacity-60',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-surface/85 text-foreground transition-all duration-200 group-hover:border-primary/50 group-hover:text-primary',
                  isActive && 'border-transparent bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 text-white shadow-primary/20',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between truncate">
                  <span>{item.label}</span>
                  {typeof item.badge !== 'undefined' && (
                    <span className="ml-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-light">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {footer && (
        <div className={cn('mt-6 border-t border-border/70 pt-4', collapsed && 'hidden')}>{footer}</div>
      )}
    </aside>
  );
}
