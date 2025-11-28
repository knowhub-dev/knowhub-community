"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavLinkProps = {
  href: string;
  label: string;
  exact?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  variant?: "pill" | "ghost" | "list";
  prefetch?: boolean;
};

export function NavLink({
  href,
  label,
  exact,
  icon: Icon,
  onClick,
  className,
  variant = "pill",
  prefetch = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);

  const baseStyles = {
    pill:
      "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition",
    ghost:
      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
    list:
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
  } as const;

  const activeStyles = {
    pill: "text-foreground shadow-inner shadow-primary/10",
    ghost: "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-foreground",
    list: "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-foreground",
  } as const;

  const inactiveStyles = {
    pill: "text-muted-foreground hover:text-foreground",
    ghost: "text-muted-foreground hover:border-border/80 hover:text-foreground",
    list: "text-muted-foreground hover:border-border/70 hover:text-foreground",
  } as const;

  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={prefetch}
      className={cn(
        baseStyles[variant],
        isActive ? activeStyles[variant] : inactiveStyles[variant],
        variant === "pill" && "hover:-translate-y-0.5 hover:text-foreground",
        variant === "ghost" && "border border-transparent",
        variant === "list" && "border border-border/60",
        variant === "pill" && "bg-gradient-to-r from-transparent to-transparent",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      <span className="relative z-10">{label}</span>
      {variant === "pill" && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-primary/12 via-primary/10 to-secondary/20 opacity-0 transition duration-200",
            "group-hover:opacity-100",
            isActive && "opacity-100",
          )}
        />
      )}
    </Link>
  );
}
