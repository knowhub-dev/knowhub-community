import type { ComponentType } from 'react';

import Link from 'next/link';
import { BookOpenCheck, PenSquare, Rocket, Sparkles } from 'lucide-react';

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

const ACTIONS: QuickAction[] = [
  {
    title: "Savol bering",
    description: "Ekspertlar va hamjamiyatdan tezkor javob oling.",
    href: "/posts/create",
    icon: PenSquare,
    accent: "from-primary/20 to-primary/5",
  },
  {
    title: "Bilimlar bazasini ko'rish",
    description: "Wiki va qo'llanmalar: eng yaxshi tajriba va andozalar.",
    href: "/wiki",
    icon: BookOpenCheck,
    accent: "from-accent/20 to-accent/5",
  },
  {
    title: "Aurora tezkor start",
    description: "Premium Variant C dizayni bilan yangi loyihani boshlang.",
    href: "/changelog",
    icon: Rocket,
    accent: "from-secondary/20 to-secondary/5",
  },
];

export function QuickActions() {
  return (
    <section className="h-full rounded-3xl border border-border/60 bg-surface-1/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" />
        Tezkor amallar
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Eng ko'p ishlatiladigan yo'llar: post yaratish, hamjamiyat resurslari va yangi imkoniyatlar.
      </p>
      <div className="mt-5 space-y-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-surface-1/90 p-4 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.accent}`} aria-hidden />
            <div className="relative flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
