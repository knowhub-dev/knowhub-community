export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[hsl(var(--foreground))]">
      <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-8">Foydalanish Shartlari</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          KnowHub Community platformasidan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">1. Umumiy Qoidalar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Platformadan faqat qonuniy maqsadlarda foydalaning</li>
          <li>Boshqa foydalanuvchilarga hurmat bilan munosabatda bo'ling</li>
          <li>Spam va keraksiz kontent joylashtirmang</li>
          <li>Mualliflik huquqlarini hurmat qiling</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">2. Kontent Qoidalari</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Faqat o'zingizga tegishli yoki ruxsat etilgan kontentni joylashtiring</li>
          <li>Haqoratli, kamsituvchi yoki zararli kontent taqiqlanadi</li>
          <li>Dasturlash va texnologiya mavzulariga oid kontent joylashtiring</li>
          <li>Aniq va tushunarli sarlavhalar ishlating</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">3. Foydalanuvchi Hisobi</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Haqiqiy ma'lumotlarni taqdim eting</li>
          <li>Parolingizni maxfiy saqlang</li>
          <li>Hisobingizdan foydalanish uchun javobgarlikni o'z zimmangizga oling</li>
          <li>Bir kishiga faqat bitta hisob ochish mumkin</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">4. Taqiqlangan Harakatlar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Platformani buzishga urinish</li>
          <li>Boshqa foydalanuvchilarning hisoblarini buzish</li>
          <li>Avtomatik botlar yoki skriptlardan foydalanish</li>
          <li>Reklama va spam yuborish</li>
          <li>Yolg'on ma'lumotlar tarqatish</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">5. Intellektual Mulk</h2>
        <p>
          Platformadagi barcha kontent (dizayn, kod, matnlar) KnowHub Community ga tegishli yoki
          litsenziya asosida ishlatiladi. Foydalanuvchilar o'z kontentlariga mualliflik huquqini saqlab qoladi.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">6. Javobgarlik</h2>
        <p>
          KnowHub Community platformadagi foydalanuvchi kontenti uchun javobgar emas.
          Har bir foydalanuvchi o'z kontenti uchun to'liq javobgarlikni o'z zimmaga oladi.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">7. Xizmat Ko'rsatish</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Biz xizmatni yaxshilash uchun o'zgartirishlar kiritishimiz mumkin</li>
          <li>Texnik ishlar paytida xizmat vaqtincha to'xtatilishi mumkin</li>
          <li>Qoidalarni buzgan foydalanuvchilar bloklashi mumkin</li>
        </ul>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">8. Shartlarning O'zgarishi</h2>
        <p>
          Biz ushbu shartlarni istalgan vaqtda o'zgartirishimiz mumkin.
          Muhim o'zgarishlar haqida foydalanuvchilar xabardor qilinadi.
        </p>

        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-4">9. Aloqa</h2>
        <p>
          Foydalanish shartlari bo'yicha savollaringiz bo'lsa:
        </p>
        <ul className="list-none mt-4">
          <li>Email: legal@knowhub.uz</li>
          <li>Telegram: @knowhub_support</li>
        </ul>

        <p className="text-sm text-muted-foreground mt-8">
          Oxirgi yangilanish: 2025 yil yanvar
        </p>
      </div>
    </div>
  );
}