import dynamic from 'next/dynamic';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

const HomeClient = dynamic(() => import('./home-client'), { ssr: false });

export const generateMetadata = generateStaticMetadata({
  title: 'Bosh sahifa',
  description: "KnowHub Community — dasturchilar uchun bilim almashish va hamkorlik maydoni.",
  path: '/',
});

export default function HomePage() {
  return <HomeClient />;
}
