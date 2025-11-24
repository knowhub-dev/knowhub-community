import type { ReactNode } from 'react';

import { Download, Github, Globe2, Linkedin, User } from 'lucide-react';

interface ProfileAboutProps {
  bio?: string | null;
  techStack?: string[] | null;
  socials?: { github?: string | null; linkedin?: string | null; website?: string | null } | null;
  username: string;
}

function SocialLink({ href, label, icon }: { href?: string | null; label: string; icon: ReactNode }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))]/40 px-3 py-2 text-sm text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

export function ProfileAbout({ bio, techStack, socials, username }: ProfileAboutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About & Resume</p>
          <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Who is @{username}?</h3>
        </div>
        <User className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
      </div>

      <div className="space-y-4 rounded-3xl border border-border/70 bg-[hsl(var(--card))]/80 p-6 shadow-subtle backdrop-blur">
        <div>
          <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">Bio</h4>
          {bio ? (
            <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">@{username} has not added a bio yet.</p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">Tech stack</h4>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {techStack?.length ? (
              techStack.map((tech) => (
                <span key={tech} className="rounded-full bg-[hsl(var(--muted))]/60 px-3 py-1 text-[hsl(var(--foreground))]">
                  {tech}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">Add your favourite tools.</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[hsl(var(--foreground))]">Social links</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <SocialLink href={socials?.github} label="GitHub" icon={<Github className="h-4 w-4" />} />
            <SocialLink href={socials?.linkedin} label="LinkedIn" icon={<Linkedin className="h-4 w-4" />} />
            <SocialLink href={socials?.website} label="Website" icon={<Globe2 className="h-4 w-4" />} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--muted))]/30 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Download Resume</p>
            <p className="text-xs text-muted-foreground">Showcase your professional journey.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-subtle transition hover:brightness-110">
            <Download className="h-4 w-4" /> Resume
          </button>
        </div>
      </div>
    </div>
  );
}
