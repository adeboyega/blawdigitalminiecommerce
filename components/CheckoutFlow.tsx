"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  X, ChevronLeft, MapPin, CreditCard, Building2,
  Smartphone, Lock, ShoppingBag, Check,
} from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/services/supabase";
import { createOrder, getProfile, type OrderItem } from "@/services/orders";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

interface AddrForm {
  name: string; email: string; phone: string;
  address: string; city: string; state: string;
}
const EMPTY: AddrForm = { name:"", email:"", phone:"", address:"", city:"", state:"Lagos" };

const FIELD = "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#0BA4DB] focus:bg-white focus:ring-4 focus:ring-[#0BA4DB]/10";
const SELECT = FIELD + " cursor-pointer";

const slide = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function CheckoutFlow({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [addr, setAddr] = useState<AddrForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<AddrForm>>({});
  const [payTab, setPayTab] = useState<"card" | "transfer" | "ussd">("card");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [payError, setPayError] = useState("");
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState("");
  const total = subtotal();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const p = await getProfile(session.user.id);
      setAddr({
        name: p?.name ?? "",
        email: session.user.email ?? "",
        phone: p?.phone ?? "",
        address: p?.address ?? "",
        city: p?.city ?? "",
        state: p?.state ?? "Lagos",
      });
    });
  }, []);

  function setField(k: keyof AddrForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setAddr(a => ({ ...a, [k]: e.target.value }));
      setErrors(er => ({ ...er, [k]: "" }));
    };
  }

  function validateAddr() {
    const e: Partial<AddrForm> = {};
    if (!addr.name.trim()) e.name = "Required";
    if (!addr.email.trim()) e.email = "Required";
    if (!addr.phone.trim()) e.phone = "Required";
    if (!addr.address.trim()) e.address = "Required";
    if (!addr.city.trim()) e.city = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function next() {
    if (step === 0 && !validateAddr()) return;
    setDir(1); setStep(s => s + 1);
  }
  function back() { setDir(-1); setStep(s => s - 1); }

  async function handlePay() {
    if (payTab === "card" && (!cardNum || !expiry || !cvv)) {
      setPayError("Please fill in all card details."); return;
    }
    setPaying(true); setPayError("");
    await new Promise(r => setTimeout(r, 2200));

    const { data: { session } } = await supabase.auth.getSession();
    const orderItems: OrderItem[] = items.map(i => ({
      id: i.product.id, name: i.product.name,
      price: i.product.price, quantity: i.quantity,
      image_url: i.product.image_url,
    }));

    const order = await createOrder({
      user_id: session?.user.id ?? null,
      items: orderItems, subtotal: total,
      name: addr.name, email: addr.email, phone: addr.phone,
      address: addr.address, city: addr.city, state: addr.state,
      payment_method: payTab,
      payment_ref: `PSK-${Date.now()}`,
      status: "placed",
      placed_at: new Date().toISOString(),
      confirmed_at: null, out_for_delivery_at: null, delivered_at: null,
    });

    if (!order) { setPayError("Order failed. Please try again."); setPaying(false); return; }
    setOrderId(order.id);
    clearCart();
    setDir(1); setStep(2);
    setPaying(false);
  }

  function fmtCard(v: string) {
    return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  }
  function fmtExpiry(v: string) {
    const c = v.replace(/\D/g,"").slice(0,4);
    return c.length > 2 ? `${c.slice(0,2)}/${c.slice(2)}` : c;
  }

  const steps = ["Delivery", "Payment", "Confirmed"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={step < 2 ? onClose : undefined}
      />
      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Progress header */}
        {step < 2 && (
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <div className="flex items-center gap-2">
              {steps.slice(0, 2).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                    i <= step ? "bg-[#82C341] text-white" : "bg-zinc-100 text-zinc-400"
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-zinc-900" : "text-zinc-400"}`}>{s}</span>
                  {i < 1 && <div className="h-px w-6 bg-zinc-200" />}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            >
              {/* ── STEP 0: ADDRESS ── */}
              {step === 0 && (
                <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#82C341]/10">
                      <MapPin className="h-5 w-5 text-[#82C341]" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">Delivery Details</p>
                      <p className="text-xs text-zinc-500">Where should we deliver?</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-600">Full Name *</label>
                        <input value={addr.name} onChange={setField("name")} placeholder="Bayomi Aremo" className={FIELD} />
                        {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-600">Phone *</label>
                        <input value={addr.phone} onChange={setField("phone")} placeholder="0801 234 5678" className={FIELD} />
                        {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-600">Email *</label>
                      <input type="email" value={addr.email} onChange={setField("email")} placeholder="you@example.com" className={FIELD} />
                      {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-600">Delivery Address *</label>
                      <input value={addr.address} onChange={setField("address")} placeholder="No. 5 Broad Street" className={FIELD} />
                      {errors.address && <p className="mt-0.5 text-xs text-red-500">{errors.address}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-600">City *</label>
                        <input value={addr.city} onChange={setField("city")} placeholder="Lagos Island" className={FIELD} />
                        {errors.city && <p className="mt-0.5 text-xs text-red-500">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-600">State</label>
                        <select value={addr.state} onChange={setField("state")} className={SELECT}>
                          {NG_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order summary mini */}
                  <div className="mt-5 rounded-xl bg-zinc-50 p-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                      <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                      <span className="font-bold text-zinc-900">₦{total.toLocaleString("en-NG")}</span>
                    </div>
                    <div className="space-y-1.5">
                      {items.slice(0, 3).map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-2">
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-zinc-200">
                            {product.image_url && <Image src={product.image_url} alt={product.name} fill sizes="28px" className="object-cover" />}
                          </div>
                          <span className="flex-1 truncate text-xs text-zinc-700">{product.name}</span>
                          <span className="text-xs text-zinc-500">×{quantity}</span>
                        </div>
                      ))}
                      {items.length > 3 && <p className="text-xs text-zinc-400">+{items.length - 3} more</p>}
                    </div>
                  </div>

                  <button onClick={next} className="mt-4 w-full rounded-xl bg-[#82C341] py-3.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-[0.98]">
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* ── STEP 1: PAYSTACK PAYMENT ── */}
              {step === 1 && (
                <div>
                  {/* Paystack header */}
                  <div className="bg-[#0BA4DB] px-5 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium opacity-80">Pay to Whazzonline</p>
                        <p className="text-2xl font-black">₦{total.toLocaleString("en-NG")}</p>
                        <p className="mt-0.5 text-xs opacity-70">{addr.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                          <Lock className="h-3 w-3" /> Secured
                        </div>
                        <p className="mt-1 text-[10px] opacity-60">powered by Paystack</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    {/* Payment method tabs */}
                    <div className="mb-5 flex gap-1 rounded-xl bg-zinc-100 p-1">
                      {([
                        { id: "card", label: "Card", Icon: CreditCard },
                        { id: "transfer", label: "Transfer", Icon: Building2 },
                        { id: "ussd", label: "USSD", Icon: Smartphone },
                      ] as const).map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          onClick={() => setPayTab(id)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                            payTab === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />{label}
                        </button>
                      ))}
                    </div>

                    {payTab === "card" && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-600">Card Number</label>
                          <input
                            value={cardNum}
                            onChange={e => setCardNum(fmtCard(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            inputMode="numeric"
                            className={FIELD}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-zinc-600">Name on Card</label>
                          <input
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            placeholder="BAYOMI AREMO"
                            className={FIELD + " uppercase"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-zinc-600">Expiry (MM/YY)</label>
                            <input
                              value={expiry}
                              onChange={e => setExpiry(fmtExpiry(e.target.value))}
                              placeholder="MM/YY"
                              inputMode="numeric"
                              className={FIELD}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-zinc-600">CVV</label>
                            <input
                              value={cvv}
                              onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                              placeholder="123"
                              inputMode="numeric"
                              type="password"
                              className={FIELD}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {payTab === "transfer" && (
                      <div className="rounded-xl bg-blue-50 p-4 text-center">
                        <Building2 className="mx-auto mb-2 h-8 w-8 text-[#0BA4DB]" />
                        <p className="text-sm font-semibold text-zinc-900">Bank Transfer</p>
                        <p className="mt-1 text-xs text-zinc-500">Transfer ₦{total.toLocaleString("en-NG")} to the account below</p>
                        <div className="mt-3 rounded-lg bg-white p-3 text-left text-xs space-y-1.5">
                          <div className="flex justify-between"><span className="text-zinc-500">Bank</span><span className="font-bold">Access Bank</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Account No.</span><span className="font-bold font-mono">0123456789</span></div>
                          <div className="flex justify-between"><span className="text-zinc-500">Account Name</span><span className="font-bold">Whazzonline Ltd</span></div>
                        </div>
                      </div>
                    )}

                    {payTab === "ussd" && (
                      <div className="rounded-xl bg-blue-50 p-4 text-center">
                        <Smartphone className="mx-auto mb-2 h-8 w-8 text-[#0BA4DB]" />
                        <p className="text-sm font-semibold text-zinc-900">USSD Payment</p>
                        <p className="mt-1 text-xs text-zinc-500">Dial the code below on your phone</p>
                        <div className="mt-3 inline-block rounded-lg bg-white px-6 py-3 font-mono text-lg font-black text-zinc-900">*737*000*{Math.floor(total)}#</div>
                      </div>
                    )}

                    {payError && <p className="mt-3 text-xs text-red-500">{payError}</p>}

                    <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
                      <Lock className="h-3 w-3" /> Your payment info is encrypted and secure
                    </div>

                    <div className="mt-3 flex gap-3">
                      <button onClick={back} className="flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={handlePay}
                        disabled={paying}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0BA4DB] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0993c5] disabled:opacity-70 active:scale-[0.98]"
                      >
                        {paying ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Processing…
                          </>
                        ) : (
                          <>Pay ₦{total.toLocaleString("en-NG")}</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: CONFIRMED ── */}
              {step === 2 && (
                <div className="flex flex-col items-center px-8 py-10 text-center">
                  {/* Animated SVG checkmark */}
                  <motion.svg
                    viewBox="0 0 52 52"
                    className="mb-6 h-24 w-24"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.circle
                      cx="26" cy="26" r="24"
                      fill="none" stroke="#82C341" strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                    <motion.path
                      fill="none" stroke="#82C341" strokeWidth="3.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      d="M14 27l8 8 16-17"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
                    />
                  </motion.svg>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-1"
                  >
                    <h2 className="text-2xl font-black text-zinc-900">Order Confirmed!</h2>
                    <p className="text-zinc-500 text-sm">Thank you, {addr.name.split(" ")[0]}. Your order is on its way.</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-5 w-full space-y-2 rounded-2xl bg-zinc-50 p-4 text-left"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Order ref</span>
                      <span className="font-mono font-bold text-zinc-900 uppercase">WZO-{orderId.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Delivery to</span>
                      <span className="font-medium text-zinc-900 text-right max-w-[200px] truncate">{addr.address}, {addr.city}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Estimated delivery</span>
                      <span className="font-medium text-zinc-900">3 – 5 business days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Total paid</span>
                      <span className="font-black text-[#82C341]">₦{total.toLocaleString("en-NG")}</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="mt-6 flex w-full flex-col gap-3 sm:flex-row"
                  >
                    <button
                      onClick={() => { onClose(); router.push(`/track/${orderId}`); }}
                      className="flex-1 rounded-xl bg-[#82C341] py-3.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832]"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => { onClose(); router.push("/"); }}
                      className="flex-1 rounded-xl border-2 border-zinc-200 py-3.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Back to Home
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
