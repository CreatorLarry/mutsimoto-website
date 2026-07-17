# Mutsimoto filtration catalogue

A responsive product catalogue for Mutsimoto Motor Company, focused exclusively on oil, fuel, and air filters for automotive and industrial applications.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. Production validation uses:

```bash
npm run lint
npm run build
```

## Project shape

- `app/` — App Router pages and route-level loading states
- `components/layout/` — header, mobile navigation, footer, and global contact affordances
- `components/products/` — catalogue cards, filters, drawer, search results, and specifications
- `components/ui/` — reusable visual and accessibility primitives
- `data/` — phase-one mock products, branches, applications, categories, and downloads
- `lib/products.ts` — asynchronous repository boundary that Supabase can replace later
- `types/` — strict shared TypeScript interfaces
- `public/images/` — future approved photography and product media

## Mock catalogue

Products currently live in `data/products.ts`. Add another object that satisfies the `Product` interface in `types/index.ts`; the catalogue, search, filters, and static product route will pick it up automatically.

Supabase is intentionally not connected in phase one. A later phase can replace the functions in `lib/products.ts` with Supabase queries and map Storage URLs into the existing `image` field without rewriting the UI.
