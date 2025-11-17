'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Target, Heart, Code, Globe, Award } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

type PublicStatsResponse = {
  users?: { total?: number };
  posts?: { total?: number };
  comments?: { total?: number };
  wiki?: { articles?: number };
};

type AboutContentResponse = {
  hero?: { title?: string; subtitle?: string };
  mission?: { title?: string; description?: string };
  values?: { title?: string; description?: string };
  features?: { title: string; description: string; icon: 'code' | 'users' | 'award' }[];
  team?: { title: string; role: string; description: string; avatar_url?: string }[];
  cta?: { title?: string; description?: string; primary_label?: string; secondary_label?: string };
};

const featureIconMap = {
  code: Code,
  users: Users,
  award: Award,
};

async function fetchPublicStats() {
  const res = await api.get('/stats/public');
  return res.data as PublicStatsResponse;
}

async function fetchAboutContent() {
  const res = await api.get('/content/about');
  return res.data as AboutContentResponse;
}

export default function AboutPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({ queryKey: ['stats', 'public'], queryFn: fetchPublicStats });

  const {
    data: content,
    isLoading: contentLoading,
    error: contentError,
  } = useQuery({ queryKey: ['content', 'about'], queryFn: fetchAboutContent });

  const isLoading = statsLoading || contentLoading;
  const hasError = statsError || contentError;

  const featureCards = useMemo(() => {
    return content?.features ?? [];
  }, [content?.features]);

  const teamMembers = useMemo(() => {
    return content?.team ?? [];
  }, [content?.team]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ma'lumotlarni yuklashda xatolik yuz berdi</h2>
        <p className="text-gray-600">Iltimos, sahifani qayta yuklab ko'ring.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{content?.hero?.title || "Ma'lumot topilmadi"}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {content?.hero?.subtitle || "Hozircha sahifa mazmuni mavjud emas."}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">{content?.mission?.title || 'Maqsad'}</h2>
          </div>
          <p className="text-gray-600">
            {content?.mission?.description || "Maqsad bo'yicha ma'lumot hali tayyor emas."}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">{content?.values?.title || 'Qadriyatlar'}</h2>
          </div>
          <p className="text-gray-600">
            {content?.values?.description || "Qadriyatlar haqida ma'lumot topilmadi."}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nima Taklif Qilamiz</h2>
        {featureCards.length === 0 ? (
          <p className="text-center text-gray-600">Funksionallar bo'yicha ma'lumot topilmadi.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((feature, index) => {
              const Icon = featureIconMap[feature.icon] || Globe;
              return (
                <div className="text-center" key={`${feature.title}-${index}`}>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Bizning Yutuqlarimiz</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">{stats?.users?.total ?? '—'}</div>
            <div className="text-gray-600">Foydalanuvchilar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats?.posts?.total ?? '—'}</div>
            <div className="text-gray-600">Postlar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats?.comments?.total ?? '—'}</div>
            <div className="text-gray-600">Kommentlar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats?.wiki?.articles ?? '—'}</div>
            <div className="text-gray-600">Wiki Maqolalar</div>
          </div>
        </div>
        {!stats && (
          <p className="text-center text-gray-600 mt-6">Statistik ma'lumotlar topilmadi.</p>
        )}
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Bizning Jamoa</h2>
        {teamMembers.length === 0 ? (
          <p className="text-center text-gray-600">Jamoa ma'lumotlari hozircha mavjud emas.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div className="text-center" key={`${member.title}-${index}`}>
                <img
                  src={member.avatar_url || 'https://ui-avatars.com/api/?name=KnowHub&background=6366f1&color=fff&size=128'}
                  alt={member.title}
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.title}</h3>
                <p className="text-gray-600 mb-3">{member.role}</p>
                <p className="text-sm text-gray-500">{member.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 p-8 rounded-lg text-center text-white">
        <h2 className="text-3xl font-bold mb-4">{content?.cta?.title || "Hamjamiyatga qo'shiling"}</h2>
        <p className="text-xl text-indigo-100 mb-6">
          {content?.cta?.description || "Yangi texnologiyalarni birga o'rganish uchun platformamizga qo'shiling."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            {content?.cta?.primary_label || "Ro'yxatdan o'tish"}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
          >
            <Globe className="w-5 h-5 mr-2" />
            {content?.cta?.secondary_label || "Biz bilan bog'laning"}
          </Link>
        </div>
      </div>
    </div>
  );
}
