"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Send, Sparkles, Wand2 } from "lucide-react";

type SolveraChatCardProps = {
  context?: Record<string, unknown>;
  title?: string;
  subtitle?: string;
};

type ChatPayload = {
  message: string;
  context?: Record<string, unknown>;
};

type ChatResponse = {
  reply: string;
};

const quickPrompts = [
  "Postimni qisqa va kuchli qilib ber",
  "Kod sharhini silliq yozib ber",
  "Muammo bayonini tushunarli qil",
  "CTA matnini yaxshilab ber",
];

export function SolveraChatCard({ context, title, subtitle }: SolveraChatCardProps) {
  const [message, setMessage] = useState("Bugun nima ustida ishlayapsan? Qisqa yozib ber.");
  const [reply, setReply] = useState<string | null>(null);

  const mutation = useMutation<ChatResponse, unknown, ChatPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<ChatResponse>('/ai/solvera/chat', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setReply(data.reply);
    },
  });

  const disabled = useMemo(() => !message.trim() || mutation.isLoading, [message, mutation.isLoading]);

  const handleSubmit = () => {
    if (!message.trim()) return;
    setReply(null);
    mutation.mutate({ message, context });
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-3xl border border-border/50 bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--muted))] p-4 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{title ?? "SolVera bilan tezkor chat"}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {subtitle ?? "KnowHub jamoasining shaxsiy gtp-5 modeli (beta) matningizni jilolaydi."}
          </p>
        </div>
        <Badge variant="secondary" className="bg-[hsl(var(--primary))/12] text-[hsl(var(--primary))]">
          Beta
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setMessage(prompt)}
            className="inline-flex items-center justify-between rounded-xl border border-border/60 bg-[hsl(var(--muted))]/50 px-3 py-2 text-left text-xs font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))]"
          >
            <span>{prompt}</span>
            <Wand2 className="h-4 w-4 text-[hsl(var(--primary))]" />
          </button>
        ))}
      </div>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Savolingizni yoki matningizni kiriting"
        className="min-h-[120px] rounded-2xl border-border/70 bg-[hsl(var(--background))] text-sm"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SolVera: matnni jilolash, qayta yozish va g\'oyalarni tezlashtirish uchun.</span>
        </div>
        <Button onClick={handleSubmit} disabled={disabled} className="gap-2 rounded-xl px-4">
          {mutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Yuborish
        </Button>
      </div>

      {reply && (
        <div className="rounded-2xl border border-[hsl(var(--primary))/25] bg-[hsl(var(--primary))/6] p-3 text-sm text-[hsl(var(--foreground))]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--primary))]">SolVera javobi</p>
          <p className="whitespace-pre-line leading-relaxed">{reply}</p>
        </div>
      )}

      {mutation.isError && !mutation.isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Javob olishda muammo yuz berdi. Birozdan so\'ng urinib ko\'ring.</span>
        </div>
      )}
    </div>
  );
}
