import { MessageCircle, Book, Users, Code, Award, Search } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[hsl(var(--foreground))]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">Yordam Markazi</h1>
        <p className="text-xl text-muted-foreground">KnowHub Community dan qanday foydalanishni o'rganing</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <Book className="w-8 h-8 text-[hsl(var(--primary))] mr-3" />
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Post Yozish</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Dasturlash bo'yicha savollar bering, tajribangizni baham ko'ring va boshqalardan o'rganing.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Aniq va tushunarli sarlavha yozing</li>
            <li>• Markdown formatidan foydalaning</li>
            <li>• Teglar qo'shing</li>
            <li>• Kod namunalarini kiriting</li>
          </ul>
        </div>

        <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-8 h-8 text-[hsl(var(--accent-green))] mr-3" />
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Komment Qoldirish</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Postlarga javob bering, o'z fikringizni bildiring va muhokamaga qo'shiling.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Foydali va konstruktiv javoblar bering</li>
            <li>• Kod namunalari bilan tushuntiring</li>
            <li>• Boshqa kommentlarga javob bering</li>
            <li>• Hurmatli munosabatda bo'ling</li>
          </ul>
        </div>

        <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <Award className="w-8 h-8 text-[hsl(var(--secondary))] mr-3" />
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">XP va Darajalar</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Faoliyatingiz uchun XP to'plang, darajangizni oshiring va badglar qo'lga kiriting.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Post yozish: +10 XP</li>
            <li>• Komment qoldirish: +5 XP</li>
            <li>• Ovoz olish: +5 XP</li>
            <li>• Kuzatuvchi qo'shish: +2 XP</li>
          </ul>
        </div>

        <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <Code className="w-8 h-8 text-[hsl(var(--accent-purple))] mr-3" />
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Kod Ishga Tushirish</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            JavaScript, Python, PHP kodlarini to'g'ridan-to'g'ri brauzerda ishga tushiring.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Qo'llab-quvvatlanadigan tillar: JS, Python, PHP</li>
            <li>• Xavfsiz sandbox muhitida ishlaydi</li>
            <li>• Natijani real vaqtda ko'ring</li>
            <li>• Xatolarni aniqlang va tuzating</li>
          </ul>
        </div>
      </div>

      <div className="bg-[hsl(var(--muted))] p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Qo'shimcha Yordam Kerakmi?</h2>
          <p className="text-muted-foreground mb-6">
            Agar savolingizga javob topa olmagan bo'lsangiz, biz bilan bog'laning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:bg-[hsl(var(--primary))/90] transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Biz Bilan Bog'laning
            </Link>
            <Link
              href="/posts"
              className="inline-flex items-center px-6 py-3 border border-[hsl(var(--primary))] text-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary))/10] transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Postlarni Ko'rish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}