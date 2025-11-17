import { Users, Target, Heart, Code, Globe, Award } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[hsl(var(--foreground))]">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-6">Biz Haqimizda</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          KnowHub Community - O'zbekiston va butun dunyo bo'ylab dasturchilar hamjamiyatini
          birlashtiruvchi ochiq platforma. Bizning maqsadimiz bilim almashish, hamkorlikda
          loyihalar yaratish va yangi texnologiyalarni o'zlashtirishni osonlashtirish.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-[hsl(var(--card))] p-8 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-[hsl(var(--primary))] mr-3" />
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Bizning Maqsadimiz</h2>
          </div>
          <p className="text-muted-foreground">
            O'zbekiston dasturchilar hamjamiyatini rivojlantirish, bilim almashish uchun
            qulay muhit yaratish va har bir dasturchining professional o'sishiga yordam berish.
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] p-8 rounded-lg shadow-sm border border-[hsl(var(--border))]">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-[hsl(var(--accent-pink))] mr-3" />
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Bizning Qadriyatlarimiz</h2>
          </div>
          <p className="text-muted-foreground">
            Ochiqlik, hamkorlik, o'zaro yordam va doimiy o'rganish. Biz har bir
            hamjamiyat a'zosining fikri va hissasini qadrlaymiz.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] text-center mb-12">Nima Taklif Qilamiz</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[hsl(var(--primary))/15] rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">Kod Ishga Tushirish</h3>
            <p className="text-muted-foreground">
              JavaScript, Python, PHP kodlarini to'g'ridan-to'g'ri brauzerda ishga tushiring
              va natijani real vaqtda ko'ring.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[hsl(var(--accent-green))/15] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[hsl(var(--accent-green))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">Hamjamiyat</h3>
            <p className="text-muted-foreground">
              Minglab dasturchilar bilan bog'laning, tajriba almashing va
              professional tarmoqingizni kengaytiring.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[hsl(var(--secondary))/15] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-[hsl(var(--secondary))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">Gamifikatsiya</h3>
            <p className="text-muted-foreground">
              XP to'plang, darajangizni oshiring, badglar qo'lga kiriting va
              reyting jadvalida yuqoriga chiqing.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[hsl(var(--muted))] p-8 rounded-lg mb-16">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] text-center mb-8">Bizning Yutuqlarimiz</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[hsl(var(--primary))] mb-2">1000+</div>
            <div className="text-muted-foreground">Foydalanuvchilar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[hsl(var(--accent-green))] mb-2">5000+</div>
            <div className="text-muted-foreground">Postlar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[hsl(var(--accent-purple))] mb-2">15000+</div>
            <div className="text-muted-foreground">Kommentlar</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[hsl(var(--secondary))] mb-2">100+</div>
            <div className="text-muted-foreground">Wiki Maqolalar</div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] text-center mb-12">Bizning Jamoa</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <img
              src="https://ui-avatars.com/api/?name=Founder&background=6366f1&color=fff&size=128"
              alt="Founder"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Asos Soluvchi</h3>
            <p className="text-muted-foreground mb-3">CEO & Founder</p>
            <p className="text-sm text-muted-foreground">
              10+ yillik tajribaga ega senior dasturchi va texnologiya sohasidagi yetakchi.
            </p>
          </div>

          <div className="text-center">
            <img
              src="https://ui-avatars.com/api/?name=Tech+Lead&background=10b981&color=fff&size=128"
              alt="Tech Lead"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Texnik Rahbar</h3>
            <p className="text-muted-foreground mb-3">CTO & Tech Lead</p>
            <p className="text-sm text-muted-foreground">
              Full-stack dasturchi va arxitektor, platformaning texnik tomonini boshqaradi.
            </p>
          </div>

          <div className="text-center">
            <img
              src="https://ui-avatars.com/api/?name=Community&background=f59e0b&color=fff&size=128"
              alt="Community Manager"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Hamjamiyat Menejeri</h3>
            <p className="text-muted-foreground mb-3">Community Manager</p>
            <p className="text-sm text-muted-foreground">
              Hamjamiyat bilan ishlash va foydalanuvchilar tajribasini yaxshilash bo'yicha mutaxassis.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[hsl(var(--primary))] p-8 rounded-lg text-center text-[hsl(var(--primary-foreground))]">
        <h2 className="text-3xl font-bold mb-4">Bizga Qo'shiling!</h2>
        <p className="text-xl text-[hsl(var(--primary-foreground))]/80 mb-6">
          O'zbekiston dasturchilar hamjamiyatining bir qismi bo'ling va karyerangizni rivojlantiring.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-3 bg-[hsl(var(--background))] text-[hsl(var(--primary))] rounded-lg font-semibold border border-transparent hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Ro'yxatdan O'tish
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 border-2 border-[hsl(var(--primary-foreground))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
          >
            <Globe className="w-5 h-5 mr-2" />
            Biz Bilan Bog'laning
          </Link>
        </div>
      </div>
    </div>
  );
}