'use client';

import NewPostForm from '@/components/features/posts/NewPostForm';

export default function CreatePostPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-[hsl(var(--foreground))]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute right-10 top-24 h-80 w-80 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.08),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.1),transparent_40%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3 text-center">
          <p className="gradient-text text-xs font-semibold uppercase tracking-[0.3em]">KnowHub Creator Studio</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Glassmorphic Creator Studio</h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            Create vibrant, story-driven posts for fellow developers. Build, preview, and publish in a space that feels like a
            futuristic lab.
          </p>
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-background/60 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
          <NewPostForm />
        </div>
      </div>
    </div>
  );
}
