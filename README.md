# 🌐 KnowHub Community

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Contributors](https://img.shields.io/github/contributors/knowhub-dev/knowhub-community.svg)]()
[![Issues](https://img.shields.io/github/issues/knowhub-dev/knowhub-community.svg)]()
[![Stars](https://img.shields.io/github/stars/knowhub-dev/knowhub-community.svg?style=social)]()

**KnowHub Community** — o‘zbek dasturchilari va texnologiya ixlosmandlari uchun yaratilgan **next-gen ochiq manba platformasi**.  
Platforma maqolalar, savol-javoblar, Wiki, kod ijrosi, gamifikatsiya va real vaqt funksiyalari orqali bilim almashishni qulay qiladi.

🎯 **Maqsad:** O‘zbekistondagi eng katta texnologik hamjamiyatni yaratish.

---

# 🚀 Nega KnowHub Community?

- 🇺🇿 **Mahalliy auditoriya uchun**, o‘zbekcha interfeys va texno-ekotizim.  
- 🧠 **O‘qish + Tajriba + Hamjamiyat** — UX tajriba o‘rganish uchun ideal.  
- ⚔️ **Gamifikatsiya** — XP, badge’lar, level up, leaderboard.  
- 🚀 **Kuchli arxitektura** — Laravel 11, Next.js 14, Redis, Docker.  
- 🤝 **To‘liq ochiq manba** — jamoa asosidagi rivojlanish.

---


# 🏛️ Arxitektura

```
┌──────────────────────────────────────────────┐
│                Next.js Frontend              │
│ React, Tailwind, TS, React Query             │
└──────────────────────────────────────────────┘
                  ▲               │
                  │ API           ▼
┌──────────────────────────────────────────────┐
│               Laravel Backend                │
│ Auth, Posts, Wiki, Notifications, Gamify     │
│ Trends, Queues, Analytics                    │
└──────────────────────────────────────────────┘
                  ▲               │
                  │ Sandbox       ▼
┌──────────────────────────────────────────────┐
│        Piston Code Execution Engine          │
│ Izolyatsiya qilingan kod ijro muhiti         │
└──────────────────────────────────────────────┘
```

- **Nginx** — reverse proxy  
- **Redis** — cache + queue  
- **PostgreSQL/MySQL** — data storage  
- **Supervisor/Horizon** — background jobs  
- **Docker Compose** — local & production environment  

---

# 🧩 Mini-Serverlar (KnowHub Mini Services / Microservices)

KnowHub ekotizimi bo‘ylab **kichik mustaqil xizmatlar** mavjud bo‘lib, ular platformani katta monolitga aylantirmasdan funksiyalarni boshqaradi.

### 🔹 1. Piston Service (Code Runner)

- Backend → Piston orqali kodni sandbox’da bajartiradi  
- 30+ dasturlash tilini qo‘llab-quvvatlaydi  
- Docker konteynerlarda izolyatsiya

### 🔹 2. Image Optimization Service (Mini CDN) *(rejalashtirilgan)*

- Post rasmlarini optimallashtirish  
- WebP generatsiya  
- Thumb caching

### 🔹 3. AI Recommendation Engine

- Foydalanuvchi faoliyati asosida kontent tavsiya qilish  
- OpenAI API / lokal inferens server integratsiyasi

### 🔹 4. Notification Microservice

- Real-time xabarnomalar  
- Queue orqali ishlov berish  
- Email + WebPush qo‘llab-quvvatlash

### 🔹 5. Trend Engine

- Postlar, taglar va mualliflar uchun trend hisoblash  
- Cached scoring algoritmlar

Bu mini serverlar platformaning tez ishlashini, kengayuvchanligini va mustahkamligini ta’minlaydi.

---

# ✨ Asosiy Funksiyalar

### 📝 Kontent

- Postlar  
- Maqolalar  
- Fikrlar  
- Taglar  
- Wiki bo‘lim  

### ⚔️ Gamifikatsiya

- XP  
- Badge’lar  
- Darajalar (Levels)  
- Leaderboard  

### 🧠 AI Integratsiyasi

- Maqola yozishda yordam  
- Tavsiyalar  
- Kod sharhlash  

### 🧪 Kod Ijrosi (Piston)

- Real vaqt  
- 30+ til  
- Maxsus konteynerlar

### 🛡️ Admin Panel

- Moderatsiya  
- Analitika  
- Banner boshqaruvi  
- Post tasdiqlash  

---

# 🛠 Tez Boshlash

## 1️⃣ Reponi klon qiling

```bash
git clone https://github.com/knowhub-dev/knowhub-community.git
cd knowhub-community
```

---

# 🔧 Backend (Laravel)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Migratsiya:

```bash
php artisan migrate --seed
```

Server:

```bash
php artisan serve
```

---

# 💻 Frontend (Next.js 14)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

# 🐳 Docker Orqali Ishga Tushirish

### Development:

```bash
docker-compose up -d
docker-compose exec app php artisan migrate --seed
```

### Production:

- `deploy.sh` skripti  
- SSL (Let’s Encrypt)  
- Nginx avtomatik konfiguratsiya  
- Build + migrate  

---

# 🔑 Muhit O‘zgaruvchilari (ENV)

| O‘zgaruvchi | Qayerda | Maqsad |
|-------------|---------|--------|
| APP_URL | Backend | API bazaviy URL |
| FRONTEND_URL | Front/Back | CORS |
| DB_HOST, DB_PASSWORD | Backend | Ma’lumotlar bazasi |
| REDIS_HOST | Backend | Cache/Queue |
| QUEUE_CONNECTION | Backend | Horizon/Supervisor |
| PISTON_HOST | Backend | Sandbox |
| OPENAI_API_KEY | Backend | AI funksiyalar |

---

# 🛠 Muammolar va Yechimlar

### ❌ DB ishlamayapti

```bash
docker-compose ps
docker-compose logs db
```

### ❌ Port band

```bash
sudo lsof -i:3000
```

### ❌ Container restart bo‘layapti

- `.env` ni tekshiring  
- `APP_KEY`  
- DB credential  

---

# 🤝 Hissa Qo‘shish (Contributing)

Biz barcha PR va takliflarni mamnuniyat bilan qabul qilamiz.

### Branch strategiyasi:

- `main` — produktion  
- `develop` — asosiy rivojlanish  
- `feature/*` — yangi modullar  

### Commit format:

- `feat: ...`  
- `fix: ...`  
- `docs: ...`  
- `refactor: ...`  

### PR jarayoni:

1. Issue ochish  
2. Muhokama  
3. PR  
4. Review → merge  

---

# 🛡 Xavfsizlik

Xavfsizlik kamchiligini topsangiz:

📧 **security@knowhub.uz**

Public issue ochmang.

---

# 📜 Litsenziya

Ushbu loyiha **MIT License** asosida tarqatiladi.

---

# ❤️ Hamjamiyat

**Built with ❤️ for the tech community**  
https://knowhub.uz
