import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { generateStaticMetadata } from "@/lib/metadata-helpers";
import { SolveraChatCard } from "@/components/SolveraChatCard";

export const generateMetadata = generateStaticMetadata({
  title: "SolVera AI beta",
  description:
    "KnowHub jamoasining gtp-5 asosidagi SolVera modeli — postlarni jilolash, kod sharhlash va g'oyalarni tezlashtirish uchun",
  path: "/solvera",
});

const roadmap = [
  "Realtime streaming javoblar va kod bloklarni formatlash",
  "Team workspace uchun kollaborativ sessiyalar",
  "Moderatorlarga yordam beruvchi siyosat-aware rejim",
  "API orqali o'z loyihangizga SolVerani ulash",
];

export default function SolveraPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))/30] bg-[hsl(var(--primary))/12] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
            <Sparkles className="h-3.5 w-3.5" /> SolVera — beta
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[hsl(var(--foreground))] sm:text-4xl">
            KnowHub jamoasining shaxsiy AI modeli
          </h1>
          <p className="text-lg text-muted-foreground">
            SolVera gtp-5 modelida ishlaydi: postlaringizni jilolaydi, izohlaringizni silliqlaydi va
            fikrlaringizni aniq ifodalash uchun real vaqtli tavsiyalar beradi.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-[hsl(var(--card))] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Post yozishda yordamchi</p>
              <p className="text-xs text-muted-foreground">Strukturani taklif qiladi, sarlavhalarni sozlaydi, CTA matnini jilolaydi.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-[hsl(var(--card))] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Kodni tushuntiradi</p>
              <p className="text-xs text-muted-foreground">Snippetlarni izohlaydi, refaktor g'oyalarini beradi, xavfli joylarni belgilaydi.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/posts/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary))/25] transition hover:brightness-110"
            >
              SolVera bilan yozishni boshlash
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-muted-foreground">Beta: asosiy chat va matn asboblari tayyor.</span>
          </div>
        </div>

        <SolveraChatCard title="SolVera beta" subtitle="Sahifani tark etmasdan qisqa chat" />
      </div>

      <div className="mt-12 grid gap-6 rounded-3xl border border-border/60 bg-[hsl(var(--muted))]/40 p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Yaqin reja</h2>
          <p className="text-sm text-muted-foreground">
            Beta bosqichida SolVera asosan post yozish va fikrlarni silliqlashga yo'naltirilgan. Quyidagi yo'nalishlar keyingi
            yangilanishlarda ochiladi:
          </p>
          <ul className="mt-4 space-y-2">
            {roadmap.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground))]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-[hsl(var(--card))] p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Hozir nima ishlayapti?</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Matnni qayta yozish va qisqartirish</li>
            <li>• Post sarlavhalarini tanlash</li>
            <li>• Kodga qisqa sharhlar berish</li>
            <li>• O'zbekcha/inglizcha aralash matnlarni silliqlash</li>
          </ul>
          <p className="mt-3 text-xs text-[hsl(var(--primary))]">
            Barcha chatlar SolVera gtp-5 modeli orqali ishlanadi.
          </p>
        </div>
      </div>
    </div>
  );
}
