import { ImageResponse } from 'next/og';
import { buildApiUrl } from '@/lib/api-base-url';
import { buildCanonicalUrl, getSiteName } from '@/lib/seo';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'edge';

interface PostPreview {
  title: string;
  user?: {
    name?: string;
  };
}

async function getPostPreview(slug: string): Promise<PostPreview> {
  const res = await fetch(buildApiUrl(`/posts/${slug}`), {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return {
      title: 'KnowHub Community Post',
    };
  }

  return res.json();
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostPreview(params.slug);
  const siteName = getSiteName();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '64px',
          background: 'linear-gradient(135deg, #0f172a, #0b1131)',
          color: '#e2e8f0',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 32 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#22d3ee',
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
            }}
          />
          <span>{siteName}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 64, lineHeight: 1.1, margin: 0 }}>{post.title}</h1>
          {post.user?.name ? (
            <div style={{ fontSize: 28, color: '#cbd5e1' }}>by {post.user.name}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#a5b4fc' }}>
          <span>{buildCanonicalUrl(`/posts/${params.slug}`)}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
