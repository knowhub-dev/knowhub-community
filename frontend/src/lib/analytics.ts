export type GAEventParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function sendGAEvent(eventName: string, params: GAEventParams = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("event", eventName, params);
}
