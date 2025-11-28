'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Save, Globe, Github, Linkedin } from 'lucide-react';

async function getProfile() {
  const res = await api.get('/profile/me');
  return res.data;
}

async function updateProfile(data: any) {
  const res = await api.post('/profile/update', data);
  return res.data;
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
      alert(`Profilni yangilashda xatolik: ${error.response?.data?.message || error.message}`);
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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profilni tahrirlash</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        {/* Asosiy ma'lumotlar */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Asosiy ma'lumotlar</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ism</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="O'zingiz haqingizda qisqacha..."
              />
            </div>
          </div>
        </div>

        {/* Ijtimoiy havolalar */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ijtimoiy havolalar</h2>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">Veb-sayt</label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
            <div className="relative">
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">GitHub</label>
               <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://github.com/username"
              />
            </div>
            <div className="relative">
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">LinkedIn</label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                <Linkedin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Rezyume */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rezyume</h2>
          <p className="text-sm text-gray-600 mb-2">
            Bu yerga rezyumeingizni Markdown formatida joylashtirishingiz mumkin. Profilingizda u chiroyli formatda ko'rinadi va PDF shaklida yuklab olish mumkin bo'ladi.
          </p>
          <textarea
            id="resume"
            name="resume"
            rows={15}
            value={formData.resume}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            placeholder="## Ish tajribasi..."
          />
        </div>

        {/* Saqlash tugmasi */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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
