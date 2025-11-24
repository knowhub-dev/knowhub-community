import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Script from 'next/script';

import { GamificationStats } from '@/components/profile/GamificationStats';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { SolveraChatCard } from '@/components/SolveraChatCard';
import { buildCanonicalUrl, buildMetadata } from '@/lib/seo';
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

      const [postsResponse, containersResponse] = await Promise.allSettled([
        fetch(`${API_URL}/users/${username}/posts`, { cache: "no-store" }),
        fetch(`${API_URL}/users/${username}/containers`, { cache: "no-store" }),
      ]);

      if (postsResponse.status === 'fulfilled' && postsResponse.value.ok) {
        user.posts = await postsResponse.value.json();
      }

      if (containersResponse.status === 'fulfilled' && containersResponse.value.ok) {
        user.containers = await containersResponse.value.json();
      } else if (user.is_current_user) {
        try {
          const fallbackContainers = await fetch(`${API_URL}/containers`, { cache: 'no-store', credentials: 'include' });
          if (fallbackContainers.ok) {
            user.containers = await fallbackContainers.json();
          }
        } catch (fallbackError) {
          console.error('Fallback container fetch failed:', fallbackError);
        }
      }
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

      <div className="grid gap-6 lg:grid-cols-[1.45fr,0.85fr]">
        <div className="space-y-4">
          <ProfileTabs
            posts={user.posts}
            containers={user.containers}
            bio={user.bio}
            socials={user.socials}
            techStack={user.tech_stack}
            username={user.username}
          />

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
        </div>

        <GamificationStats xp={user.xp} xpTarget={xpTarget} levelLabel={levelLabel} badges={user.badges} />
      </div>

      <Script id={`profile-jsonld-${user.id}`} type="application/ld+json">
        {JSON.stringify(profileJsonLd)}
      </Script>
    </div>
  );
}

