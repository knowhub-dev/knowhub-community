"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
  ariaLabel?: string;
}

export function ProgressBar({ value, label, ariaLabel }: ProgressBarProps) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 800;

    const step = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - start) / duration);
      setDisplayValue(Math.round(progress * safeValue));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [safeValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{label ?? "XP darajasi"}</span>
        <span className="text-[hsl(var(--primary))]">{displayValue}%</span>
      </div>
      <div
        className="relative h-3 w-full overflow-hidden rounded-[var(--radius-md)] bg-[hsl(var(--muted))]/60"
        role="progressbar"
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? label ?? "XP"}
      >
        <div
          className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-purple))] to-[hsl(var(--accent-pink))] shadow-[0_12px_40px_rgba(59,130,246,0.35)]"
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}
