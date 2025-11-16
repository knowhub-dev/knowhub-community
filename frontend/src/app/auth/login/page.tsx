'use client';

import { useState } from 'react';
import type { SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';

const GoogleGlyph = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubGlyph = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kirish jarayonida xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))] px-4 py-16 text-[hsl(var(--foreground))]">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            <span className="text-xl font-semibold">KH</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Hisobingizga kiring</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Yoki{' '}
            <Link href="/auth/register" className="font-medium text-[hsl(var(--primary))] hover:underline">
              yangi hisob yarating
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-border bg-[hsl(var(--card))]/90 p-8 shadow-2xl backdrop-blur"
        >
          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email manzil
              </Label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sizning@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Parol
              </Label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Parolingiz"
                  className="pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full text-base font-semibold">
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-[hsl(var(--primary))] hover:underline">
              Parolni unutdingizmi?
            </Link>
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-border/60 bg-[hsl(var(--surface))] p-6 text-center text-sm text-muted-foreground">
          <p className="text-xs uppercase tracking-[0.3em]">Yoki</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="gap-2 border-border/70 text-sm font-medium">
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`}>
                <GoogleGlyph className="h-5 w-5" />
                Google
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2 border-border/70 text-sm font-medium">
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github/redirect`}>
                <GithubGlyph className="h-5 w-5" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
