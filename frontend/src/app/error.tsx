"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  // 🔥 Next.js 15 redirect detection
  if (error.digest === "NEXT_REDIRECT") {
    throw error;
  }

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="SYSTEM FAILURE / CORE OVERLOAD" accent="red" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="500" variant="red" className="glitch-pulse text-6xl sm:text-7xl" />

          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--terminal-red))]">
              Critical system malfunction detected.
            </p>
            <Suspense fallback={<p className="console-line">Stabilizing reactor core…</p>}>
              <TypingConsole
                lines={[
                  "Critical system malfunction detected.",
                  "Stacktrace injection blocked.",
                  "Reactor meltdown avoided.",
                  "Returning to stable kernel…",
                ]}
              />
            </Suspense>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="status-pill">DIGEST: {error.digest ?? "PENDING"}</span>
            <span className="status-pill">KERNEL SAFE MODE</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="terminal-btn" onClick={reset}>
              Reboot Kernel
            </button>
            <Link className="terminal-btn" href="/">
              Return Home
            </Link>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}

