'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface LogViewerProps {
  lines: string[];
  onRefresh?: () => void;
}

export function LogViewer({ lines, onRefresh }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black text-green-200 shadow-inner">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-sm font-semibold text-white">Container Logs</p>
        {onRefresh && (
          <Button size="sm" variant="secondary" onClick={onRefresh} className="bg-white/10 hover:bg-white/20 text-white">
            Refresh
          </Button>
        )}
      </div>
      <div
        ref={containerRef}
        className="h-80 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed bg-gradient-to-b from-gray-900 via-black to-black"
      >
        {lines.length === 0 ? (
          <p className="text-gray-400">No logs yet. Start your container to see output.</p>
        ) : (
          lines.map((line, index) => (
            <div key={`${line}-${index}`} className="whitespace-pre-wrap text-left text-green-200">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogViewer;
