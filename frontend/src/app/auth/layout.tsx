import type { ReactNode } from 'react';

import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Autentifikatsiya',
  description: "Kirish, ro‘yxatdan o‘tish va OAuth orqali akkauntga bog‘lanish.",
  path: '/auth',
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
