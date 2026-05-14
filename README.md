# Whazzonline — Mini E-Commerce Platform

A fully functional e-commerce web application built for the Blawdigital Lead Developer Assessment. Whazzonline connects vendors and buyers with a clean, performant shopping experience built on modern full-stack tooling.

**Live URL:** https://blawdigitalminiecommerce.vercel.app/

---

## Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | Server components + ISR for fast product pages without a separate API layer |
| Language | TypeScript | Type safety across the full stack — critical for order/cart data integrity |
| Styling | Tailwind CSS v4 | Utility-first with zero runtime CSS; v4's `@variant` API enables clean class-based dark mode |
| Database & Auth | Supabase (PostgreSQL) | Managed Postgres + built-in auth + storage in one service — right-sized for this stage |
| State Management | Zustand | Minimal bundle size vs Redux; `persist` middleware handles localStorage without boilerplate |
| Animations | Framer Motion | Declarative animation API that pairs well with React; used for checkout flow, timeline, and card transitions |
| Icons | Lucide React | Tree-shakeable icon set; `optimizePackageImports` in next.config.ts prevents barrel-import compile hangs |

---

## Features

### Core
- **Product listing** — 6+ products from Supabase with real-time search and category filtering
- **Product detail page** — full product view with add-to-cart feedback
- **Cart system** — add, remove, adjust quantity, display total; persisted to `localStorage` via Zustand
- **Authentication** — Sign Up / Sign In with Supabase Auth; profile auto-fills checkout address
- **Checkout flow** — 3-step modal: Delivery details → Paystack-style payment UI → Animated order confirmation
- **Order tracking** — 4-stage animated timeline (Placed → Confirmed → Out for Delivery → Delivered)
- **Order history** — authenticated users can view all past orders and navigate to tracking

### Bonus
- **Dark mode** — class-based toggle with Sun/Moon button in Navbar; preference persisted to `localStorage`
- **Wishlist** — heart button on every product card; `/wishlist` page with add-to-cart; persisted to `localStorage`
- **Payment simulation** — Paystack-styled UI with Card / Bank Transfer / USSD tabs; 2-second processing simulation
- **Animations** — Framer Motion throughout: slide transitions, SVG checkmark draw, staggered reveals, timeline fill
- **Admin panel** — `/admin/dashboard` with product CRUD, image upload (Supabase Storage), and order management with manual status progression

---

## Project Structure

```
app/
  page.tsx                  # Server component — product listing with ISR (revalidate 60s)
  product/[id]/             # Dynamic product detail page
  track/[orderId]/          # Order tracking page
  orders/                   # Authenticated order history
  wishlist/                 # Wishlist page
  admin/                    # Admin login + dashboard
components/
  Navbar.tsx                # 3-tier header with auth state, dark mode toggle, wishlist icon
  ProductCard.tsx           # Product tile with wishlist heart and add-to-cart
  CartDrawer.tsx            # Slide-over cart with CheckoutFlow trigger
  CheckoutFlow.tsx          # 3-step checkout modal (address → payment → confirmation)
  AuthModal.tsx             # Sign In / Create Account modal
  ThemeProvider.tsx         # Syncs Zustand theme state to <html> class
services/
  supabase.ts               # Supabase client + product fetchers + image upload
  orders.ts                 # Order CRUD, profile upsert, status updates
store/
  cartStore.ts              # Zustand cart with localStorage persistence
  wishlistStore.ts          # Zustand wishlist with localStorage persistence
  themeStore.ts             # Zustand theme (light/dark) with localStorage persistence
types/
  index.ts                  # Product, CartItem, CartStore interfaces
```

---

## Testing

The project ships with a Jest + React Testing Library suite covering the core business logic and UI components.

### Run the tests

```bash
npm test                 # run all tests
npm run test:coverage    # run with coverage report
```

### Coverage summary

| Area | Files | Result |
|---|---|---|
| Stores | `cartStore`, `wishlistStore`, `themeStore` | ~99% statements |
| Services | `orders.ts` | 100% statements |
| Components | `SearchModal`, `CartDrawer`, `ProductCard`, `ThemeProvider` | ~95% statements |
| **Overall** | **8 suites · 81 tests** | **96% statements** |

Coverage threshold enforced in `jest.config.js`: **70% lines, functions, and branches**.

### What is covered

- **`cartStore`** — addItem (new product + duplicate increment), removeItem, updateQuantity (set, zero, negative), clearCart, openCart/closeCart, totalItems, subtotal
- **`wishlistStore`** — add, remove, toggle (add when absent / remove when present), has, count
- **`themeStore`** — initial state, toggle light → dark, toggle dark → light, multiple toggles
- **`orders.ts`** — fetchOrder (found/null), fetchAllOrders (data/empty fallback), createOrder (success/error), updateOrderStatus for all four statuses with correct timestamp fields, getProfile, upsertProfile
- **`ThemeProvider`** — renders children, adds/removes `dark` class on `<html>`
- **`SearchModal`** — renders when open, hidden when closed, empty-state prompt, filter by name, filter by category, no-results message, result count, out-of-stock label, click navigates and closes, backdrop click closes, Escape key closes
- **`ProductCard`** — renders name/price/category/description, out-of-stock overlay + disabled button, add-to-cart calls store, wishlist toggle label + handler
- **`CartDrawer`** — empty state, item rendering, subtotal display, remove/increase/decrease/clear actions, checkout flow trigger, close button

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier is sufficient)

### Installation

```bash
git clone https://github.com/adeboyega/blawdigitalminiecommerce.git
cd blawdigitalminiecommerce
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-here
```


### Supabase Database Setup

Run the following in your Supabase **SQL Editor**:

```sql
-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text,
  image_url text,
  stock_qty integer not null default 0,
  created_at timestamptz default now()
);

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text, email text, phone text,
  address text, city text, state text,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Orders table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  items jsonb not null,
  subtotal numeric not null,
  name text not null, phone text not null, email text not null,
  address text not null, city text not null, state text not null,
  payment_method text not null,
  payment_ref text,
  status text not null default 'placed',
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  out_for_delivery_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

```


### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Admin panel is at `/admin`.

> **Note:** On first run, clear the Turbopack cache if you see stale module errors: `rm -rf .next && npm run dev`

---

## Assumptions

- Payment is simulated — no real Paystack API keys are required. The payment UI is a faithful mock of Paystack's checkout modal for demonstration purposes.
- Admin authentication uses the same Supabase Auth as customers. In production, admin access would be controlled via a separate role or RLS policy.
- Order status is updated manually by the admin. Real-world delivery tracking would integrate a logistics API.
- All prices are in Nigerian Naira (₦). No currency conversion is implemented.
- Guest checkout is supported — `user_id` on orders can be null for unauthenticated purchases.

---

## Known Limitations

- **No real payment processing** — Paystack integration is mocked. Plugging in the real Paystack Popup SDK is a one-session task once API keys are available.
- **No email notifications** — Orders are confirmed in the UI but no confirmation email is sent. Supabase Edge Functions + Resend would handle this cleanly.
- **Admin has no role-based access control** — any authenticated user who knows the `/admin` URL can access the dashboard. RLS policies and a `roles` table would fix this.
- **No pagination** — the product listing fetches all products in one query. Acceptable at current scale; Supabase's `range()` API makes cursor-based pagination straightforward to add.
- **Dark mode on server components** — the `dark` class is applied client-side after hydration, which can cause a brief flash on hard reload. A cookie-based solution (reading theme in the server layout) would eliminate this.
- **Search is client-side only** — filtering runs in the browser on the already-fetched product list. Full-text search via Supabase's `textsearch` would be needed at scale.

---

## What I Would Improve With More Time

1. **Real Paystack integration** — replace the mock with `@paystack/inline-js` for actual card processing
2. **Email order confirmations** — Supabase Edge Function triggered on order insert, sending via Resend
3. **Role-based admin access** — `profiles.role` column + RLS policies to lock down `/admin`
4. **Optimistic UI updates** — cart and wishlist feel instant already via Zustand, but order status updates in admin could use optimistic state
5. **Product reviews** — `reviews` table with star ratings, linked to `orders` to prevent fake reviews
6. **Vendor dashboard** — multi-tenancy layer so vendors manage their own products, matching Whazzonline's vendor-buyer model
7. **End-to-end tests** — Playwright covering the checkout flow, auth, and order tracking golden paths (unit tests are in place; E2E is the natural next layer)
