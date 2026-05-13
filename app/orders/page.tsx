"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { fetchAllOrders, type Order, type OrderStatus } from "@/services/orders";
import { ShoppingBag, ArrowLeft, ChevronRight, Clock, Package } from "lucide-react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: "bg-zinc-100 text-zinc-600",
  confirmed: "bg-[#82C341]/10 text-[#5a9a2c]",
  out_for_delivery: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        return;
      }
      setAuthed(true);
      const all = await fetchAllOrders();
      setOrders(all.filter(o => o.user_id === session.user.id));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-[#82C341]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 text-zinc-500">
        <ShoppingBag className="h-12 w-12" />
        <p className="font-semibold text-zinc-900">Sign in to view your orders</p>
        <p className="text-sm">You need an account to track orders.</p>
        <button onClick={() => router.push("/")} className="mt-2 rounded-xl bg-[#82C341] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 hover:bg-[#6da832]">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <span className="text-zinc-300">|</span>
          <span className="text-sm font-semibold text-zinc-900">My Orders</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-100 bg-white py-20 text-center shadow-sm">
            <Package className="h-12 w-12 text-zinc-300" />
            <p className="font-semibold text-zinc-900">No orders yet</p>
            <p className="text-sm text-zinc-500">Your order history will appear here.</p>
            <button onClick={() => router.push("/")} className="mt-2 rounded-xl bg-[#82C341] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 hover:bg-[#6da832]">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-zinc-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            {orders.map((order, i) => (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => router.push(`/track/${order.id}`)}
                className="w-full rounded-2xl border border-zinc-100 bg-white p-5 text-left shadow-sm transition hover:border-[#82C341]/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-zinc-900 uppercase">
                        WZO-{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {fmt(order.placed_at)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.city}, {order.state}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-base font-black text-zinc-900">₦{order.subtotal.toLocaleString("en-NG")}</p>
                      <p className="text-xs text-[#82C341] font-semibold">Track →</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
