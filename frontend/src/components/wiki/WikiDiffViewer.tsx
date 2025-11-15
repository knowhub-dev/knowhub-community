'use client';

import { cn } from '@/lib/utils';

type DiffLine = {
  type: 'context' | 'added' | 'removed';
  text: string;
};

type Summary = {
  added: number;
  removed: number;
  net: number;
};

interface WikiDiffViewerProps {
  lines: DiffLine[];
  summary: Summary;
}

export function WikiDiffViewer({ lines, summary }: WikiDiffViewerProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-green-600">+{summary.added} qo’shimcha</span>
        <span className="font-medium text-rose-600">-{summary.removed} o’chirish</span>
        <span className="font-medium text-gray-600">
          Net {summary.net >= 0 ? `+${summary.net}` : summary.net}
        </span>
      </div>
      <div className="max-h-[480px] overflow-auto">
        <pre className="text-sm font-mono leading-6">
          {lines.map((line, index) => (
            <div
              key={`${index}-${line.type}-${line.text}`}
              className={cn(
                'px-4 py-1 whitespace-pre-wrap break-words flex gap-3',
                line.type === 'added' && 'bg-green-50 text-green-800',
                line.type === 'removed' && 'bg-rose-50 text-rose-800',
                line.type === 'context' && 'text-gray-800'
              )}
            >
              <span className="text-gray-400 select-none w-10 text-right">
                {index + 1}
              </span>
              <span className="flex-1">{prefixForType(line.type)}{line.text}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function prefixForType(type: DiffLine['type']): string {
  switch (type) {
    case 'added':
      return '+';
    case 'removed':
      return '-';
    default:
      return ' ';
  }
}
