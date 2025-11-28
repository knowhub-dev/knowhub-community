"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TypingConsoleProps = {
  lines: string[];
  speed?: number;
  startDelay?: number;
  loop?: boolean;
  className?: string;
};

export function TypingConsole({
  lines,
  speed = 32,
  startDelay = 280,
  loop = false,
  className,
}: TypingConsoleProps) {
  const memoizedLines = useMemo(() => [...lines], [lines]);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let frameId: number;
    let lineIndex = 0;

    const typeLine = (charIndex = 0) => {
      const line = memoizedLines[lineIndex] ?? "";
      if (charIndex <= line.length) {
        setCurrent(line.slice(0, charIndex));
        timeoutId = setTimeout(() => typeLine(charIndex + 1), speed);
      } else {
        setVisibleLines((prev) => [...prev, line]);
        setCurrent("");
        const hasMore = lineIndex + 1 < memoizedLines.length;
        if (hasMore) {
          lineIndex += 1;
          timeoutId = setTimeout(() => typeLine(0), speed * 2);
        } else if (loop) {
          timeoutId = setTimeout(() => {
            setVisibleLines([]);
            lineIndex = 0;
            typeLine(0);
          }, speed * 6);
        }
      }
    };

    frameId = window.requestAnimationFrame(() => {
      timeoutId = setTimeout(() => typeLine(0), startDelay);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [loop, memoizedLines, speed, startDelay]);

  return (
    <div className={cn("typing-console", className)} aria-live="polite">
      {visibleLines.map((line, lineIndex) => (
        <p key={`${line}-${lineIndex}`} className="console-line">
          <span className="console-prefix" aria-hidden>
            &#x276f;
          </span>
          {line}
        </p>
      ))}
      {current ? (
        <p className="console-line active">
          <span className="console-prefix" aria-hidden>
            &#x276f;
          </span>
          {current}
          <span className="console-cursor" aria-hidden>
            _
          </span>
        </p>
      ) : null}
    </div>
  );
}
