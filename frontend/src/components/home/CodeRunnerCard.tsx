"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Code2, Play } from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface CodeRunnerCardProps {}

interface CodeRunResult {
  stdout?: string;
  stderr?: string;
  status?: string;
  message?: string;
}

const LANGUAGE_SNIPPETS: Record<string, string> = {
  javascript: `function greet(name) {\n  return \`Salom, \${name}!\`;\n}\n\nconsole.log(greet('KnowHub'));`,
  python: `def greet(name):\n    return f"Salom, {name}!"\n\nprint(greet("KnowHub"))`,
  php: `<?php\nfunction greet($name) {\n    return "Salom, {$name}!";\n}\n\necho greet('KnowHub');`,
};

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
];

export function CodeRunnerCard(_: CodeRunnerCardProps) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>(LANGUAGES[0].value);
  const [source, setSource] = useState<string>(LANGUAGE_SNIPPETS[LANGUAGES[0].value]);
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSource(LANGUAGE_SNIPPETS[language] ?? "");
  }, [language]);

  const handleRun = async () => {
    if (!user) {
      setResult({ message: "Kod ishga tushirish uchun tizimga kiring." });
      return;
    }

    if (!source.trim()) {
      setResult({ message: "Kod maydoni bo'sh." });
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const response = await api.post("/code-run", { language, source });

      setResult({
        stdout: response.data.stdout,
        stderr: response.data.stderr,
        status: response.data.status,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError?.response?.status;
      if (status === 429) {
        setResult({ message: "Siz belgilangan limitdan oshdingiz. Birozdan so'ng urinib ko'ring." });
      } else if (status === 401) {
        setResult({ message: "Kod ishga tushirish uchun tizimga kiring." });
      } else {
        setResult({ message: "Kod bajarishda xatolik yuz berdi." });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-border/40 bg-[hsl(var(--card))]/70 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]">
          <Code2 className="h-4 w-4" />
          Live kod yurgizgich
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-[var(--radius-md)] border border-border/60 bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground focus:border-[hsl(var(--primary))] focus:outline-none"
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-1.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Play className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
            {running ? "Bajarilmoqda" : "Run"}
          </button>
        </div>
      </div>
      <textarea
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
        className="min-h-[180px] flex-1 resize-none border-t border-border/40 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--surface))] to-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none"
      />
        <div className="border-t border-border/40 bg-[#060b18]/90 px-4 py-3 text-sm font-mono text-[13px] text-[hsl(var(--secondary-foreground))]">
          {result ? (
            <div className="space-y-2">
              {result.message && <p className="text-[hsl(var(--accent-pink))]">{result.message}</p>}
              {result.stdout && (
                <pre className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-emerald-500/25 bg-[#0b162b]/95 p-3 text-xs text-emerald-100 shadow-[0_15px_45px_rgba(6,17,38,0.45)]">{result.stdout}</pre>
              )}
              {result.stderr && (
                <pre className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-[hsl(var(--destructive))]/30 bg-[#1a0b12]/90 p-3 text-xs text-[hsl(var(--destructive))] shadow-[0_15px_45px_rgba(38,9,16,0.45)]">{result.stderr}</pre>
              )}
            {result.status && !result.message && (
              <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--primary))]">Holat: {result.status}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tizimga kirib, so'ng kodni ishga tushiring. Natijalar shu yerda paydo bo'ladi.
          </p>
        )}
      </div>
    </div>
  );
}
