# Frontend uslub auditi

Quyidagi qaydlar KnowHub Community frontendining so'nggi commitidagi holatni aks ettiradi.

## Uslubdagi nomutanosibliklar

1. **Bosh sahifa komponentlari** hali ham Tailwind'ning `slate-*` ranglariga tayanadi. Masalan, hero va Spotlight bloklari `text-slate-900`, `bg-white/90`, `dark:bg-slate-900/80` kabi ranglardan foydalanadi. Bu qiymatlar yangi HSL asosidagi `--foreground`, `--surface`, `--card` va `--border` o'zgaruvchilariga bog'lanmaganligi uchun, boshqa sahifalardagi yashil-ko'k palitra bilan to'liq uyg'unlashmaydi.
2. **Ro'yxatdan o'tish/kirish sahifalari** (`app/auth/register` va `app/auth/login`) ham to'liq kulrang (`gray-*`) palitrada. Matn, input va tugmalar `text-gray-700`, `border-gray-300`, `bg-indigo-600` kabi klasslar orqali rang olgan; natijada boshqa sahifalardagi gradientli tugmalar va `primary/secondary` tokenlari bilan uyg'unlik buziladi.
3. **Qidiruv komponenti** (`components/SearchBar`) foydalanuvchi inputini `text-gray-400` va `focus:ring-indigo-500` bilan bo'yaydi. Yangi tema `primary` = ko'k, `secondary` = yashil bo'lganligi uchun ushbu komponentga `text-muted-foreground`, `border-input`, `focus:ring-primary` kabi semantik klasslar qo'llanishi kerak.
4. **Taglar sahifasi** (`app/tags/page`) navbatdagi `button` va `input` elementlari `bg-indigo-600`, `bg-gray-100`, `text-gray-700` kabi Tailwind ranglari bilan bo'yalgan. Bu ranglar light/dark rejimlar o'zgarganda tokenlarga avtomatik moslashmaydi, shuningdek yashil-ko'k asosiy palitradan farq qiladi.
5. **Admin paneli bo'limi** `bg-[#f6f6f4]` kabi qo'lda berilgan HEX rangdan foydalanadi. Bu global CSS o'zgaruvchilariga bog'lanmaganligi sababli, foydalanuvchi mavzusi almashtirilganda fonlar qorong'u rejimga moslashmaydi.

## Tavsiya etiladigan o'zgartirishlar

- Bosh sahifadagi barcha `text-slate-*`, `bg-white`, `dark:bg-slate-*` kabi klasslarni `text-foreground`, `text-muted-foreground`, `bg-surface`, `bg-card`, `border-border` va `shadow-[hsl(var(--shadow))]` kabi semantik variantlarga almashtiring. Shu bilan birga `dark:` prefikslarini minimal darajaga tushirish mumkin, chunki HSL o'zgaruvchilari rejimga moslashadi.
- `Auth` sahifalaridagi forma elementlarini `@/components/ui/input`, `@/components/ui/button` kabi shadcn komponentlariga o'tkazing. Bu yondashuv fokus halqalari va tugmalar rangini avtomatik ravishda `--primary` ga bog'laydi.
- `SearchBar` va `Tags` sahifasidagi inputlarni umumiy `Input` komponenti yoki kamida `border-input`, `bg-background`, `text-foreground` bilan o'rab, `focus:ring-primary` dan foydalaning.
- `bg-[#f6f6f4]` kabi HEX ranglar o'rniga `bg-[hsl(var(--surface))]` yoki `bg-muted/40` singari tokenlarga tayangan utilitalarni ishlating.
- Navigatsiya komponentlarida (`Navbar`, `Sidebar`, `Footer`) allaqachon ishlatilayotgan gradient tugmalarni boshqa sahifalarga ham olib chiqish uchun alohida `PrimaryLink` yoki `GradientButton` kabi utilita komponent yarating.

## Qo'shimcha tekshiruvlar

- Har bir CTA havolasi mavjud marshrutga olib borishini yana bir bor tekshirish kerak. Hozircha `containers` sahifasi qo'shilgani uchun bosh sahifadagi mini-server CTA 404 bermaydi, biroq `app/page.tsx` ichidagi "Monitoring navbat" va "Admin panel" kabi bloklar hali faqat statik maket bo'lib turibdi.
- Lint xatosi kuzatilmagan bo'lsa-da, `npm run lint` hozircha `<img>` va `any` bilan bog'liq ogohlantirishlarni qaytaradi; keyingi iteratsiyada ushbu komponentlarni ham semantik variantlarga o'tkazish maqsadga muvofiq.
