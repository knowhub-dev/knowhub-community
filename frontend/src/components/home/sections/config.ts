import type { FeedTab, HomepageStatsResponse, QuickAction, StatCard } from "@/components/home/sections/types";
import { BookOpen, MessageCircle, PenSquare, Server, Users } from "lucide-react";

export const FEED_TABS: FeedTab[] = [
  { value: "latest", label: "So'nggilari" },
  { value: "popular", label: "Trenddagilar" },
  { value: "following", label: "Mening obunalarim", authOnly: true },
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    href: "/posts/create",
    title: "Savol yoki issue ochish",
    description: "Savolingizni yozing va SolVera takliflari bilan birga nashr qiling.",
    icon: MessageCircle,
    accentClass: "text-[hsl(var(--primary))]",
    hoverClass: "hover:border-[hsl(var(--primary))]/60 hover:bg-[hsl(var(--primary))]/5",
    ctaLabel: "Savol yuborish",
    ctaClass: "text-[hsl(var(--primary))]",
  },
  {
    href: "/wiki",
    title: "Wiki bo'limini boyitish",
    description: "Atroflicha yechimlarni hujjatlashtirib, boshqalarga yo'l ko'rsating.",
    icon: BookOpen,
    accentClass: "text-[hsl(var(--accent-purple))]",
    hoverClass: "hover:border-[hsl(var(--accent-purple))]/60 hover:bg-[hsl(var(--accent-purple))]/5",
    ctaLabel: "Maqola yozish",
    ctaClass: "text-[hsl(var(--accent-purple))]",
  },
  {
    href: "/containers",
    title: "Laboratoriya muhiti",
    description: "Mini-serverlarda tajriba o'tkazing, kodlaringizni SolVera bilan sharhlang.",
    icon: Server,
    accentClass: "text-[hsl(var(--accent-green))]",
    hoverClass: "hover:border-[hsl(var(--accent-green))]/60 hover:bg-[hsl(var(--accent-green))]/5",
    ctaLabel: "Labga o'tish",
    ctaClass: "text-[hsl(var(--accent-green))]",
  },
  {
    href: "/leaderboard",
    title: "Mentorlarni toping",
    description: "Eng faol a'zolar va SolVera tavsiyalari bilan yo'nalishingizni toping.",
    icon: Users,
    accentClass: "text-[hsl(var(--secondary))]",
    hoverClass: "hover:border-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))]/5",
    ctaLabel: "Mentorlar",
    ctaClass: "text-[hsl(var(--secondary))]",
  },
];

export const buildStatsCards = (stats?: HomepageStatsResponse["stats"]): StatCard[] => [
  { label: "Postlar", value: stats?.posts?.total, subtitle: "Umumiy maqolalar", icon: PenSquare, accentClass: "text-[hsl(var(--primary))]" },
  { label: "A'zolar", value: stats?.users?.total, subtitle: "Faol hamjamiyat", icon: Users, accentClass: "text-[hsl(var(--secondary))]" },
  { label: "Wiki", value: stats?.wiki?.articles, subtitle: "Bilim maqolalari", icon: BookOpen, accentClass: "text-[hsl(var(--accent-purple))]" },
];
