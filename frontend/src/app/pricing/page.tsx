'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import type { Plan } from '@/types/plan';
import { Button } from '@/components/ui/button';

interface PlansResponse {
  plans: Plan[];
}

const badgeByPlan: Record<string, string> = {
  free: 'Boshlovchilar',
  pro: 'Tezkor ishga tushirish',
  legend: 'Jamoalar uchun',
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api
      .get<PlansResponse>('/plans')
      .then(res => setPlans(res.data.plans))
      .catch(err => {
        console.error('Failed to load plans', err);
      });
  }, []);

  const highlightPlan = plans.find(p => p.highlight) ?? plans.find(p => p.id === 'pro');

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-6xl px-4 py-14 space-y-10">
        <header className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-10 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Narxlar va rejalar
              </div>
              <h1 className="text-4xl font-bold leading-tight">O‘sish sur’atingizga mos rejani tanlang</h1>
              <p className="max-w-2xl text-sm text-white/80">
                Bepul boshlang, resurslarga to‘yingan Pro va Legend rejalar bilan mini-serverlar, code execution va yuklash limitlarini kengaytiring.
              </p>
            </div>
            {highlightPlan && (
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Tavsiya etiladi</p>
                <p className="text-lg font-semibold">{highlightPlan.name}</p>
                <p className="text-white/80">Oyiga {formatPrice(highlightPlan.price_monthly, highlightPlan.currency)}</p>
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map(plan => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border border-border/70 bg-[hsl(var(--card))] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.highlight ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                    {badgeByPlan[plan.id] ?? 'Reja'}
                  </p>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <span className="rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-xs text-muted-foreground">
                  {plan.id === 'free' ? 'Bepul' : 'Moslashuvchan'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[hsl(var(--foreground))]">
                  {plan.id === 'free' ? '0' : formatPrice(plan.price_monthly, plan.currency)}
                </span>
                <span className="text-sm text-muted-foreground">/ oy</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.price_yearly > 0 ? `${formatPrice(plan.price_yearly, plan.currency)} / yil` : 'Yillik to‘lov shart emas'}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link href="/auth/register" className="inline-flex w-full">
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlight ? 'default' : 'secondary'}
                  >
                    {plan.id === 'free' ? 'Bepul boshlash' : `${plan.name}ga o‘tish`}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border/70 bg-[hsl(var(--card))] p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Nega pro?</p>
              <h2 className="text-2xl font-bold">Kengaytirilgan kvotalar va ustuvorlik</h2>
              <p className="text-sm text-muted-foreground">
                Pro va Legend rejalarida ko‘proq mini-server slotlari, yuqori timeout, katta yuklash kvotasi va ustuvor navbat.
              </p>
            </div>
            <Link href="/auth/register">
              <Button variant="outline" className="gap-2">
                Tarifni tanlash <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatPrice(value: number, currency: string) {
  if (!value) return '0';
  const formatted = new Intl.NumberFormat('uz-UZ').format(value);
  return `${formatted} ${currency}`;
}
