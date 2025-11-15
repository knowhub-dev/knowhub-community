# 🌐 KnowHub Community
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Contributors](https://img.shields.io/github/contributors/knowhub-dev/knowhub-community.svg)]()
[![Issues](https://img.shields.io/github/issues/knowhub-dev/knowhub-community.svg)]()
[![Stars](https://img.shields.io/github/stars/knowhub-dev/knowhub-community.svg?style=social)]()

KnowHub Community — bu O'zbekiston va butun dunyo bo'ylab dasturchilar hamjamiyatini birlashtiruvchi ochiq platforma.  
🎯 Maqsadimiz — bilim almashish, hamkorlikda loyihalar yaratish va yangi texnologiyalarni o'zlashtirishni osonlashtirish.

---

## ✨ Asosiy imkoniyatlar
📢 Postlar va maqolalar — Jamiyat a'zolari tomonidan yozilgan, trendga chiqqan yoki yangi maqolalar.  
💬 Izohlar va muhokamalar — Har bir post ostida fikr almashish.  
🏷 Teglar va toifalar — Kontentni mavzular bo'yicha tartiblash.  
📚 Wiki — Hamkorlikda tahrirlanadigan bilim bazasi.  
🧑‍💻 Kod ishga tushirish (Code Runner) — Kod namunalari ustida interaktiv ishlash.  
🔐 OAuth va Email autentifikatsiya — Google, GitHub yoki email orqali kirish.  
🎯 Trend algoritmlari — Eng ko'p ovoz to'plagan va eng faol postlar ro'yxati.
👥 Foydalanuvchilar tizimi — Profil, kuzatish, reyting jadvali.
📊 Dashboard va analitika — Shaxsiy statistika va jamiyat ko'rsatkichlari.
🔔 Real-time bildirishnomalar — Yangi kommentlar, ovozlar va kuzatuvchilar haqida xabarlar.
⭐ Saqlangan postlar — Kerakli postlarni bookmark qilish imkoniyati.
🏆 Gamifikatsiya — XP, darajalar, badglar va yutuqlar tizimi.

---

## 🛠 Texnologiyalar

### Backend:
- ⚡ Laravel 12 (PHP 8+)  
- 🔑 Laravel Sanctum (API autentifikatsiya)  
- 🗄️ MySQL / PostgreSQL  
- 🌐 RESTful API arxitekturasi
- 📦 Redis (kesh va sessiyalar)
- 🔄 Queue system (background jobs)
- 🤖 OpenAI integration (AI tavsiyalar)

### Frontend:
- ⚛️ Next.js 14 (App Router)  
- 📘 TypeScript  
- 🎨 Tailwind CSS  
- 🔌 Axios (API chaqiriqlari uchun)
- 🔄 React Query (server state management)
- 🎯 Zustand (client state management)
- 📊 Chart.js (grafik va diagrammalar)

### DevOps:
- 🐳 Docker va Docker Compose
- 🌐 Nginx (reverse proxy va load balancer)
- 🔒 SSL/TLS encryption
- 📈 Supervisor (process management)
- 🚀 Production-ready deployment

---

## 🚀 O'rnatish

### Talablar
- PHP 8.2+  
- Composer  
- Node.js 18+  
- MySQL yoki PostgreSQL
- Redis
- Git
- Docker va Docker Compose (production uchun)

### O'rnatish bosqichlari

#### 1. Loyihani klonlash
```bash
git clone https://github.com/knowhub-dev/knowhub-community.git
cd knowhub-community
```

#### 2. Backend (Laravel API)ni ishga tushirish
```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve # API http://localhost:8000 da ishlaydi
```

#### 3. Frontend (Next.js UI)ni ishga tushirish
```bash
cd frontend
npm install

echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local
echo "NEXT_PUBLIC_SITE_NAME=KnowHub Community" >> .env.local
echo "NEXT_PUBLIC_SITE_DESCRIPTION=O'zbekiston va dunyo bo'ylab dasturchilar hamjamiyati." >> .env.local

npm run dev # UI http://localhost:3000 da ishlaydi
```

#### 4. Qo'shimcha servislar (ixtiyoriy)
```bash
# Queue worker (background jobs uchun)
php artisan queue:work

# Schedulerni lokalda ishga tushirish
php artisan schedule:work
```

---

## 🐳 Docker bilan ishga tushirish

### Development
```bash
# Barcha servislarni ishga tushirish
docker-compose up -d

# Database migratsiya
docker-compose exec app php artisan migrate --seed

# Loglarni ko'rish
docker-compose logs -f
```

### Production deployment
```bash
# Deploy script ishga tushirish
chmod +x deploy.sh
./deploy.sh
```

Deploy script quyidagilarni avtomatik bajaradi:
- SSL sertifikatlar yaratish
- Docker containers build qilish
- Database migratsiya va seed
- Nginx konfiguratsiya
- Production optimizatsiya

---

## 🔧 Konfiguratsiya

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME="KnowHub Community"
APP_ENV=production
APP_URL=https://knowhub.uz
FRONTEND_URL=https://app.knowhub.uz

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=knowhub_community
DB_USERNAME=root
DB_PASSWORD=your_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI
OPENAI_API_KEY=your_openai_api_key

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.knowhub.uz/api/v1
NEXT_PUBLIC_SITE_URL=https://knowhub.uz
NEXT_PUBLIC_SITE_NAME="KnowHub Community"
NEXT_PUBLIC_SITE_DESCRIPTION="O'zbekiston va dunyo bo'ylab dasturchilar hamjamiyati."
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### Branding va SEO boshqaruvi

- Admin paneldagi **Settings** tab'i orqali sayt nomi, tagline, meta description/keywords va light/dark logolarni boshqarish mumkin.
- Logolar `storage/app/public/branding` papkasida saqlanadi. Frontend bilan integratsiya uchun `php artisan storage:link` buyrug'ini ishga tushiring.
- `NEXT_PUBLIC_SITE_*` o'zgaruvchilari default qiymat sifatida ishlatiladi; admin panel orqali yangilangan ma'lumotlar avtomatik tarzda API orqali UI ga yetkaziladi.

---

## 📚 API Documentation

### Authentication
```bash
# Email bilan ro'yxatdan o'tish
POST /api/v1/auth/email/register
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password"
}

# Kirish
POST /api/v1/auth/email/login
{
  "email": "john@example.com",
  "password": "password"
}

# OAuth
GET /api/v1/auth/google/redirect
GET /api/v1/auth/github/redirect
```

### Posts
```bash
# Postlar ro'yxati
GET /api/v1/posts?sort=trending&tag=laravel&category=programming

# Post yaratish
POST /api/v1/posts
{
  "title": "Laravel Tips",
  "content_markdown": "# Laravel Tips\n\nSome useful tips...",
  "category_id": 1,
  "tags": ["Laravel", "PHP"]
}

# Post ko'rish
GET /api/v1/posts/{slug}

# Tegishli postlar
GET /api/v1/posts/{slug}/related
```

### Users
```bash
# Foydalanuvchilar ro'yxati
GET /api/v1/users?sort=xp&search=john

# Profil ko'rish
GET /api/v1/users/{username}

# Reyting jadvali
GET /api/v1/users/leaderboard?period=month&type=posts

# Statistika
GET /api/v1/users/{username}/stats
```

### Dashboard
```bash
# Umumiy statistika
GET /api/v1/dashboard/stats

# Shaxsiy faoliyat
GET /api/v1/dashboard/activity

# Trend kontent
GET /api/v1/dashboard/trending

# Analitika
GET /api/v1/dashboard/analytics?period=30
```

---

## 🚀 Production Deployment

### Server talablari
- Ubuntu 20.04+ yoki CentOS 8+
- 2+ CPU cores
- 4GB+ RAM
- 50GB+ disk space
- Docker va Docker Compose

### SSL sertifikat
```bash
# Let's Encrypt bilan
sudo apt install certbot
sudo certbot certonly --standalone -d knowhub.uz -d api.knowhub.uz

# Sertifikatlarni Docker volume ga ko'chirish
sudo cp /etc/letsencrypt/live/knowhub.uz/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/knowhub.uz/privkey.pem ssl/key.pem
```

### Monitoring
```bash
# Container statusini tekshirish
docker-compose ps

# Loglarni ko'rish
docker-compose logs -f app
docker-compose logs -f frontend
docker-compose logs -f nginx

# Resource usage
docker stats
```

### Backup
```bash
# Database backup
docker-compose exec db mysqldump -u root -p knowhub_community > backup.sql

# Files backup
tar -czf storage_backup.tar.gz storage/
```

---

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. Commit qiling (`git commit -m 'Add amazing feature'`)
4. Push qiling (`git push origin feature/amazing-feature`)
5. Pull Request oching

---

## 📄 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi. Batafsil ma'lumot uchun [LICENSE](LICENSE) faylini ko'ring.

---

## 📞 Aloqa

- 🌐 Website: [knowhub.uz](https://knowhub.uz)
- 📧 Email: info@knowhub.uz
- 💬 Telegram: [@knowhub_community](https://t.me/knowhub_community)
- 🐙 GitHub: [knowhub-dev](https://github.com/knowhub-dev)

---

## 🙏 Minnatdorchilik

- Laravel jamoasiga
- Next.js jamoasiga  
- Barcha open source contributorlariga
- O'zbek dasturchilar hamjamiyatiga
