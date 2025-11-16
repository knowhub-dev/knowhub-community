import Link from "next/link";
import { Rocket, Server, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Izolyatsiyalangan ishga tushirish",
    description:
      "Har bir mini server alohida konteynerda ishga tushadi va global konfiguratsiyadan mustaqil boshqariladi.",
    icon: Server,
  },
  {
    title: "Xavfsizlik va kvotalar",
    description: "Ruxsatlar, vaqt va resurs limitlari orqali hamjamiyatni himoyalash rejalashtirilgan.",
    icon: ShieldCheck,
  },
  {
    title: "Yorqin tajriba",
    description:
      "Real vaqt loglari va vizual grafikalar yordamida kod natijalarini darhol kuzatishingiz mumkin bo'ladi.",
    icon: Sparkles,
  },
  {
    title: "Jamiyat bilan ulanish",
    description: "Serveringizdagi xulosalarni post yoki wiki sahifalarida baham ko'ring.",
    icon: Rocket,
  },
];

export default function ContainersPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-1 text-sm font-semibold text-primary">
          Beta rejadagi funksiya
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">Mini serverlar tez orada</h1>
        <p className="mt-4 text-base text-muted-foreground">
          KnowHub Community foydalanuvchilari uchun bir xil dizayndagi, xavfsiz va avtomatlashtirilgan ishga tushirish muhiti
          ustida ishlamoqdamiz. Quyida kelayotgan imkoniyatlarning qisqa ro'yxati bilan tanishing.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-12 space-y-4 rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-foreground">Hamjamiyat fikrlarini kutamiz</p>
        <p className="text-sm text-muted-foreground">
          O'z ehtiyojlaringizni bo'lishing yoki mavjud integratsiyalarni taklif qiling. Sizning so'rovingiz loyiha yo'l xaritasiga
          ta'sir qiladi.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">Bosh sahifaga qaytish</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/posts/create">G'oya bilan bo'lishing</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
