"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { fetchOrder, type Order, type OrderStatus } from "@/services/orders";
import { ShoppingBag, CheckCircle2, Truck, PackageCheck, ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";

const STAGES: {
  key: OrderStatus;
  label: string;
  sub: string;
  Icon: React.ElementType;
  timeKey: keyof Order;
}[] = [
  { key: "placed",           label: "Order Placed",      sub: "We received your order",          Icon: ShoppingBag,   timeKey: "placed_at" },
  { key: "confirmed",        label: "Order Confirmed",   sub: "Your order has been confirmed",    Icon: CheckCircle2,  timeKey: "confirmed_at" },
  { key: "out_for_delivery", label: "Out for Delivery",  sub: "Your order is on its way",         Icon: Truck,         timeKey: "out_for_delivery_at" },
  { key: "delivered",        label: "Delivered",         sub: "Your order has been delivered 🎉", Icon: PackageCheck,  timeKey: "delivered_at" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  placed: 0, confirmed: 1, out_for_delivery: 2, delivered: 3,
};

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TrackOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(orderId).then(o => { setOrder(o); setLoading(false); });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-[#82C341]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 text-zinc-500">
        <ShoppingBag className="h-12 w-12" />
        <p className="font-semibold">Order not found</p>
        <button onClick={() => router.push("/")} className="text-sm text-[#82C341] hover:underline">Back to home</button>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[order.status];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <span className="text-zinc-300">|</span>
          <span className="text-sm font-semibold text-zinc-900">Track Order</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Order card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500">Order reference</p>
              <p className="font-mono text-lg font-black text-zinc-900 uppercase">
                WZO-{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              order.status === "delivered"        ? "bg-emerald-100 text-emerald-700" :
              order.status === "out_for_delivery" ? "bg-blue-100 text-blue-700" :
              order.status === "confirmed"        ? "bg-[#82C341]/10 text-[#5a9a2c]" :
                                                    "bg-zinc-100 text-zinc-600"
            }`}>
              {order.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-zinc-500">Customer</span>
            <span className="font-medium text-zinc-900">{order.name}</span>
            <span className="text-zinc-500">Delivering to</span>
            <span className="font-medium text-zinc-900">{order.address}, {order.city}, {order.state}</span>
            <span className="text-zinc-500">Placed at</span>
            <span className="font-medium text-zinc-900 flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(order.placed_at)}</span>
            <span className="text-zinc-500">Total</span>
            <span className="font-black text-[#82C341]">₦{order.subtotal.toLocaleString("en-NG")}</span>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 font-bold text-zinc-900">Delivery Timeline</h2>
          <div className="relative">
            {/* Vertical track line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-zinc-100" />
            {/* Filled portion */}
            <motion.div
              className="absolute left-5 top-5 w-0.5 bg-[#82C341]"
              initial={{ height: 0 }}
              animate={{ height: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />

            <div className="relative space-y-8">
              {STAGES.map((stage, i) => {
                const done = i <= currentIndex;
                const ts = order[stage.timeKey] as string | null;
                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    {/* Circle */}
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      done
                        ? "border-[#82C341] bg-[#82C341]"
                        : "border-zinc-200 bg-white"
                    }`}>
                      {done
                        ? <stage.Icon className="h-5 w-5 text-white" />
                        : <stage.Icon className="h-5 w-5 text-zinc-300" />
                      }
                    </div>

                    <div className="flex-1 pt-1.5">
                      <p className={`text-sm font-bold ${done ? "text-zinc-900" : "text-zinc-400"}`}>
                        {stage.label}
                      </p>
                      <p className={`text-xs ${done ? "text-zinc-500" : "text-zinc-300"}`}>
                        {done && ts ? fmt(ts) : done ? "In progress" : stage.sub}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Items in order */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 font-bold text-zinc-900">Items in this Order</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-zinc-900">
                  ₦{(item.price * item.quantity).toLocaleString("en-NG")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-sm font-semibold text-zinc-500">Total</span>
            <span className="text-lg font-black text-zinc-900">₦{order.subtotal.toLocaleString("en-NG")}</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
