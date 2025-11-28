import type { Metadata } from 'next';

import { buildMetadata } from './seo';

type StaticMetadataConfig = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
};

export function generateStaticMetadata({
  title,
  description,
  path,
  image,
}: StaticMetadataConfig): () => Promise<Metadata> {
  return () =>
    Promise.resolve(
      buildMetadata({
        title,
        description,
        url: path,
        image: image ?? undefined,
      }),
    );
}
