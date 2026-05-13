"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Zap } from "lucide-react";
import { supabase } from "@/services/supabase";
import { upsertProfile } from "@/services/orders";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const FIELD = "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:bg-white focus:ring-4 focus:ring-[#82C341]/10";
const FIELD_NO_ICON = "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:bg-white focus:ring-4 focus:ring-[#82C341]/10";

export default function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sign In
  const [siEmail, setSiEmail] = useState("");
  const [siPw, setSiPw] = useState("");

  // Sign Up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suAddr, setSuAddr] = useState("");
  const [suCity, setSuCity] = useState("");
  const [suState, setSuState] = useState("Lagos");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPw });
    if (error) { setError(error.message); setLoading(false); return; }
    onSuccess();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (suPw.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");

    const { data, error } = await supabase.auth.signUp({ email: suEmail, password: suPw });
    if (error) { setError(error.message); setLoading(false); return; }

    if (data.user) {
      await upsertProfile({
        id: data.user.id,
        name: suName, email: suEmail, phone: suPhone,
        address: suAddr, city: suCity, state: suState,
      });
    }
    setSuccess("Account created! Check your email to confirm, then sign in.");
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#82C341]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-zinc-900">Whazzonline</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                tab === t
                  ? "border-b-2 border-[#82C341] text-[#82C341]"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-xl bg-green-50 p-3 text-xs text-green-700">{success}</div>}

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} required placeholder="you@example.com" className={FIELD} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input type={showPw ? "text" : "password"} value={siPw} onChange={e => setSiPw(e.target.value)} required placeholder="••••••••" className={FIELD + " pr-10"} />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#82C341] py-3 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] disabled:opacity-60">
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUp}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600">Full Name *</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input value={suName} onChange={e => setSuName(e.target.value)} required placeholder="Bayomi Aremo" className={FIELD} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600">Phone</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input value={suPhone} onChange={e => setSuPhone(e.target.value)} placeholder="0801 234 5678" className={FIELD} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">Email *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} required placeholder="you@example.com" className={FIELD} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">Password *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input type={showPw ? "text" : "password"} value={suPw} onChange={e => setSuPw(e.target.value)} required placeholder="Min. 6 characters" className={FIELD + " pr-10"} />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input value={suAddr} onChange={e => setSuAddr(e.target.value)} placeholder="No. 5 Broad Street" className={FIELD} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600">City</label>
                    <input value={suCity} onChange={e => setSuCity(e.target.value)} placeholder="Lagos Island" className={FIELD_NO_ICON} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-600">State</label>
                    <select value={suState} onChange={e => setSuState(e.target.value)} className={FIELD_NO_ICON + " cursor-pointer"}>
                      {NG_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#82C341] py-3 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] disabled:opacity-60">
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
