import { generateStaticMetadata } from '@/lib/metadata-helpers';

export const generateMetadata = generateStaticMetadata({
  title: 'Maxfiylik siyosati',
  description: 'Foydalanuvchi maʼlumotlarini himoya qilish bo‘yicha shaffof qoidalar.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[hsl(var(--foreground))]">
      <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-8">Maxfiylik Siyosati</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          KnowHub Community sizning maxfiyligingizni himoya qilishga sodiqdir.
          Ushbu maxfiylik siyosati biz qanday ma'lumotlarni to'playmiz va ulardan qanday foydalanamiz haqida ma'lumot beradi.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">To'planadigan Ma'lumotlar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Shaxsiy ma'lumotlar (ism, email, foydalanuvchi nomi)</li>
          <li>Profil ma'lumotlari (bio, avatar)</li>
          <li>Kontent (postlar, kommentlar)</li>
          <li>Foydalanish statistikasi</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Ma'lumotlardan Foydalanish</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Xizmatlarni taqdim etish</li>
          <li>Foydalanuvchi tajribasini yaxshilash</li>
          <li>Texnik yordam ko'rsatish</li>
          <li>Xavfsizlikni ta'minlash</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Ma'lumotlar Xavfsizligi</h2>
        <p>
          Biz sizning ma'lumotlaringizni himoya qilish uchun zamonaviy xavfsizlik choralarini qo'llaymiz:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>SSL shifrlash</li>
          <li>Xavfsiz ma'lumotlar bazasi</li>
          <li>Muntazam xavfsizlik tekshiruvlari</li>
          <li>Cheklangan kirish huquqlari</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Cookie-lar</h2>
        <p>
          Biz saytning to'g'ri ishlashi va foydalanuvchi tajribasini yaxshilash uchun cookie-lardan foydalanamiz.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Uchinchi Tomon Xizmatlari</h2>
        <p>
          Biz quyidagi uchinchi tomon xizmatlaridan foydalanamiz:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>Google Analytics (statistika uchun)</li>
          <li>OAuth provayderlar (Google, GitHub)</li>
          <li>CDN xizmatlari</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Sizning Huquqlaringiz</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Ma'lumotlaringizni ko'rish huquqi</li>
          <li>Ma'lumotlarni o'zgartirish huquqi</li>
          <li>Ma'lumotlarni o'chirish huquqi</li>
          <li>Ma'lumotlar qayta ishlanishiga e'tiroz bildirish huquqi</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">Aloqa</h2>
        <p>
          Maxfiylik siyosati bo'yicha savollaringiz bo'lsa, biz bilan bog'laning:
        </p>
        <ul className="list-none mt-4">
          <li>Email: privacy@knowhub.uz</li>
          <li>Telegram: @knowhub_support</li>
        </ul>

        <p className="text-sm text-muted-foreground mt-8">
          Oxirgi yangilanish: 2025 yil yanvar
        </p>
      </div>
    </div>
  );
}