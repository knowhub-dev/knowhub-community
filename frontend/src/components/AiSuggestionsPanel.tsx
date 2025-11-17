import { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  Wifi,
  Zap,
} from 'lucide-react';
import { AiProgressUpdate, AiSuggestion, AiSuggestionStatus } from '@/lib/services/ai-suggestions';
import { cn } from '@/lib/utils';

interface AiSuggestionsPanelProps {
  suggestions: AiSuggestion[];
  status: AiSuggestionStatus;
  progress?: AiProgressUpdate;
  transport: 'sse' | 'websocket';
  onTransportChange?: (transport: 'sse' | 'websocket') => void;
  onApply: (text: string) => void;
  onRetry?: () => void;
  errorMessage?: string;
}

const statusCopy: Record<AiSuggestionStatus, string> = {
  idle: 'Matn yuborilishini kutyapmiz',
  connecting: 'AI servisiga ulanmoqda',
  streaming: 'Tavsiyalar kelmoqda',
  done: 'Yangi tavsiyalar tayyor',
  rate_limited: 'AI vaqtincha cheklangan',
  error: 'AI bilan aloqa uzildi',
};

const badgeClasses: Record<AiSuggestion['type'] extends string ? AiSuggestion['type'] : string, string> = {
  finding: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  style: 'bg-amber-50 text-amber-700 border-amber-100',
  cta: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rewrite: 'bg-blue-50 text-blue-700 border-blue-100',
  outline: 'bg-pink-50 text-pink-700 border-pink-100',
  general: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function AiSuggestionsPanel({
  suggestions,
  status,
  progress,
  transport,
  onTransportChange,
  onApply,
  onRetry,
  errorMessage,
}: AiSuggestionsPanelProps) {
  const hasActiveStream = status === 'connecting' || status === 'streaming';
  const hasError = status === 'error' || status === 'rate_limited';

  const sortedSuggestions = useMemo(
    () =>
      [...suggestions].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [suggestions],
  );

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-gray-50/60 p-4 shadow-inner">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Bot className="h-5 w-5 text-indigo-600" />
          AI tavsiyalar
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Wifi className={cn('h-4 w-4', transport === 'websocket' ? 'text-emerald-600' : 'text-gray-400')} />
          <button
            type="button"
            className={cn(
              'rounded-full px-3 py-1 font-medium transition',
              transport === 'sse'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100',
            )}
            onClick={() => onTransportChange?.('sse')}
          >
            SSE
          </button>
          <button
            type="button"
            className={cn(
              'rounded-full px-3 py-1 font-medium transition',
              transport === 'websocket'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100',
            )}
            onClick={() => onTransportChange?.('websocket')}
          >
            Socket
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          {hasActiveStream && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
          {hasError && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {!hasActiveStream && !hasError && <Activity className="h-4 w-4 text-emerald-600" />}
          <span>{statusCopy[status]}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            <Zap className="h-4 w-4" />
            Qayta ishga tushirish
          </button>
        )}
      </div>

      {progress && (
        <div className="mt-2 rounded-md border border-indigo-100 bg-white p-2 text-xs text-gray-700">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-indigo-700">Progress</span>
            {progress.tokens ? (
              <span className="text-[11px] text-gray-600">{progress.tokens} token</span>
            ) : null}
          </div>
          <div className="h-2 rounded-full bg-indigo-50">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${Math.min(progress.progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {hasError && errorMessage && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {sortedSuggestions.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
            AI hali tavsiya bermadi. Matnni o'zgartiring yoki qayta yuboring.
          </div>
        )}

        {sortedSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-xs font-semibold',
                    badgeClasses[suggestion.type || 'general'] || badgeClasses.general,
                  )}
                >
                  {suggestion.type || 'general'}
                </span>
                {suggestion.score ? (
                  <span className="text-[11px] text-gray-500">{Math.round(suggestion.score * 100)}% moslik</span>
                ) : null}
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800">{suggestion.title}</div>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{suggestion.text}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              {suggestion.tokensUsed ? (
                <span className="rounded-md bg-gray-100 px-2 py-1">{suggestion.tokensUsed} token</span>
              ) : (
                <span className="flex items-center gap-1 text-indigo-600">
                  <ArrowRight className="h-3 w-3" /> Real-time oqim
                </span>
              )}
              <button
                type="button"
                className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                onClick={() => onApply(suggestion.text)}
              >
                <Zap className="h-4 w-4" />
                Matnga qo'shish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiSuggestionsPanel;
