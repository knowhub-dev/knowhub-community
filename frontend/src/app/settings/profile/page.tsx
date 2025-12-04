'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Save, Globe, Github, Linkedin } from 'lucide-react';

async function getProfile() {
  const res = await api.get('/profile/me');
  return res.data;
}

async function updateProfile(data: any) {
  const { resume, ...profileData } = data;

  try {
    const profileResponse = await api.put('/profile', profileData);

    if (resume !== undefined) {
      await api.put('/profile/resume', { resume });
    }

    return profileResponse.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Noma\'lum xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';

    throw new Error(errorMessage);
  }
}

export default function ProfileSettingsPage() {
  const { user, checkUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website_url: '',
    github_url: '',
    linkedin_url: '',
    resume: '',
  });

  type ProfileData = {
    name?: string;
    bio?: string;
    website_url?: string;
    github_url?: string;
    linkedin_url?: string;
    resume?: string;
  };

  const { data: profileData, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile-settings'],
    queryFn: getProfile,
    enabled: !!user,
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        website_url: profileData.website_url || '',
        github_url: profileData.github_url || '',
        linkedin_url: profileData.linkedin_url || '',
        resume: profileData.resume || '',
      });
    }
  }, [profileData]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      checkUser(); // Update user context
      alert('Profil muvaffaqiyatli yangilandi!');
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      const userFriendlyMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Profilni yangilashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';

      alert(`Profilni yangilashda xatolik: ${userFriendlyMessage}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Profilni tahrirlash</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-border bg-[hsl(var(--card))] p-8 shadow-sm"
      >
        {/* Asosiy ma'lumotlar */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Asosiy ma'lumotlar</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Ism
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="O'zingiz haqingizda qisqacha..."
              />
            </div>
          </div>
        </div>

        {/* Ijtimoiy havolalar */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Ijtimoiy havolalar</h2>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="website_url" className="block text-sm font-medium text-foreground">
                Veb-sayt
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 pl-10 text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://example.com"
              />
            </div>
            <div className="relative">
              <label htmlFor="github_url" className="block text-sm font-medium text-foreground">
                GitHub
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 pl-10 text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://github.com/username"
              />
            </div>
            <div className="relative">
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-foreground">
                LinkedIn
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 pl-10 text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Rezyume */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Rezyume</h2>
          <p className="mb-2 text-sm text-muted-foreground">
            Bu yerga rezyumeingizni Markdown formatida joylashtirishingiz mumkin. Profilingizda u chiroyli formatda ko'rinadi va PDF shaklida yuklab olish mumkin bo'ladi.
          </p>
          <textarea
            id="resume"
            name="resume"
            rows={15}
            value={formData.resume}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 font-mono text-sm text-[hsl(var(--foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            placeholder="## Ish tajribasi..."
          />
        </div>

        {/* Saqlash tugmasi */}
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center rounded-lg bg-[hsl(var(--primary))] px-6 py-3 text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary))/90] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary-foreground))] border-t-transparent" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
