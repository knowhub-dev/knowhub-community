'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
}: PageWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative min-h-screen bg-background text-foreground">
      <div
        className={cn(
          'container flex flex-col gap-8 pt-8 pb-12 transition-opacity duration-300 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0',
          className,
        )}
      >
        {(title || description || actions) && (
          <header
            className={cn(
              'flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface/90 p-6 shadow-subtle backdrop-blur-md md:flex-row md:items-center md:justify-between',
              headerClassName,
            )}
          >
            <div className="max-w-3xl space-y-2">
              {title && <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>}
              {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
            </div>
            {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
          </header>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}
