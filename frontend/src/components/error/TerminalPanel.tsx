import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TerminalPanelProps = {
  children: ReactNode;
  title?: string;
  accent?: "green" | "red" | "yellow" | "blue" | "emerald";
  className?: string;
  actions?: ReactNode;
};

const accentColors: Record<NonNullable<TerminalPanelProps["accent"]>, string> = {
  green: "var(--terminal-green)",
  red: "var(--terminal-red)",
  yellow: "var(--terminal-amber)",
  blue: "var(--terminal-blue)",
  emerald: "var(--success)",
};

export function TerminalPanel({
  children,
  title,
  accent = "green",
  className,
  actions,
}: TerminalPanelProps) {
  const accentColor = accentColors[accent] ?? "var(--terminal-green)";

  return (
    <section
      className={cn(
        "relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--surface-1))/0.78] shadow-[0_0_40px_hsla(var(--terminal-glow),0.25)] backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-[-10%] before:bg-[radial-gradient(circle_at_20%_20%,hsla(var(--terminal-glow),0.25),transparent_40%),radial-gradient(circle_at_80%_0%,hsla(var(--terminal-glow),0.18),transparent_40%)] before:opacity-60",
        className,
      )}
      style={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error -- CSS custom properties
        "--terminal-glow": accentColor,
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,hsla(var(--terminal-bg),0.22),hsla(var(--terminal-bg),0.12))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsla(var(--terminal-glow),0.65)] to-transparent" />
      <div className="relative p-8 sm:p-10">
        <div className="flex flex-col gap-4">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {title ? (
              <h1 className="text-xl font-semibold tracking-[0.08em] text-[hsl(var(--foreground))]">
                {title}
              </h1>
            ) : null}
            {actions ? <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">{actions}</div> : null}
          </header>
          <div className="overflow-hidden rounded-xl border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--surface-2))/0.72] shadow-inner shadow-[0_0_0_1px_hsla(var(--terminal-glow),0.08)]">
            <div className="relative isolate">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsla(var(--terminal-glow),0.14),transparent_45%),radial-gradient(circle_at_80%_0%,hsla(var(--terminal-glow),0.1),transparent_35%)] opacity-80" />
              <div className="relative p-6 sm:p-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
