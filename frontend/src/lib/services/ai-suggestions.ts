const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type AiSuggestionType = 'finding' | 'style' | 'cta' | 'rewrite' | 'outline' | 'general';

export interface AiSuggestion {
  id: string;
  title: string;
  text: string;
  type?: AiSuggestionType;
  score?: number;
  tokensUsed?: number;
}

export type AiSuggestionStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'done'
  | 'rate_limited'
  | 'error';

export interface AiProgressUpdate {
  progress: number;
  tokens?: number;
}

interface AiSuggestionStreamOptions {
  content: string;
  transport?: 'sse' | 'websocket';
  signal?: AbortSignal;
  onSuggestion: (suggestion: AiSuggestion) => void;
  onStatusChange?: (status: AiSuggestionStatus) => void;
  onProgress?: (payload: AiProgressUpdate) => void;
  onError?: (message: string) => void;
}

const normalizeBaseUrl = (base: string) => base.replace(/\/$/, '');
const API_ROOT = normalizeBaseUrl(API_BASE_URL.replace(/\/$/, ''));
const AI_STREAM_URL = `${API_ROOT}/ai/suggestions/stream`;
const AI_SOCKET_URL = normalizeBaseUrl(API_ROOT.replace(/^http/, 'ws')) + '/ai/suggestions/socket';

const toSuggestion = (payload: any): AiSuggestion | null => {
  if (!payload) return null;
  if (payload.type === 'progress') return null;

  const suggestion: AiSuggestion = {
    id: payload.id?.toString() || crypto.randomUUID(),
    title: payload.title || payload.heading || 'AI taklifi',
    text: payload.text || payload.body || payload.suggestion || '',
    type: payload.kind || payload.type || 'general',
    score: typeof payload.score === 'number' ? payload.score : undefined,
    tokensUsed: payload.tokens ?? payload.token_count,
  };

  if (!suggestion.text) return null;
  return suggestion;
};

export function createAiSuggestionStream(options: AiSuggestionStreamOptions) {
  const { content, transport = 'sse', onSuggestion, onStatusChange, onProgress, onError, signal } = options;
  let cleanup = () => {};

  const notifyError = (message: string) => {
    onStatusChange?.('error');
    onError?.(message);
  };

  const onAbort = () => {
    cleanup();
  };

  if (signal) {
    if (signal.aborted) {
      return cleanup;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }

  if (transport === 'websocket' && typeof WebSocket !== 'undefined') {
    const socket = new WebSocket(AI_SOCKET_URL);
    onStatusChange?.('connecting');

    socket.onopen = () => {
      onStatusChange?.('streaming');
      socket.send(JSON.stringify({ content }));
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'progress') {
          onProgress?.({ progress: payload.progress ?? 0, tokens: payload.tokens });
          return;
        }
        if (payload?.type === 'rate_limit') {
          onStatusChange?.('rate_limited');
          return;
        }
        const suggestion = toSuggestion(payload);
        if (suggestion) {
          onSuggestion(suggestion);
        }
      } catch (err) {
        notifyError('AI tavsiyalarini o\'qishda xatolik yuz berdi');
      }
    };

    socket.onerror = () => notifyError('AI soketiga ulanishda xatolik yuz berdi');
    socket.onclose = () => onStatusChange?.('done');

    cleanup = () => {
      socket.close();
    };

    return cleanup;
  }

  const streamUrl = `${AI_STREAM_URL}?content=${encodeURIComponent(content.slice(0, 4000))}`;
  const eventSource = new EventSource(streamUrl, { withCredentials: true });
  onStatusChange?.('connecting');

  eventSource.onopen = () => onStatusChange?.('streaming');

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload?.type === 'progress') {
        onProgress?.({ progress: payload.progress ?? 0, tokens: payload.tokens });
        return;
      }
      if (payload?.type === 'rate_limit') {
        onStatusChange?.('rate_limited');
        return;
      }
      const suggestion = toSuggestion(payload);
      if (suggestion) {
        onSuggestion(suggestion);
      }
    } catch (err) {
      notifyError('AI tavsiyalar oqimini tahlil qilishda xatolik');
    }
  };

  eventSource.onerror = () => {
    notifyError('AI tavsiyalariga ulanish vaqtida xatolik');
    eventSource.close();
  };

  cleanup = () => {
    eventSource.close();
  };

  return cleanup;
}
