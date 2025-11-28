import Link from "next/link";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

export default function ForbiddenPage() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="Unauthorized Terminal Attempt" accent="red" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="ACCESS DENIED" variant="red" className="text-3xl sm:text-4xl md:text-5xl" />
          <div className="laser-scan w-full max-w-xl" aria-hidden />
          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--terminal-red))]">
              ACCESS RIGHTS: INSUFFICIENT
            </p>
            <TypingConsole
              lines={[
                "Scanning identity hash...",
                "Access rights: insufficient.",
                "Security lockdown initiated.",
              ]}
              startDelay={180}
            />
          </div>
          <Link className="terminal-btn" href="/auth/login">
            Authenticate
          </Link>
        </div>
      </TerminalPanel>
    </div>
  );
}
