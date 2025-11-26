import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-white/40 p-6 text-center shadow-sm',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {action ? (
        <Button asChild className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
