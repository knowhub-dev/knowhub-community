import type { StatsStripProps } from "@/components/home/sections/types";
import { CodeRunnerCard } from "@/components/home/CodeRunnerCard";
import { SystemStatusWidget } from "@/components/home/SystemStatusWidget";

export function StatsStrip({ systemStatus }: StatsStripProps) {
  return (
    <section className="max-w-6xl px-6 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <SystemStatusWidget status={systemStatus} />
        <CodeRunnerCard />
      </div>
    </section>
  );
}
