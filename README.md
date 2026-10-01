# Just Born — Premium & Heirloom Toy Store

A production-ready Next.js e-commerce frontend for **Just Born**, a modern, playful, and heirloom toy boutique crafted for curious children and thoughtful parents.

---

## 🎨 Visual Identity & Aesthetic

- **Design Tone:** Playful, premium, warm, modern, and delightful — avoiding cheap childish clutter while remaining inviting and comforting.
- **Palette:**
  - *Warm Terracotta / Clementine (`#E76F51`):* Primary brand energy, action buttons, playful accents.
  - *Heirloom Oat & Cream (`#FDFBF7`, `#FFF9F2`):* Canvas backgrounds, soothing Scandinavian warmth.
  - *Honey Gold (`#E9C46A`):* Joyful highlight, rating stars, badges.
  - *Eucalyptus Sage (`#2A9D8F`):* Non-toxic, natural wood, sustainability pillars.
  - *Espresso Charcoal (`#26221F`):* High-contrast readable typography.
- **Typography:** `Plus Jakarta Sans` with geometric rounded terminals.
- **Border Radii:** Generous `rounded-2xl` and `rounded-3xl` cards with pill `rounded-full` controls.
- **Shadows:** Custom organic warm diffused shadows (`warm-shadow`, `warm-shadow-lg`).

---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** TypeScript (Strict type safety, 0 compiler errors)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Micro-Interactions & Animation:** [Framer Motion](https://www.framer-motion.com/) & [canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Application Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with font, providers (Toast, Wishlist, Cart), Navbar & Footer
│   ├── page.tsx                # Homepage featuring all 10 core sections
│   ├── shop/page.tsx           # Collection catalog with filter chips, age groups, search & sort
│   ├── product/[slug]/page.tsx # Detailed product view with gallery, specs, reviews, and related toys
│   ├── cart/page.tsx           # Cart page with shipping progress meter, promo codes & item management
│   ├── checkout/page.tsx       # 3-step checkout with gift note & order summary (Supabase-ready)
│   ├── login/page.tsx          # Auth sign-in with pre-filled demo parent account
│   ├── register/page.tsx       # Auth registration with child age stage onboarding
│   ├── account/page.tsx        # Profile overview, saved delivery addresses & preferences
│   ├── orders/page.tsx         # Customer order history, tracking previews & reordering
│   ├── wishlist/page.tsx       # Saved favorites with bulk 'Add All to Basket'
│   └── admin/page.tsx          # Store admin overview: revenue, fulfillment status & catalog table
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Polymorphic button (primary, secondary, outline, ghost, soft, danger)
│   │   ├── Input.tsx           # Labeled input with icons, helper text, and validation states
│   │   ├── Modal.tsx           # Accessible modal with spring scale & backdrop blur
│   │   ├── Badge.tsx           # Product tags (Bestseller, New, Eco, Heirloom, Montessori, Age)
│   │   ├── Toast.tsx           # Animated toast notification stack
│   │   ├── LoadingSkeleton.tsx # Shimmer card and grid skeletons
│   │   └── EmptyState.tsx      # Delightful illustrations for zero-state carts/wishlists/orders
│   ├── layout/
│   │   ├── Navbar.tsx          # Announcement bar, sticky header, live search modal, mobile drawer
│   │   ├── Footer.tsx          # Pillars, trust badges, customer care, and newsletter
│   │   └── CartDrawer.tsx      # Slide-out quick basket drawer with free shipping tracker
│   ├── product/
│   │   ├── ProductCard.tsx     # Card with hover zoom, quick view, age badge, and wishlist toggle
│   │   ├── ProductGrid.tsx     # Responsive grid with animated transitions & modal trigger
│   │   ├── CategoryCard.tsx    # Pastel category card with playful illustrations
│   │   └── QuickViewModal.tsx  # In-place product preview modal
│   └── home/
│       ├── HeroSection.tsx
│       ├── FeaturedCategories.tsx
│       ├── FeaturedProducts.tsx
│       ├── NewArrivals.tsx
│       ├── BestSellers.tsx
│       ├── PromoBanner.tsx
│       ├── WhyJustBorn.tsx
│       ├── CustomerReviews.tsx
│       └── NewsletterSection.tsx
├── context/
│   ├── CartContext.tsx         # Basket state with localStorage persistence and confetti
│   ├── WishlistContext.tsx     # Saved items with localStorage persistence
│   └── ToastContext.tsx        # High-priority alert stack
├── lib/
│   ├── types.ts                # TypeScript domain models
│   ├── mock-data.ts            # Realistic heirloom toys, categories, reviews & test orders
│   ├── utils.ts                # Price formatters, classnames, slug generator
│   └── services/               # Supabase-ready service layer
│       ├── productService.ts   # Product queries, category lookups & related toy calculations
│       ├── orderService.ts     # Order creation & history retrieval
│       └── authService.ts      # Auth management & profile update abstractions
```

---

## 🧩 Architectural Readiness for Supabase

UI components **never** directly invoke mock data or database drivers. All data access flows through the service layer located in `src/lib/services/`:

- `productService.getProducts(options)`
- `productService.getProductBySlug(slug)`
- `orderService.createOrder(params)`
- `authService.login(email)`

To connect Supabase:
1. Install `@supabase/supabase-js`.
2. Configure environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. In `src/lib/services/productService.ts` and `src/lib/services/orderService.ts`, replace the simulated async returns with Supabase client queries (e.g. `const { data } = await supabase.from('products').select('*')`). No UI component refactoring is required.

---

## 🏃 Getting Started

### Development Server
```bash
npm run dev
# or on a specific port
npm run dev -- -p 3005
```

### Production Build & Launch
```bash
npm run build
npm run start -- -p 3005
```

Visit [http://localhost:3005](http://localhost:3005) to experience the live Just Born storefront.
