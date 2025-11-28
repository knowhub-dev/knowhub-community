'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, ExternalLink, Github, Globe2, Layers, Link2, Linkedin, Pin, ScrollText, Sparkles } from 'lucide-react';

import ContainerCard from '@/components/features/containers/ContainerCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/types';
import { Container } from '@/types/container';

interface ProfileTabsProps {
  posts?: Post[] | null;
  containers?: Container[] | null;
  bio?: string | null;
  socials?: { github?: string | null; linkedin?: string | null; website?: string | null } | null;
  techStack?: string[] | null;
  username: string;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

function PostPreview({ post }: { post: Post }) {
  const excerpt = useMemo(() => {
    const clean = post.content_markdown.replace(/[#*_>`]/g, ' ').replace(/\s+/g, ' ').trim();
    return clean.length > 140 ? `${clean.slice(0, 140)}…` : clean;
  }, [post.content_markdown]);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-[hsl(var(--card))]/80 p-4 shadow-subtle backdrop-blur transition hover:-translate-y-0.5 hover:shadow-neon">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/posts/${post.slug}`} className="text-lg font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]">
            {post.title}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{formatDate(post.created_at)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-[hsl(var(--accent-purple))]" /> {post.score} kudos
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {post.tags?.map((tag) => (
          <span key={tag.slug} className="rounded-full bg-[hsl(var(--muted))]/50 px-3 py-1">#{tag.name}</span>
        ))}
      </div>
    </article>
  );
}

export function ProfileTabs({ posts, containers, bio, socials, techStack, username }: ProfileTabsProps) {
  const [tab, setTab] = useState('overview');
  const pinnedPosts = posts?.slice(0, 2) ?? [];

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="sticky top-0 z-10 -mx-1 rounded-full bg-[hsl(var(--background))]/85 px-1 py-1 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <TabsList className="w-full justify-between gap-1 bg-[hsl(var(--muted))]/50 p-1">
          <TabsTrigger value="overview" className="w-full text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="deployments" className="w-full text-xs sm:text-sm">Deployments</TabsTrigger>
          <TabsTrigger value="posts" className="w-full text-xs sm:text-sm">Posts</TabsTrigger>
          <TabsTrigger value="about" className="w-full text-xs sm:text-sm">About</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pinned posts</p>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Highlights</h3>
              </div>
              <Pin className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
            </div>
            <div className="mt-4 space-y-3">
              {pinnedPosts.length ? (
                pinnedPosts.map((post) => <PostPreview key={post.id} post={post} />)
              ) : (
                <p className="text-sm text-muted-foreground">No pinned posts yet. Start sharing your learnings!</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</p>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Deploys & posts</h3>
              </div>
              <Activity className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
            </div>
            <div className="mt-4 space-y-3">
              {containers?.slice(0, 3).map((container) => (
                <div key={container.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-[hsl(var(--accent-blue))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">{container.name}</p>
                      <p className="text-xs text-muted-foreground">{container.image}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[hsl(var(--surface))] px-3 py-1 text-xs capitalize text-muted-foreground">{container.status}</span>
                </div>
              ))}
              {posts?.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <ScrollText className="h-4 w-4 text-[hsl(var(--accent-purple))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <Link href={`/posts/${post.slug}`} className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">
                    Read <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
              {!containers?.length && !posts?.length && (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="deployments" className="space-y-4">
        <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-4 shadow-subtle backdrop-blur">
          <div className="flex items-center justify-between px-2 pb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mini-services</p>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Deployed containers</h3>
            </div>
            <Layers className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
          </div>
          {containers?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {containers.map((container) => (
                <ContainerCard key={container.id} container={container} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 px-6 py-10 text-center text-sm text-muted-foreground">
              You have not deployed any containers yet. Launch your first mini-service to showcase it here.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="posts" className="space-y-3">
        {posts?.length ? (
          posts.map((post) => <PostPreview key={post.id} post={post} />)
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-[hsl(var(--muted))]/40 p-6 text-sm text-muted-foreground">
            @{username} has not published any posts yet.
          </div>
        )}
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <div className="rounded-3xl border border-border/70 bg-[hsl(var(--card))]/70 p-6 shadow-subtle backdrop-blur">
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">About {username}</h3>
          {bio ? <p className="mt-2 text-muted-foreground">{bio}</p> : <p className="text-sm text-muted-foreground">No bio provided.</p>}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-[hsl(var(--surface))]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Socials</p>
              <div className="mt-2 space-y-2 text-sm">
                <SocialLink href={socials?.github} label="GitHub" icon={<Github className="h-4 w-4" />} />
                <SocialLink href={socials?.linkedin} label="LinkedIn" icon={<Linkedin className="h-4 w-4" />} />
                <SocialLink href={socials?.website} label="Website" icon={<Globe2 className="h-4 w-4" />} />
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-[hsl(var(--surface))]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {techStack?.length ? (
                  techStack.map((tech) => (
                    <span key={tech} className="rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-[hsl(var(--foreground))]">{tech}</span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Add your favourite tools.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SocialLink({ href, label, icon }: { href?: string | null; label: string; icon: ReactNode }) {
  if (!href) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))]/50 text-muted-foreground">{icon}</span>
        <span className="text-sm">{label} not added</span>
      </div>
    );
  }

  return (
    <Link href={href} className="flex items-center gap-2 text-[hsl(var(--primary))] transition hover:text-[hsl(var(--accent-blue))]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))]/50 text-[hsl(var(--foreground))]">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
      <Link2 className="h-3 w-3" />
    </Link>
  );
}

