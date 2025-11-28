import Link from "next/link";
import { CyberGrid } from "@/components/error/CyberGrid";
import { GlitchText } from "@/components/error/GlitchText";
import { MatrixRain } from "@/components/error/MatrixRain";
import { TerminalPanel } from "@/components/error/TerminalPanel";
import { TypingConsole } from "@/components/error/TypingConsole";

export default function UnauthorizedPage() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--surface-1))] px-4 py-12 text-foreground">
      <MatrixRain />
      <CyberGrid />
      <div className="grain-overlay" aria-hidden />
      <TerminalPanel title="Identity Verification" accent="yellow" className="relative z-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <GlitchText text="IDENTITY VERIFICATION FAILED" variant="yellow" className="text-2xl sm:text-3xl md:text-4xl" />
          <div className="fingerprint-scan" aria-hidden />
          <div className="max-w-2xl space-y-4 text-[hsl(var(--muted-foreground))]">
            <p className="text-sm uppercase tracking-[0.18em] text-[hsl(var(--terminal-amber))]">
              Biometric hash mismatch.
            </p>
            <TypingConsole
              lines={[
                "Biometric hash mismatch.",
                "Authentication token invalid.",
                "Fallback verification required.",
              ]}
              speed={34}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="status-pill">SCAN: FAILED</span>
            <span className="status-pill">MODE: SAFE</span>
          </div>
          <Link className="terminal-btn" href="/auth/login">
            Retry Authentication
          </Link>
        </div>
      </TerminalPanel>
    </div>
  );
}
