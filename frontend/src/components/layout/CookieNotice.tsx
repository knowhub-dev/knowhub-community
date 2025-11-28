'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'knowhub-cookie-consent';

type ConsentValue = 'accepted' | 'dismissed';

export default function CookieNotice() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = window.setTimeout(() => setOpen(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleConsent = (value: ConsentValue) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-border bg-[hsl(var(--card))]/95 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))]/15 text-[hsl(var(--secondary))]">
            <Cookie className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Cookie ogohlantirishi</p>
                <p className="text-sm text-muted-foreground">
                  Tajribani yaxshilash va xavfsizlikni ta'minlash uchun cookie fayllaridan foydalanamiz.
                  Davom etish orqali siz {" "}
                  <Link href="/privacy" className="font-semibold text-[hsl(var(--primary))] hover:underline">
                    maxfiylik siyosati
                  </Link>{' '}
                  shartlariga rozilik bildirasiz.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-[hsl(var(--foreground))]"
                onClick={() => handleConsent('dismissed')}
                aria-label="Eslatmani yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {showDetails && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-[hsl(var(--surface))]/80 px-4 py-3 text-xs text-muted-foreground">
                Tizim cookie'lari sessiya xavfsizligi va statistik ma'lumotlarni yig'ish uchun zarur. Ular orqali shaxsiy ma'lumot to'planmaydi va istalgan payt brauzer sozlamalaridan o'chirilishi mumkin.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" className="rounded-full px-5" onClick={() => handleConsent('accepted')}>
                Qabul qilaman
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full px-4"
                onClick={() => setShowDetails((prev) => !prev)}
              >
                {showDetails ? 'Yopish' : "Ko'proq ma'lumot"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
