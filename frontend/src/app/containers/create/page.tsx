'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { containerService } from '@/lib/services/containers';

const PROJECT_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function SimpleCreateContainer() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const domainSuffix = process.env.NEXT_PUBLIC_DOMAIN_SUFFIX ?? process.env.NEXT_PUBLIC_DOMAIN ?? 'knowhub.uz';

  const previewDomain = useMemo(() => {
    if (!projectName) return `your-project.${domainSuffix}`;
    return `${projectName}.${domainSuffix}`;
  }, [projectName, domainSuffix]);

  const createMutation = useMutation({
    mutationFn: () =>
      containerService.createContainer({
        name: projectName,
        image: 'nginx:alpine-slim',
        type: 'static',
      }),
    onSuccess: (container) => {
      router.push(`/dashboard/containers/${container.id}`);
    },
    onError: (mutationError: any) => {
      const message = mutationError?.response?.data?.message ?? 'Server yaratishda xatolik yuz berdi.';
      setError(message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!PROJECT_NAME_REGEX.test(projectName)) {
      setError('Loyiha nomi faqat kichik harflar, raqamlar va chiziqchalardan iborat bo‘lishi kerak.');
      return;
    }

    createMutation.mutate();
  };

  const isInvalid = projectName.length === 0 || !PROJECT_NAME_REGEX.test(projectName);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold text-primary">One-Click Deploy</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Yangi container</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Minimal sozlamalar, tezkor natija. Keyingi qadamlar uchun barcha murakkab konfiguratsiyalarni boshqaruv panelida
          topasiz.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="projectName">
              Loyiha nomi (Project Name)
            </label>
            <Input
              id="projectName"
              value={projectName}
              placeholder="my-first-website"
              onChange={(event) => setProjectName(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              required
              aria-invalid={isInvalid}
            />
            <p className="text-sm text-muted-foreground">
              Sizning manzilingiz: <span className="font-medium text-foreground">{previewDomain}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Faqat kichik harflar, raqamlar va chiziqchalar. Bo‘sh joylar avtomatik almashtiriladi.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isInvalid} isLoading={createMutation.isLoading}>
            {createMutation.isLoading ? 'Server yaratilmoqda...' : 'Serverni Yoqish 🚀'}
          </Button>
        </form>
      </div>
    </main>
  );
}
