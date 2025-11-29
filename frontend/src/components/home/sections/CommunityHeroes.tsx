import { Award, Medal, Trophy } from 'lucide-react';

import type { CommunityHero } from '@/app/home/helpers/fetchHome';

const placeholders: CommunityHero[] = [
  {
    name: 'NodeNinja',
    role: 'Backend Lead',
    highlight: 'Microservices best practices',
    badges: ['Expert', 'Top writer'],
  },
  {
    name: 'FrontendFox',
    role: 'Design Systems',
    highlight: 'Premium Aurora contributor',
    badges: ['UI', 'Accessibility'],
  },
  {
    name: 'DataDruid',
    role: 'ML Engineer',
    highlight: 'Vector search playbook',
    badges: ['ML', 'Search'],
  },
];

type CommunityHeroesProps = {
  heroes: CommunityHero[];
};

export function CommunityHeroes({ heroes }: CommunityHeroesProps) {
  const list = heroes.length ? heroes.slice(0, 3) : placeholders;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">Jamiyat qahramonlari</p>
        <h3 className="text-xl font-semibold text-foreground">Eng faol mualliflar va murabbiylar</h3>
      </div>
      <div className="grid gap-4">
        {list.map((hero, index) => (
          <div
            key={`${hero.id ?? index}-${hero.name}`}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface-1/80 p-5 shadow-soft backdrop-blur-xs"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/10" aria-hidden />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {index === 0 ? <Trophy className="h-5 w-5" /> : index === 1 ? <Medal className="h-5 w-5" /> : <Award className="h-5 w-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{hero.name}</p>
                <p className="text-xs text-muted-foreground">{hero.role ?? 'Community mentor'}</p>
                <p className="text-sm text-foreground">{hero.highlight ?? hero.impact ?? 'Hamjamiyatdagi faol hissasi'}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {hero.badges?.map((badge) => (
                    <span key={badge} className="rounded-full bg-surface-2/80 px-3 py-1 text-foreground">
                      {badge}
                    </span>
                  ))}
                  {hero.contributions ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{hero.contributions}+ hissa</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
