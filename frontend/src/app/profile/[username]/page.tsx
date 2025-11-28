import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Script from 'next/script';

import { ProfileAbout } from '@/components/features/profile/ProfileAbout';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { ProfileOverview } from '@/components/features/profile/ProfileOverview';
import { ProfilePosts } from '@/components/features/profile/ProfilePosts';
import { ProfileProjects } from '@/components/features/profile/ProfileProjects';
import { SolveraChatCard } from '@/components/features/solvera/SolveraChatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildCanonicalUrl, buildMetadata } from '@/lib/seo';
import { isProUser } from '@/lib/user';
import { Crown, Lock, NotebookPen } from 'lucide-react';
import type { Post, User as BaseUser } from '@/types';
import type { Container } from '@/types/container';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Params {
  username: string;
}

interface Badge {
  id: number;
  name: string;
  description?: string;
  icon_key?: string;
  level?: string;
  awarded_at?: string;
}

interface UserProfile extends BaseUser {
  posts?: Post[];
  containers?: Container[];
  badges?: Badge[];
  socials?: { github?: string | null; linkedin?: string | null; website?: string | null };
  tech_stack?: string[];
  level?: (BaseUser['level'] & { max_xp?: number | null; current?: number | null }) | null;
  plan_type?: string | null;
  is_pro?: boolean;
  is_current_user?: boolean;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  try {
    const res = await fetch(`${API_URL}/users/${username}`, {
      cache: 'no-store',
    });

    if (res.status === 404) {
      notFound();
    }

    if (!res.ok) {
      return buildMetadata({ title: 'Profil topilmadi', description: 'Profil mavjud emas.' });
    }

    const user: UserProfile = await res.json();
    const description = user.bio || `${user.name} — KnowHub hamjamiyatining a'zosi.`;

    return buildMetadata({
      title: user.name,
      description,
      url: `/profile/${user.username}`,
      keywords: [user.username, user.name, 'KnowHub foydalanuvchi'],
    });
  } catch (error) {
    console.error('Metadata olishda xato:', error);
    return buildMetadata({ title: username, description: 'Profilni ko‘rsatib bo‘lmadi.' });
  }
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  let user: UserProfile | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(`${API_URL}/users/${username}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      notFound();
    }

    if (!res.ok) {
      errorMessage = "Profilni yuklab bo'lmadi. Birozdan so'ng urinib ko'ring.";
    } else {
      user = await res.json();
    }
  } catch (error) {
    console.error('Profilni olishda xato:', error);
    errorMessage = "Profilni yuklashda xizmat bilan bog'lanib bo'lmadi.";
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-[hsl(var(--foreground))]">{username} profili vaqtincha mavjud emas</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {errorMessage ?? "Noma'lum xatolik yuz berdi. Keyinroq qayta urinib ko'ring."}
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:brightness-110"
        >
          Bosh sahifaga qaytish
        </a>
      </div>
    );
  }

  const xpTarget = Math.max(
    user.level?.max_xp ?? (user.level?.min_xp ?? 0) + 5000,
    user.xp,
  );
  const xpProgress = xpTarget > 0 ? Math.min(100, (user.xp / xpTarget) * 100) : 0;
  const levelLabel = user.level?.name ?? `Level ${user.level?.id ?? 1}`;
  const isCurrentUser = Boolean(user.is_current_user);
  const isPro = isProUser(user);

  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: buildCanonicalUrl(`/profile/${user.username}`),
    description: user.bio,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <ProfileHeader
        user={user}
        xpTarget={xpTarget}
        xpProgress={xpProgress}
        isCurrentUser={isCurrentUser}
      />

      <Tabs
        defaultValue="overview"
        className="w-full space-y-6"
      >
        <TabsList className="flex flex-wrap gap-2 bg-muted/50 p-1 rounded-lg backdrop-blur-md">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            Posts & Wiki
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            About & Resume
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            <span className="inline-flex items-center gap-2">
              <NotebookPen className="h-4 w-4" /> Private Notes
              {!isPro && <Lock className="h-4 w-4 text-amber-500" />}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:zoom-in-95"
        >
          <ProfileOverview
            xp={user.xp}
            xpTarget={xpTarget}
            levelLabel={levelLabel}
            badges={user.badges}
            username={user.username}
          />
        </TabsContent>

        <TabsContent
          value="projects"
          className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:zoom-in-95"
        >
          <ProfileProjects containers={user.containers} />
        </TabsContent>

        <TabsContent
          value="posts"
          className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:zoom-in-95"
        >
          <ProfilePosts posts={user.posts} username={user.username} />
        </TabsContent>

        <TabsContent
          value="about"
          className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:zoom-in-95"
        >
          <ProfileAbout
            bio={user.bio}
            socials={user.socials}
            techStack={user.tech_stack}
            username={user.username}
          />
        </TabsContent>

        <TabsContent
          value="private"
          className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:zoom-in-95"
        >
          {isPro ? (
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50/60 p-6 shadow-[0_10px_40px_-24px_rgba(251,191,36,0.75)]">
              <div className="flex items-center gap-3 text-amber-900">
                <Crown className="h-5 w-5" />
                <div>
                  <p className="text-lg font-semibold">Pro Private Notes</p>
                  <p className="text-sm text-amber-800/80">Shaxsiy draf va g'oyalarni shu yerda saqlang, faqat sizga ko'rinadi.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-200/80 bg-white/70 p-4 text-sm text-amber-900/90">
                Bu bo'lim tez orada shaxsiy eslatmalarni qo'llab-quvvatlaydi. Hozircha pro a'zolar ustunlik belgilaridan bahramand bo'lishmoqda.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-amber-900">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-lg font-semibold">Pro xususiy eslatmalar</p>
                  <p className="text-sm text-amber-800/80">Bu xususiyat faqat Pro a'zolarga ochiq. Yangilanish orqali kirish oling.</p>
                </div>
              </div>
              <a
                href="/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)] transition hover:brightness-110"
              >
                <Crown className="h-4 w-4" /> Upgrade to Pro
              </a>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Copilot</p>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">SolVera bilan tezkor yordam</h3>
            <p className="text-sm text-muted-foreground">Bio yoki postlaringizni shu yerning o'zida takomillashtiring.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/80 to-[hsl(var(--accent-purple))]/80 text-white shadow-neon">
            <span className="text-lg font-bold">AI</span>
          </div>
        </div>
        <div className="mt-4">
          <SolveraChatCard
            context={{ surface: 'profile', username: user.username }}
            title="Yordam so'rang"
            subtitle="Bio va postlaringizni SolVera tavsiyalari bilan jilolang"
          />
        </div>
      </div>

      <Script id={`profile-jsonld-${user.id}`} type="application/ld+json">
        {JSON.stringify(profileJsonLd)}
      </Script>
    </div>
  );
}

