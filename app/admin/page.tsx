"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/admin/dashboard");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace("/admin/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#82C341] shadow-lg shadow-[#82C341]/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-zinc-900">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">Whazzonline CMS — Restricted Access</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@whazzonline.com"
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:bg-white focus:ring-4 focus:ring-[#82C341]/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:bg-white focus:ring-4 focus:ring-[#82C341]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#82C341] text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Create your admin account in{" "}
          <span className="font-semibold text-zinc-600">
            Supabase → Authentication → Users
          </span>
        </p>
      </div>
    </div>
  );
}
