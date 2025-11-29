import { CheckCircle2, Circle, Clock3 } from 'lucide-react';

type Mission = {
  title: string;
  status: 'done' | 'in-progress' | 'pending';
  reward?: string;
};

type DailyMissionsProps = {
  missions?: Mission[];
};

const defaultMissions: Mission[] = [
  { title: 'Share a progress update', status: 'pending', reward: '+15 XP' },
  { title: 'Review a community post', status: 'in-progress', reward: '+10 XP' },
  { title: 'Help someone in #solvera-labs', status: 'done', reward: '+20 XP' },
];

export function DailyMissions({ missions }: DailyMissionsProps) {
  const items = missions?.length ? missions : defaultMissions;

  return (
    <div className="rounded-2xl border border-border/30 bg-[hsl(var(--surface-1))]/70 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily Missions</p>
          <p className="text-sm text-muted-foreground">Complete quests to keep your streak alive.</p>
        </div>
        <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Aurora+</div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map(mission => {
          const isDone = mission.status === 'done';
          const isInProgress = mission.status === 'in-progress';

          return (
            <div
              key={mission.title}
              className="flex items-start gap-3 rounded-xl border border-border/30 bg-[hsl(var(--surface-2))]/60 px-3 py-2 shadow-inner"
            >
              <div className="mt-1 text-primary">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isInProgress ? (
                  <Clock3 className="h-4 w-4 animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-border" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{mission.title}</p>
                <p className="text-xs text-muted-foreground">{mission.reward ?? 'XP reward'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
