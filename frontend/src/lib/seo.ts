import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'KnowHub Community';
const DEFAULT_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "O'zbekiston va dunyo bo'ylab dasturchilar uchun hamjamiyat.";
const DEFAULT_KEYWORDS = [
  'KnowHub',
  'dasturchi',
  'programming community',
  'IT hamjamiyat',
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const buildCanonicalUrl = (path = '/') => {
  const safePath = path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    return new URL(safePath).toString();
  } catch {
    return `${siteUrl}/`;
  }
};

interface MetadataInput {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string | null;
  url?: string;
}

export const buildMetadata = ({
  title,
  description,
  keywords,
  image,
  url,
}: MetadataInput = {}): Metadata => {
  const resolvedTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedUrl = buildCanonicalUrl(url ?? '/');
  const ogImage = image || `${siteUrl}/globe.svg`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: {
      canonical: resolvedUrl,
    },
    openGraph: {
      type: 'website',
      url: resolvedUrl,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: SITE_NAME,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
};

export const getSiteName = () => SITE_NAME;
