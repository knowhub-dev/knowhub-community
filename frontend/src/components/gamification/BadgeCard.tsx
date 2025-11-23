import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getBadgeIcon } from "@/lib/badgeIcons";
import { cn } from "@/lib/utils";

export interface BadgeCardProps {
  badge: {
    id: number;
    name: string;
    description?: string;
    icon_key?: string;
    level?: string;
    awarded_at?: string;
  };
}

const levelStyles: Record<string, string> = {
  bronze: "bg-orange-100/80 text-orange-800 border-orange-200",
  silver: "bg-gray-100/90 text-gray-800 border-gray-200",
  gold: "bg-yellow-100/90 text-yellow-800 border-yellow-200",
  platinum: "bg-indigo-100/90 text-indigo-800 border-indigo-200",
  default: "bg-slate-100/90 text-slate-800 border-slate-200",
};

export function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = getBadgeIcon(badge.icon_key);
  const tone = badge.level ? levelStyles[badge.level] ?? levelStyles.default : levelStyles.default;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-sm transition",
              "hover:-translate-y-1 hover:shadow-lg",
              tone
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-xl shadow-inner">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold leading-tight">{badge.name}</p>
                <p className="text-xs font-medium uppercase tracking-wide opacity-80">{badge.level ?? "Badge"}</p>
              </div>
            </div>
            {badge.awarded_at && (
              <p className="mt-4 text-[11px] font-medium opacity-80">
                Earned on {new Date(badge.awarded_at).toLocaleDateString()}
              </p>
            )}
            <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-70"
              aria-hidden
              style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45), transparent 50%)" }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm font-medium leading-relaxed text-foreground/80">
            {badge.description || "A community achievement badge."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
