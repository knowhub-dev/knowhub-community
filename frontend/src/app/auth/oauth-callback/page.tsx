"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}> 
      <OAuthCallbackContent />
    </Suspense>
  );
}

function CallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-base font-medium text-[hsl(var(--foreground))]">Hisobingiz tasdiqlanmoqda...</p>
        </div>
      </div>
    </div>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkUser } = useAuth();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("Hisobingiz tasdiqlanmoqda...");

  const redirectTarget = useMemo(() => {
    const redirectParam = searchParams.get("redirect");
    if (!redirectParam || !redirectParam.startsWith("/")) {
      return "/";
    }
    return redirectParam;
  }, [searchParams]);

  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const token = searchParams.get("token");
    const provider = searchParams.get("provider") ?? "unknown";
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(
        error === "access_denied"
          ? "Tashqi xizmat tomonidan ruxsat berilmadi. Iltimos, qayta urinib ko'ring."
          : "Tashqi autentifikatsiya jarayonida xatolik yuz berdi."
      );
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Token topilmadi. Iltimos, qayta urinib ko'ring yoki boshqa autentifikatsiya usulidan foydalaning.");
      return;
    }

    async function finalize() {
      try {
        localStorage.setItem("auth_token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await checkUser();
        setStatus("success");
        setMessage(`${provider === "github" ? "GitHub" : "Google"} orqali muvaffaqiyatli kirdingiz.`);
        redirectTimer = setTimeout(() => {
          router.replace(redirectTarget);
        }, 1000);
      } catch (err) {
        console.error("OAuth finalize failed", err);
        localStorage.removeItem("auth_token");
        delete api.defaults.headers.common["Authorization"];
        setStatus("error");
        setMessage("Tokenni tasdiqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    }

    finalize();
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [checkUser, redirectTarget, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-lg">
        {status === "pending" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
            <p className="text-base font-medium text-[hsl(var(--foreground))]">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-[hsl(var(--foreground))]">{message}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Birozdan so'ng siz avtomatik ravishda yo'naltirilasiz. Agar yo'naltirilmasangiz, quyidagi tugmani bosing.
            </p>
            <button
              onClick={() => router.replace(redirectTarget)}
              className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition hover:opacity-90"
            >
              Davom etish
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-red-500">{message}</p>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--secondary))]"
            >
              Kirish sahifasiga qaytish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
