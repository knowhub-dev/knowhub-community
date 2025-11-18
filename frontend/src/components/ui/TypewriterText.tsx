"use client";

import { useEffect, useMemo, useState } from "react";

interface TypewriterTextProps {
  phrases: string[];
  className?: string;
  typingSpeedMs?: number;
  pauseMs?: number;
}

export function TypewriterText({
  phrases,
  className,
  typingSpeedMs = 70,
  pauseMs = 1600,
}: TypewriterTextProps) {
  const safePhrases = useMemo(() => (phrases.length ? phrases : [""]), [phrases]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const current = safePhrases[phraseIndex % safePhrases.length];
    let active = true;

    const type = () => {
      if (!active) return;
      if (displayed.length < current.length) {
        setDisplayed(current.slice(0, displayed.length + 1));
        setTimeout(type, typingSpeedMs);
      } else {
        setTimeout(() => {
          if (active) {
            setDisplayed("");
            setPhraseIndex((prev) => (prev + 1) % safePhrases.length);
          }
        }, pauseMs);
      }
    };

    const timer = setTimeout(type, typingSpeedMs);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // We intentionally depend on the index and phrase list but not displayed text
    // to restart typing whenever the phrase changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIndex, safePhrases, typingSpeedMs, pauseMs]);

  return (
    <span className={className} aria-live="polite">
      {displayed}
      <span className="ml-1 inline-block h-6 w-1 animate-pulse rounded-[var(--radius-md)] bg-[hsl(var(--primary))] align-middle" />
    </span>
  );
}
