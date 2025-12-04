import { CheckCircle2, Circle, Clock3 } from 'lucide-react';

type Mission = {
  title: string;
  status: 'done' | 'in-progress' | 'pending';
  reward?: string;
  completion?: number;
};

type DailyMissionsProps = {
  missions?: Mission[];
};

const defaultMissions: Mission[] = [
  { title: 'Progressingizni bo‘lishing', status: 'pending', reward: '+15 XP', completion: 20 },
  { title: 'Hamjamiyat posti haqida fikr qoldiring', status: 'in-progress', reward: '+10 XP', completion: 55 },
  { title: 'Bir sherikga #solvera-labs kanalida yordam bering', status: 'done', reward: '+20 XP', completion: 100 },
];

const statusLabels: Record<Mission['status'], string> = {
  done: 'Bajarildi',
  'in-progress': 'Jarayonda',
  pending: 'Kutilmoqda',
};

const statusStyles: Record<Mission['status'], string> = {
  done: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  'in-progress': 'bg-amber-400/15 text-amber-500 dark:text-amber-300',
  pending: 'bg-border text-foreground',
};

const barColors: Record<Mission['status'], string> = {
  done: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  'in-progress': 'bg-gradient-to-r from-amber-300 to-amber-500',
  pending: 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500',
};

export function DailyMissions({ missions }: DailyMissionsProps) {
  const items = missions?.length ? missions : defaultMissions;

  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/70 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kunlik vazifalar</p>
          <p className="text-sm text-muted-foreground">Missiyalarni bajarib, seriyangizni saqlang.</p>
        </div>
        <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Aurora+</div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map(mission => {
          const isDone = mission.status === 'done';
          const isInProgress = mission.status === 'in-progress';
          const completion = Math.max(
            0,
            Math.min(100, Math.round(mission.completion ?? (isDone ? 100 : isInProgress ? 50 : 0))),
          );

          return (
            <div
              key={mission.title}
              className="flex flex-col gap-3 rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/60 px-3 py-3 shadow-inner sm:px-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-primary">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isInProgress ? (
                    <Clock3 className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Circle className="h-4 w-4 text-border" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="text-sm font-semibold text-foreground">{mission.title}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                      <span className={`rounded-full px-2 py-1 ${statusStyles[mission.status]}`}>
                        {statusLabels[mission.status]}
                      </span>
                      {mission.reward && (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{mission.reward}</span>
                      )}
                      <span className="rounded-full bg-[hsl(var(--surface-1))]/80 px-2 py-1 text-foreground">{completion}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full ${barColors[mission.status]}`}
                        style={{ width: `${completion}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground sm:min-w-[120px] sm:text-right">
                      Jarayon: {completion}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
