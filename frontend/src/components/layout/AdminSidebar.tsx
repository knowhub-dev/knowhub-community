'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type LucideIcon } from 'lucide-react';

export interface AdminSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface AdminSidebarProps {
  items: AdminSidebarItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function AdminSidebar({ items, active, onSelect }: AdminSidebarProps) {
  return (
    <nav className="sticky top-24 hidden h-fit rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-4 shadow-sm lg:block">
      <div className="space-y-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={active === item.id ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            className={cn('justify-start gap-3', active === item.id && 'shadow-neon')}
            onClick={() => onSelect(item.id)}
          >
            <item.icon className="h-5 w-5" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold">{item.label}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">{item.description}</span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </nav>
  );
}
