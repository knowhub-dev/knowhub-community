import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Script from 'next/script';
import { buildMetadata, buildCanonicalUrl } from '@/lib/seo';

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

// ✅ Static params (barcha userlarni build paytida olish)
export async function generateStaticParams(): Promise<Params[]> {
  try {
    const res = await fetch(`${API_URL}/users`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Foydalanuvchilarni olishda xato");
    }

    const payload = await res.json();
    // API might return `{ data: [...] }` or `[...]` depending on backend
    const users: User[] = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];

    return users.map((user) => ({ username: user.username }));
  } catch (error) {
    console.error("generateStaticParams xato:", error);
    return [];
  }
}

// ✅ Har bir user sahifasi
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const res = await fetch(`${API_URL}/users/${params.username}`, {
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
}

export default async function ProfilePage({ params }: { params: Params }) {
  const res = await fetch(`${API_URL}/users/${params.username}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Userni olishda xato");
  }

  const user: User = await res.json();

  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: buildCanonicalUrl(`/profile/${user.username}`),
    description: user.bio,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <img
            src={
              user.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
            }
            alt={user.name}
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">@{user.username}</p>
            {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
            <p className="mt-2 text-indigo-600 font-semibold">{user.xp} XP</p>
          </div>
        </div>
      </div>
      <Script id={`profile-jsonld-${user.id}`} type="application/ld+json">
        {JSON.stringify(profileJsonLd)}
      </Script>
    </div>
  );
}

