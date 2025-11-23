import { Award, Bug, Feather, Hand, Heart, Pen, Terminal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const badgeIconMap: Record<string, LucideIcon> = {
  bug: Bug,
  feather: Feather,
  hand: Hand,
  heart: Heart,
  terminal: Terminal,
  pen: Pen,
};

export function getBadgeIcon(iconKey?: string): LucideIcon {
  if (!iconKey) {
    return Award;
  }

  return badgeIconMap[iconKey] ?? Trophy;
}
