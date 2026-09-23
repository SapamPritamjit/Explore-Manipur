# Explore Manipur

Hackathon MVP for the Re-Imagining Manipur 2026 Hackathon (deadline 23 Sep 2026).

Full roadmap and product plan:
[`SmartTrip_Manipur_Project_Plan.md`](SmartTrip_Manipur_Project_Plan.md)
Development rules:
[`AGENTS.md`](AGENTS.md)

## Commands

```text
npm run dev         # start development server (http://localhost:3000)
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # TypeScript --noEmit
npm run test        # Vitest (unit tests, node environment)
```

Run checks in this order before finishing work: `lint` → `typecheck` → `test` → `build`.

## Setup

1. Copy `.env.example` to `.env.local` and fill in credentials:

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser-safe)
   - `SUPABASE_SECRET_KEY` (server-only)
   - `GROQ_API_KEY` (server-only)

2. `npm install`
3. `npm run dev` → open http://localhost:3000
4. `/api/health` verifies configuration and Supabase connectivity.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · Supabase (PostgreSQL) ·
Leaflet + OpenStreetMap · Groq · Open-Meteo · Zustand · Vitest · ESLint.

See `AGENTS.md` for architecture and data rules. Do not invent tourism facts.