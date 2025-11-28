import Link from "next/link";

import type { SolveraPromoProps } from "@/components/home/sections/types";
import { SolveraChatCard } from "@/components/SolveraChatCard";
import { ArrowRight, Sparkles } from "lucide-react";

export function SolveraPromo(_: SolveraPromoProps) {
  return (
    <section className="max-w-6xl px-6 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4 rounded-[var(--radius-md)] border border-border bg-[hsl(var(--card))]/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))/40] bg-[hsl(var(--primary))/10] px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[hsl(var(--primary))]">
            SolVera
            <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))]">Beta</span>
          </div>
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] sm:text-3xl">Postlarni SolVera bilan jilolang</h2>
          <p className="text-sm text-muted-foreground">
            KnowHub jamoasining AI modeli yozganlaringizni silliqlaydi, CTAlarni boyitadi va kod sharhlarini tezkor taklif qiladi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-border/80 bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--card))] p-4 text-sm shadow-sm">
              <p className="font-semibold text-[hsl(var(--foreground))]">Yozish va qayta yozish</p>
              <p className="text-xs text-[hsl(var(--foreground))]/80">Sarlavha, muammo bayoni va changelogni SolVera bilan tayyorlang.</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/80 bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--card))] p-4 text-sm shadow-sm">
              <p className="font-semibold text-[hsl(var(--foreground))]">Kod uchun chaqmoq sharhlar</p>
              <p className="text-xs text-[hsl(var(--foreground))]/80">Snippetlaringizni tushuntirish yoki refaktor g'oyalarini olish.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/solvera"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary))/25] transition hover:brightness-110"
            >
              SolVera haqida batafsil
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/posts/create"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              Post yaratish
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <SolveraChatCard context={{ surface: "homepage" }} />
      </div>
    </section>
  );
}
