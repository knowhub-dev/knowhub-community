import Link from "next/link";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

export default function OfflinePage() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="Signal Interrupted" accent="yellow" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="OFFLINE MODE" variant="yellow" className="text-3xl sm:text-4xl" />
          <div className="offline-indicator" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--terminal-amber))]" />
            Connection Lost
          </div>
          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <TypingConsole
              lines={[
                "Reconnecting to KnowHub grid…",
                "Caching local data for offline use…",
                "Awaiting network signal…",
              ]}
              speed={30}
              startDelay={160}
              loop
            />
          </div>
          <Link className="terminal-btn" href="/">
            Retry Connection
          </Link>
        </div>
      </TerminalPanel>
    </div>
  );
}
