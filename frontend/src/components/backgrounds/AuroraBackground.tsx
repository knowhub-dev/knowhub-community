'use client';

import { useEffect, useRef } from 'react';

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePosition = (event: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        container.style.setProperty('--x', `${x}%`);
        container.style.setProperty('--y', `${y}%`);
      });
    };

    const resetPosition = () => {
      container.style.setProperty('--x', '50%');
      container.style.setProperty('--y', '50%');
    };

    resetPosition();
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseleave', resetPosition);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseleave', resetPosition);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="aurora-bg" aria-hidden>
      <div className="aurora-layer" />
    </div>
  );
}
