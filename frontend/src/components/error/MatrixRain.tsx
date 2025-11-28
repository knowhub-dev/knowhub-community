"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MatrixRainProps = {
  className?: string;
  density?: number;
  fontSize?: number;
};

const GLYPHS = "01⌁⟡⟊/\\<>+=-*#%";

export function MatrixRain({
  className,
  density = 14,
  fontSize = 16,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(document.documentElement);
    const neon = style.getPropertyValue("--terminal-green").trim() || "133 84% 62%";
    const trail = style.getPropertyValue("--terminal-bg").trim() || "120 14% 8%";

    let width = 0;
    let height = 0;
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const columns = Math.max(1, Math.floor(width / density));
      dropsRef.current = new Array(columns).fill(0);
      ctx.font = `${fontSize}px "DM Mono", "SFMono-Regular", "Consolas", monospace`;
    };

    let resizeFrame: number | undefined;
    const handleResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(setSize);
    };

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      ctx.fillStyle = `hsla(${trail} / 0.08)`;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = `hsla(${neon} / 0.9)`;
      ctx.shadowColor = `hsla(${neon} / 0.55)`;
      ctx.shadowBlur = 14;

      dropsRef.current.forEach((drop, i) => {
        const text = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        const x = i * density;
        const y = drop * fontSize;
        ctx.fillText(text, x, y);
        const resetThreshold = 0.975;
        dropsRef.current[i] = y > height && Math.random() > resetThreshold ? 0 : drop + 1;
      });
    };

    setSize();
    draw();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [density, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "matrix-canvas pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
    />
  );
}
