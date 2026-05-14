"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/services/supabase";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Verifying your account…");

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      setMessage("Invalid verification link.");
      setTimeout(() => router.replace("/"), 3000);
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setMessage("Verification failed. Please try signing in.");
        } else {
          setMessage("Email verified! Redirecting…");
        }
        setTimeout(() => router.replace("/"), 1500);
      });
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-3">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#82C341] border-t-transparent" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
