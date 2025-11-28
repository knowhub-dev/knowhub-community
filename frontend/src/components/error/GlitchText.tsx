import { cn } from "@/lib/utils";

type GlitchTextProps = {
  text: string;
  variant?: "green" | "red" | "yellow" | "blue";
  className?: string;
};

const variantTokens: Record<NonNullable<GlitchTextProps["variant"]>, string> = {
  green: "var(--terminal-green)",
  red: "var(--terminal-red)",
  yellow: "var(--terminal-amber)",
  blue: "var(--terminal-blue)",
};

export function GlitchText({ text, variant = "green", className }: GlitchTextProps) {
  const colorToken = variantTokens[variant] ?? "var(--terminal-green)";

  return (
    <div
      className={cn("glitch-text", className)}
      data-text={text}
      style={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error -- CSS custom properties
        "--glitch-color": colorToken,
      }}
    >
      <span className="glitch-layer" aria-hidden>
        {text}
      </span>
      <span className="glitch-layer" aria-hidden>
        {text}
      </span>
      <span className="glitch-base">{text}</span>
    </div>
  );
}
