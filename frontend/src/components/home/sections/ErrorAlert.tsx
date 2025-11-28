import type { ErrorAlertProps } from "@/components/home/sections/types";

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="mx-auto max-w-4xl rounded-[var(--radius-md)] border border-[hsl(var(--accent-pink))]/40 bg-[hsl(var(--accent-pink))]/10 p-6 text-sm text-[hsl(var(--accent-pink))] dark:border-[hsl(var(--accent-pink))]/50 dark:bg-[hsl(var(--accent-pink))]/15 dark:text-[hsl(var(--accent-pink))]">
      {message}
    </div>
  );
}
