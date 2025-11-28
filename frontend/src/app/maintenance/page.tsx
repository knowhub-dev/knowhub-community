import Link from "next/link";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

export default function MaintenancePage() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="System Upgrade in Progress" accent="blue" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="SYSTEM MAINTENANCE" variant="blue" className="text-2xl sm:text-3xl md:text-4xl" />
          <div className="ascii-gear" aria-hidden>
            {`⚙️`}
          </div>
          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <p className="text-sm uppercase tracking-[0.18em] text-[hsl(var(--terminal-blue))]">
              UPGRADE SEQUENCE LIVE
            </p>
            <TypingConsole
              lines={[
                "Applying kernel patches…",
                "Rebuilding cluster nodes…",
                "Optimizing memory pools…",
              ]}
              speed={28}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="status-pill">ETA: SHORT</span>
            <span className="status-pill">SERVICES: RESTARTING</span>
          </div>
          <Link className="terminal-btn" href="/status">
            View Status Page
          </Link>
        </div>
      </TerminalPanel>
    </div>
  );
}
