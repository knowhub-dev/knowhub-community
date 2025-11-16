import { Calendar, Code, Users } from 'lucide-react';

type ChangeType = 'added' | 'changed' | 'fixed' | 'removed';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: Array<{
    type: ChangeType;
    description: string;
  }>;
}

const TYPE_STYLES: Record<ChangeType, string> = {
  added: 'bg-accent-green/20 text-accent-green border-accent-green/40',
  changed: 'bg-primary/20 text-primary border-primary/30',
  fixed: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  removed: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30',
};

const VERSION_STYLES: Record<ChangelogEntry['type'], string> = {
  major: 'bg-secondary/20 text-secondary border-secondary/40',
  minor: 'bg-primary/20 text-primary border-primary/40',
  patch: 'bg-accent-green/20 text-accent-green border-accent-green/40',
};

export default function ChangelogPage() {
  const changelog: ChangelogEntry[] = [
    {
      version: '1.1.0',
      date: '2025-01-18',
      type: 'minor',
      title: 'Teal Pulse yangilanishi',
      description:
        "Frontend va backend aloqalari uyg'unlashtirildi, cookie roziligi hamda umumiy dizayn auditidan keyingi yaxshilanishlar ishga tushdi.",
      changes: [
        { type: 'added', description: 'CookieNotice komponenti orqali nozik, qalqib chiquvchi rozilik oynasi' },
        { type: 'changed', description: 'Navbar, Sidebar, qidiruv, teglar va auth formalarini yangi yashil-ko\'k palitraga moslashtirish' },
        { type: 'fixed', description: 'Shadcn Button asChild ishlatilganda React.Children.only xatosi' },
        { type: 'fixed', description: 'API interceptor tokenni qayta yuklash paytida ham ulab turishi va 401 javoblarida keshni tozalashi' },
        { type: 'added', description: 'Changelog sahifasiga ushbu versiya hikoyalari qo\'shildi' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-01-15',
      type: 'major',
      title: 'Barqaror Asos (Stable Foundation)',
      description: 'KnowHub Community ning birinchi barqaror versiyasi. Barcha asosiy funksiyalar ishga tayyor.',
      changes: [
        { type: 'added', description: 'Post yaratish va ko\'rish tizimi' },
        { type: 'added', description: 'Foydalanuvchi autentifikatsiyasi (Email + OAuth)' },
        { type: 'added', description: 'Komment tizimi va nested replies' },
        { type: 'added', description: 'Ovoz berish tizimi (upvote/downvote)' },
        { type: 'added', description: 'XP va gamifikatsiya tizimi' },
        { type: 'added', description: 'Wiki maqolalar' },
        { type: 'added', description: 'Kod ishga tushirish (JavaScript, Python, PHP)' },
        { type: 'added', description: 'AI tavsiyalar (OpenAI integration)' },
        { type: 'added', description: 'Admin panel va moderatsiya' },
        { type: 'added', description: 'Responsive dizayn va mobile support' },
        { type: 'added', description: 'Shared hosting support' },
        { type: 'fixed', description: 'Barcha 404 xatolar tuzatildi' },
        { type: 'fixed', description: 'Frontend va backend API integration' },
        { type: 'changed', description: 'Bosh sahifa dizayni yangilandi' },
        { type: 'changed', description: 'Performance optimizatsiya' },
      ]
    },
    {
      version: '0.9.0',
      date: '2025-01-10',
      type: 'minor',
      title: 'Beta Versiya',
      description: 'Asosiy funksiyalar va test rejimi.',
      changes: [
        { type: 'added', description: 'Asosiy post va komment tizimi' },
        { type: 'added', description: 'Foydalanuvchi ro\'yxatdan o\'tish' },
        { type: 'added', description: 'Kategoriya va teglar' },
        { type: 'fixed', description: 'Database migratsiya muammolari' },
      ]
    },
    {
      version: '0.5.0',
      date: '2025-01-05',
      type: 'minor',
      title: 'Alpha Versiya',
      description: 'Dastlabki prototip va asosiy arxitektura.',
      changes: [
        { type: 'added', description: 'Laravel backend arxitektura' },
        { type: 'added', description: 'Next.js frontend setup' },
        { type: 'added', description: 'Database schema dizayni' },
        { type: 'added', description: 'Asosiy UI komponentlar' },
      ]
    }
  ];

  const getTypeColor = (type: ChangeType) => TYPE_STYLES[type] ?? 'bg-muted text-foreground border-border';

  const getTypeIcon = (type: ChangeType) => {
    switch (type) {
      case 'added':
        return '✨';
      case 'changed':
        return '🔄';
      case 'fixed':
        return '🐛';
      case 'removed':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getVersionColor = (type: ChangelogEntry['type']) => VERSION_STYLES[type];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-accent-purple to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">O'zgarishlar Tarixi</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              KnowHub Community platformasining barcha yangilanishlari va o'zgarishlari
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Version */}
        <div className="bg-gradient-to-r from-primary via-accent-purple to-secondary rounded-lg p-6 mb-8 text-white shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Joriy Versiya: {changelog[0].version}</h2>
              <p className="text-white/80">{changelog[0].title}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Chiqarilgan</div>
              <div className="font-semibold">{new Date(changelog[0].date).toLocaleDateString('uz-UZ')}</div>
            </div>
          </div>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelog.map(entry => (
            <div key={entry.version} className="bg-card rounded-lg shadow-sm border border-border/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVersionColor(entry.type)}`}>
                    v{entry.version}
                  </span>
                  <h3 className="text-xl font-bold">{entry.title}</h3>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(entry.date).toLocaleDateString('uz-UZ')}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{entry.description}</p>

              <div className="space-y-3">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex items-start space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(change.type)}`}>
                      {getTypeIcon(change.type)} {change.type.toUpperCase()}
                    </span>
                    <p className="text-foreground/90 flex-1">{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div className="mt-12 bg-gradient-to-br from-surface to-surface/70 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">🚀 Kelajak Rejalari</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Versiya 1.1.0 - "Hamjamiyat Kengayishi"
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>• Guruhlar va qiziqish klublari</li>
                <li>• Mentorship dasturi</li>
                <li>• Jonli Q&A sessiyalari</li>
                <li>• Kod review xizmati</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Versiya 1.2.0 - "Bilim Markazi"
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>• Interaktiv darslar va kurslar</li>
                <li>• Kodlash challenge'lari</li>
                <li>• Skill badgelari va sertifikatlar</li>
                <li>• Ish e'lonlari bo'limi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}