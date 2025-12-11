import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, Phone, Instagram } from 'lucide-react';

const communityLinks = [
  { href: '/posts', label: 'Postlar' },
  { href: '/wiki', label: 'Wiki' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/containers', label: 'Mini-serverlar' },
  { href: '/pricing', label: 'Narxlar' },
];

const supportLinks = [
  { href: '/help', label: 'Yordam markazi' },
  { href: '/changelog', label: "O'zgarishlar" },
  { href: '/status', label: 'Tizim holati' },
  { href: '/sitemap', label: 'Sayt xaritasi' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-surface/95 text-sm text-muted-foreground backdrop-blur-md">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/60 via-secondary/40 to-accent-purple/50" />
      <div className="container grid gap-10 py-12 lg:grid-cols-[2fr,1fr,1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary-light to-secondary text-sm font-semibold text-white shadow-neon">
              KH
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">KnowHub Community</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Futuristic dev platform</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            KnowHub — hamjamiyat, tajriba va hamkorlik uchun yaratilgan ochiq platforma. Mini-serverlar, wiki va gamifikatsiya bilan o'sishni tezlashtiring.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <a
              href="https://github.com/knowhub-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/knowhub_community"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
              aria-label="Telegram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@knowhub_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
              aria-label="YouTube"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/knowhub_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/knowhub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface/85 text-muted-foreground transition hover:border-primary/50 hover:bg-surface/95 hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Hamjamiyat</p>
          <ul className="grid gap-2">
            {communityLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Aloqa</p>
          <ul className="grid gap-2 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-secondary" />
              <a href="mailto:info@knowhub.uz" className="transition hover:text-foreground">
                info@knowhub.uz
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-secondary" />
              <a href="https://t.me/knowhub_support" target="_blank" rel="noopener noreferrer" className="transition hover:text-foreground">
                @knowhub_support
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-secondary" />
              <span>Toshkent, O'zbekiston</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 bg-surface/90">
        <div className="container flex flex-col gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} KnowHub Community. Barcha huquqlar himoyalangan.</p>
          <div className="flex flex-wrap items-center gap-4">
            {supportLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
