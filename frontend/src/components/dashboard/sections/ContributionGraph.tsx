import type { ContributionPoint } from '@/app/dashboard/helpers/fetchDashboard';

type ContributionGraphProps = {
  contributions?: ContributionPoint[];
  className?: string;
};

export function ContributionGraph({ contributions, className }: ContributionGraphProps) {
  const points = contributions ?? [];
  const max = points.length ? Math.max(...points.map(point => point.value), 1) : 1;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/80 p-5 shadow-soft backdrop-blur ${className ?? ''}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent" />
      <div className="relative mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Izchillik</p>
        <h3 className="text-lg font-semibold">Hissa grafigi</h3>
        <p className="text-sm text-muted-foreground">So&apos;nggi 4 haftadagi commitlar, javoblar va sharhlar.</p>
      </div>

      {points.length ? (
        <div className="relative grid grid-cols-7 gap-2">
          {points.map(point => {
            const intensity = Math.max(0.12, point.value / max);
            return (
              <div
                key={point.day}
                className="h-10 rounded-lg border border-border/30 shadow-inner transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-30px_rgba(59,130,246,0.8)]"
                style={{
                  background: `linear-gradient(180deg, rgba(99,102,241,${intensity}) 0%, rgba(167,139,250,${intensity}) 100%)`,
                }}
                title={`${point.day}: ${point.value} ta harakat`}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Hissa ma&apos;lumotlari hali mavjud emas.</p>
      )}
    </div>
  );
}
