"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase, uploadProductImage } from "@/services/supabase";
import {
  Zap, LogOut, Plus, Edit2, Trash2, X, Check,
  Search, Package, Tag, AlertCircle, ImageOff, Upload,
} from "lucide-react";
import type { Product } from "@/types";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock_qty: string;
}

const EMPTY_FORM: ProductForm = {
  name: "", description: "", price: "", category: "", image_url: "", stock_qty: "10",
};

const INPUT =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:ring-4 focus:ring-[#82C341]/10 focus:bg-white";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/admin"); return; }
      loadProducts();
    });
  }, [router, loadProducts]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category: p.category ?? "",
      image_url: p.image_url ?? "",
      stock_qty: String(p.stock_qty),
    });
    setFormError("");
    setModalOpen(true);
  }

  function field(key: keyof ProductForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price) {
      setFormError("Product name and price are required.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      category: form.category.trim() || null,
      image_url: form.image_url.trim() || null,
      stock_qty: parseInt(form.stock_qty) || 0,
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#82C341]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-900">Whazzonline</p>
              <p className="-mt-0.5 text-[10px] text-zinc-400">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="hidden text-xs text-zinc-500 transition hover:text-[#82C341] sm:block"
            >
              View Store →
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Package} label="Total Products" value={products.length} color="lime" />
          <StatCard icon={Tag} label="Categories" value={categories.length} color="purple" />
          <StatCard
            icon={Check}
            label="In Stock"
            value={products.filter((p) => p.stock_qty > 0).length}
            color="green"
          />
          <StatCard
            icon={AlertCircle}
            label="Out of Stock"
            value={products.filter((p) => p.stock_qty <= 0).length}
            color="red"
          />
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:ring-4 focus:ring-[#82C341]/10"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#82C341] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-100 border-t-[#82C341]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-zinc-400">
              <Package className="h-10 w-10" />
              <p className="text-sm font-medium">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    {["Product", "Category", "Price (₦)", "Stock", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 ${
                          h === "Actions" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="transition hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            {p.image_url ? (
                              <Image src={p.image_url} alt={p.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                <ImageOff className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-900">{p.name}</p>
                            <p className="truncate text-xs text-zinc-400">{p.description ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.category ? (
                          <span className="rounded-full bg-[#82C341]/10 px-2.5 py-0.5 text-xs font-medium text-[#5a9a2c]">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900">
                        ₦{p.price.toLocaleString("en-NG")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.stock_qty > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {p.stock_qty > 0 ? `${p.stock_qty} units` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-[#82C341] hover:text-[#82C341]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="flex h-8 items-center gap-1 rounded-lg bg-red-500 px-2.5 text-xs font-bold text-white hover:bg-red-600"
                              >
                                <Check className="h-3 w-3" /> Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(p.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-red-200 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                <h2 className="font-bold text-zinc-900">
                  {editing ? "Edit Product" : "New Product"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
                {formError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    {formError}
                  </div>
                )}

                <FormField label="Product Name *">
                  <input
                    value={form.name}
                    onChange={field("name")}
                    placeholder="e.g. Classic Wristwatch"
                    className={INPUT}
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    value={form.description}
                    onChange={field("description")}
                    placeholder="Short product description…"
                    rows={3}
                    className={INPUT + " resize-none"}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Price (₦) *">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={field("price")}
                      placeholder="0.00"
                      className={INPUT}
                    />
                  </FormField>
                  <FormField label="Stock Qty">
                    <input
                      type="number"
                      min="0"
                      value={form.stock_qty}
                      onChange={field("stock_qty")}
                      placeholder="10"
                      className={INPUT}
                    />
                  </FormField>
                </div>

                <FormField label="Category">
                  <input
                    value={form.category}
                    onChange={field("category")}
                    placeholder="e.g. Electronics, Bags, Accessories"
                    className={INPUT}
                  />
                </FormField>

                <FormField label="Product Image">
                  <ImageUploader
                    currentUrl={form.image_url}
                    onUrl={(url) => setForm((f) => ({ ...f, image_url: url }))}
                  />
                </FormField>
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 border-t border-zinc-100 px-6 py-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#82C341] py-2.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

function ImageUploader({
  currentUrl,
  onUrl,
}: {
  currentUrl: string;
  onUrl: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5 MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const url = await uploadProductImage(file);
    if (url) {
      onUrl(url);
    } else {
      setUploadError("Upload failed — check your Supabase Storage bucket is set up.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 transition ${
          dragging
            ? "border-[#82C341] bg-[#82C341]/5"
            : "border-zinc-200 bg-zinc-50 hover:border-[#82C341] hover:bg-[#82C341]/5"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#82C341]" />
            <p className="text-sm text-[#82C341] font-medium">Uploading…</p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#82C341]/10">
              <Upload className="h-6 w-6 text-[#82C341]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-700">
                Click to upload <span className="text-zinc-400 font-normal">or drag & drop</span>
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">PNG, JPG, WebP — max 5 MB</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}

      {/* Preview */}
      {currentUrl && (
        <div className="relative overflow-hidden rounded-xl">
          <div className="relative h-36 bg-zinc-100">
            <Image
              src={currentUrl}
              alt="Preview"
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onUrl("")}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 px-3 py-2">
            <p className="truncate text-[11px] text-white/80">{currentUrl.split("/").pop()}</p>
          </div>
        </div>
      )}

      {/* URL fallback */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[11px] text-zinc-400">or paste a URL</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>
      <input
        value={currentUrl}
        onChange={(e) => onUrl(e.target.value)}
        placeholder="https://…"
        className={INPUT}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "lime" | "purple" | "green" | "red";
}) {
  const cls = {
    lime: "bg-[#82C341]/10 text-[#82C341]",
    purple: "bg-[#2d0a6b]/10 text-[#2d0a6b]",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
  }[color];

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${cls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
