import { generateStaticMetadata } from '@/lib/metadata-helpers';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';

export const generateMetadata = generateStaticMetadata({
  title: 'Aloqa',
  description: "Biz bilan bog‘lanish uchun aloqa manzillari va tezkor forma.",
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[hsl(var(--foreground))]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">Biz Bilan Bog'laning</h1>
        <p className="text-xl text-muted-foreground">
          Savollaringiz bormi? Biz sizga yordam berishga tayyormiz!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Aloqa Ma'lumotlari</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-[hsl(var(--primary))/15] rounded-lg flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Email</h3>
                <p className="text-muted-foreground">info@knowhub.uz</p>
                <p className="text-muted-foreground">support@knowhub.uz</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-[hsl(var(--accent-green))/15] rounded-lg flex items-center justify-center mr-4">
                <Phone className="w-6 h-6 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Telefon</h3>
                <p className="text-muted-foreground">+998 90 123 45 67</p>
                <p className="text-muted-foreground">+998 91 234 56 78</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-[hsl(var(--accent-purple))/15] rounded-lg flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-[hsl(var(--accent-purple))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Manzil</h3>
                <p className="text-muted-foreground">Toshkent shahar</p>
                <p className="text-muted-foreground">Chilonzor tumani</p>
                <p className="text-muted-foreground">O'zbekiston</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-[hsl(var(--secondary))/15] rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-[hsl(var(--secondary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Telegram</h3>
                <p className="text-muted-foreground">@knowhub_community</p>
                <p className="text-muted-foreground">@knowhub_support</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-[hsl(var(--muted))] rounded-lg">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-3">Ish Vaqti</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Dushanba - Juma:</span>
                <span>9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Shanba:</span>
                <span>10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Yakshanba:</span>
                <span>Dam olish kuni</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Xabar Yuborish</h2>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Ism Familiya
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-[hsl(var(--input))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                placeholder="Ismingizni kiriting"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-[hsl(var(--input))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Mavzu
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-3 border border-[hsl(var(--input))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              >
                <option value="">Mavzuni tanlang</option>
                <option value="general">Umumiy savol</option>
                <option value="technical">Texnik yordam</option>
                <option value="bug">Xato haqida xabar</option>
                <option value="feature">Yangi funksiya taklifi</option>
                <option value="partnership">Hamkorlik</option>
                <option value="other">Boshqa</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Xabar
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full px-4 py-3 border border-[hsl(var(--input))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                placeholder="Xabaringizni yozing..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:bg-[hsl(var(--primary))/90] transition-colors"
            >
              <Send className="w-5 h-5 mr-2" />
              Xabar Yuborish
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] text-center mb-12">Tez-tez So'raladigan Savollar</h2>

        <div className="space-y-6">
          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">KnowHub Community bepulmi?</h3>
            <p className="text-muted-foreground">
              Ha, KnowHub Community to'liq bepul platforma. Barcha asosiy funksiyalar doimo bepul bo'lib qoladi.
            </p>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Qanday qilib post yozishni boshlasam?</h3>
            <p className="text-muted-foreground">
              Avval ro'yxatdan o'ting, keyin "Post yozish" tugmasini bosing. Sarlavha, kontent va teglar qo'shing.
            </p>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">XP tizimi qanday ishlaydi?</h3>
            <p className="text-muted-foreground">
              Post yozish, komment qoldirish va ovoz olish orqali XP to'playsiz. XP sizning darajangizni oshiradi.
            </p>
          </div>

          <div className="bg-[hsl(var(--card))] p-6 rounded-lg shadow-sm border border-[hsl(var(--border))]">
            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Kod ishga tushirish xavfsizmi?</h3>
            <p className="text-muted-foreground">
              Ha, barcha kodlar xavfsiz sandbox muhitida ishga tushiriladi va sizning kompyuteringizga zarar yetkazmaydi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}