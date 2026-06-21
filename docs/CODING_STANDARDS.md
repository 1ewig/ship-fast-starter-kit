# Coding Standards

## Architecture Overview

The codebase follows a strict 4-layer separation of concerns:

```
Pages (src/app/)
  │  Server Components: resolve route params, export SEO metadata, render containers
  │
  ▼
Containers / Bridges (src/components/*/)
  │  Read stores, call hooks, assemble props
  │
  ├──► Hooks (src/hooks/)
  │     Business logic, form state, animation state, side effects
  │     May call Zustand stores
  │
  ├──► Stores (src/stores/)
  │     Zustand global state management
  │
  ▼
Presentational Components (src/components/*/)
  Pure JSX — receive everything via props, zero store/hook imports
```

Data flows **down** from pages through containers into presentational components. Business logic lives in hooks. Global state lives in stores.

---

## Design System & Theming

### Single Source of Truth

All styling tokens live in `src/app/globals.css` — 8 core colors, derived shadcn/ui variables, radius scale, layout tokens, and font definitions. This file is the sole authority for the app's visual identity. Change the 8 hex values → the entire app rebrands.

When you need a color, spacing, radius, or shadow — use the Tailwind utility class that maps to the CSS variable. **Never hardcode raw values.**

### ✅ Allowed — Theme tokens only

```tsx
<div className="bg-background text-foreground" />
<button className="hover:bg-accent hover:text-accent-foreground" />
<nav className="w-(--sidebar-width)" />
<div className="rounded-lg shadow-card" />
```

### ❌ Forbidden — Hardcoded values

```tsx
<div className="bg-[#F7F4EE] text-[#0A1828]" />
<button className="hover:bg-[#EBE3D8]" />
<nav className="w-56" />
<div className="rounded-[12px]" />
```

### Token Reference

| Category | Token | Example Usage |
|----------|-------|---------------|
| Page bg | `bg-background` | Page base, sidebar |
| Cards | `bg-card text-card-foreground` | Card, popover surfaces |
| Buttons | `bg-primary text-primary-foreground` | Primary actions |
| Secondary bg | `bg-secondary text-secondary-foreground` | Pill/tab backgrounds |
| Muted text | `text-muted-foreground` | Secondary labels, placeholders |
| Hover bg | `hover:bg-accent hover:text-accent-foreground` | Interactive rows |
| Borders | `border-border` | Dividers, inputs |
| Radius | `rounded-lg`, `rounded-md` | Card corners, buttons |
| Shadows | `shadow-card`, `shadow-dropdown` | Elevation |
| Layout | `w-(--sidebar-width)` | Sidebar width (14rem) |

---

## Layer Rules

### Pages (`src/app/`)

- Server components by default to maximize SEO indexing and performance
- Export static metadata or use `generateMetadata()` for dynamic pages
- Resolve route/search parameters on the server and pass them directly to containers
- Never import Zustand stores or call client hooks directly (must delegate to a client container)
- Never contain JSX markup beyond layout scaffolding (wrapping `<main>`, containers)

```tsx
// ✅ Good — Server page exporting dynamic metadata and delegating to a client container
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: `${product.name} | Brand` };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
```

```tsx
// ✅ Good — Server page exporting static metadata and delegating to a client container
export const metadata = {
  title: "All Products | Brand",
  description: "Explore our premium collection.",
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
```

### Containers / Bridges

- `"use client"` wrappers that act as the bridge between stores/hooks and presentational components.
- Naming conventions:
  - **Page-level client wrappers**: Named `XxxClient.tsx` (e.g., `ProductDetailClient.tsx`, `CheckoutPageClient.tsx`) placed in their respective component folder.
  - **Sub-page feature containers**: Named `XxxContainer.tsx` (e.g., `OrderSummaryContainer.tsx`).
- Read Zustand stores with individual selectors to avoid subscribing to the entire store state.
- Call custom business logic hooks or query hooks (e.g., `useProductDetailsQuery`, `useProductFilter`).
- Pass resolved data and event handlers down as props to children.

```tsx
// ✅ Good — Page-level container/client wrapper fetching data and passing it to presentational items
export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { data: product, isLoading, error } = useProductDetailsQuery(slug);
  const isSizeGuideOpen = useProductStore((s) => s.isSizeGuideOpen);
  const setSizeGuideOpen = useProductStore((s) => s.setSizeGuideOpen);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !product) notFound();

  return (
    <main id="main-content">
      <Breadcrumbs category={product.category} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <ImageGallery images={product.images} altText={product.altText} />
        <div className="lg:col-span-7">
          <ProductInfo product={product} />
          <ProductActions product={product} />
        </div>
      </div>
    </main>
  );
}
```

```tsx
// ✅ Good — Sub-page feature container bridging cart store and order details
import { useCartStore } from "@/stores/useCartStore";
import { calculateOrderPricing } from "@/utils/pricing";
import { OrderSummary } from "./OrderSummary";

export function OrderSummaryContainer() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());
  const { shipping, tax, total } = calculateOrderPricing(subtotal);

  if (items.length === 0) return null;

  return (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      shipping={shipping}
      tax={tax}
      total={total}
    />
  );
}
```

### Hooks (`src/hooks/`)

- Encapsulate business logic, form state, animation state, side effects
- May call Zustand stores via individual selectors
- Never import UI components
- Return plain data objects and handler functions
- Keep hooks focused — one responsibility per hook

```tsx
// ✅ Good — pure logic, returns data + handlers
export function useCheckoutForm(onOrderPlaced) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // validation, submission, callbacks
  };

  return { email, setEmail, loading, handlePlaceOrder };
}
```

### Stores (`src/stores/`)

- Zustand for global state shared across multiple components
- Cart store with `persist` middleware for `localStorage` durability
- Product store for transient UI state (no persistence)
- No JSX, no React hooks
- Use individual selectors at consumption sites to avoid unnecessary re-renders

```ts
// ✅ Good — Zustand store, focused, with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => ({ items: [...state.items, product] })),
      removeItem: (id, size) => set(...),
      clearCart: () => set({ items: [] }),
      totalPrice: () => get().items.reduce(...),
    }),
    { name: "aurora-cart" }
  )
);
```

### Presentational Components (`src/components/`)

- Receive everything via props.
- Zero store imports, zero hook imports (except UI-only utility hooks like `useBodyScrollLock` or animation-specific libraries like Framer Motion).
- No business logic, no filtering, no calculations, no data fetching.
- Pure JSX rendering with Tailwind styling.
- Prefer composition over configuration.

```tsx
// ✅ Good — pure presentational, receiving all dynamic states as props
interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function OrderSummary({ items, subtotal, shipping, tax, total }: OrderSummaryProps) {
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-border-subtle">
      <h2>Order Summary</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div>Total: {formatCurrency(total)}</div>
    </div>
  );
}
```

---

## `"use client"` Rules

| Scenario | Directive |
|---|---|
| Pure JSX layout, no hooks, no events | **None** (server component) |
| Uses Framer Motion (`motion.div`, etc.) | `"use client"` |
| Uses `useState`, `useEffect`, `useRef` | `"use client"` |
| Uses a custom hook (useCarousel, etc.) | `"use client"` |
| USES `onClick`, `onChange`, form events | `"use client"` |
| Reads a Zustand store via selector | `"use client"` |
| Page with `generateStaticParams` | **None** (server) — delegate interactivity to child client containers |

**As a rule**: start without `"use client"` and only add it when the compiler tells you it's needed. This maximizes SSG eligibility.

---

## Import Conventions

| Import | Path Prefix |
|---|---|
| Components | `@/components/...` |
| Hooks | `@/hooks/...` |
| Stores | `@/stores/...` |
| Static data | `@/data/...` |
| Utilities | `@/utils/...` |
| Animation variants | `@/animations/...` |
| Sibling files | `./ComponentName` (relative) |

---

## Directory Conventions

- Components organized by **feature** or **page**:
  - `src/components/checkout/` — checkout page
  - `src/components/landing/` — home page sections
  - `src/components/layout/` — Navbar, Footer
  - `src/components/product/listing/` — category listing page
  - `src/components/product/detail/` — product detail page
  - `src/components/story/` — brand story page
  - `src/components/ui/` — shared reusable primitives
- One component per file (named export)
- Component filenames match their export name (PascalCase)
- Hooks are named `useXxx.ts` and return plain objects

---

## Verification

Before committing, run the build to type-check everything:

```bash
npm run build
```

The build compiles TypeScript and validates types. Address any errors before pushing.
