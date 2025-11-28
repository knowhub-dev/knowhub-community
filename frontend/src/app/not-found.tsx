import Link from "next/link";
import { Suspense } from "react";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="KnowHub Terminal" accent="green" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="404 — ROUTE_NOT_FOUND" className="text-3xl sm:text-4xl md:text-5xl" />
          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <p className="text-sm uppercase tracking-[0.18em] text-[hsl(var(--terminal-green))]">
              Signal Lost in the Grid
            </p>
            <Suspense fallback={<p className="console-line">Initializing diagnostics…</p>}>
              <TypingConsole
                lines={[
                  "Initializing KnowHub System…",
                  "Running diagnostics…",
                  "Error: Route not found.",
                  "Suggested Action: Return to Home.",
                ]}
              />
            </Suspense>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="status-pill">NAVIGATOR</span>
            <span className="status-pill">GRID SAFE</span>
            <span className="status-pill">ROUTE: UNKNOWN</span>
          </div>
          <Link className="terminal-btn" href="/">
            Return to Home
          </Link>
        </div>
      </TerminalPanel>
    </div>
  );
}
