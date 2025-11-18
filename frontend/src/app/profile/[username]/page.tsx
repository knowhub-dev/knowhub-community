import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Script from 'next/script';
import Link from "next/link";
import { buildMetadata, buildCanonicalUrl } from '@/lib/seo';
import { SolveraChatCard } from '@/components/SolveraChatCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// API URL-ni o'z muhitiga qarab almashtir
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Params {
  username: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  xp: number;
}

// ✅ Har bir user sahifasi
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

    const user: User = await res.json();
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
  let user: User | null = null;
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
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:brightness-110"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: buildCanonicalUrl(`/profile/${user.username}`),
    description: user.bio,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="rounded-3xl border border-border bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={
                user.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
              }
              alt={user.name}
              className="h-20 w-20 rounded-full border border-border object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{user.name}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.bio && <p className="mt-2 text-sm text-[hsl(var(--foreground))]">{user.bio}</p>}
              <p className="mt-2 text-sm font-semibold text-[hsl(var(--primary))]">{user.xp} XP</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-[hsl(var(--surface))] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
            <p className="font-semibold">SolVera yordamida profilni boyiting</p>
            <p className="text-xs text-muted-foreground">Bio va postlaringizni SolVera (gtp-5) tavsiyalari bilan jilolang.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-border bg-[hsl(var(--card))]/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Hamjamiyatdagi ishtirok</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            SolVera beta foydalanuvchilarga post yozish, bio va izohlarni silliqlashda yordam beradi. Profilingizni boyitish va yangi postlar yaratishda uni ishga soling.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--foreground))]">
            <li>• Shaxsiy bio matnini qisqa va ta'sirchan qiling.</li>
            <li>• Postlaringiz uchun sarlavha va changeloglarni tayyorlang.</li>
            <li>• Kod sharhlari va savollarni aniqroq yozing.</li>
          </ul>
          <Link
            href="/solvera"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-110"
          >
            SolVera haqida batafsil
          </Link>
        </div>
        <SolveraChatCard
          context={{ surface: 'profile', username: user.username }}
          title="SolVera bilan tezkor yordam"
          subtitle="Bio yoki postlaringizni shu yerning o'zida takomillashtiring"
        />
      </div>

      <Script id={`profile-jsonld-${user.id}`} type="application/ld+json">
        {JSON.stringify(profileJsonLd)}
      </Script>
    </div>
  );
}

