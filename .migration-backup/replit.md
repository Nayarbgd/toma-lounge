# Toma Lounge

A complete, high-converting restaurant website for Toma Lounge — a Syrian / Middle Eastern restaurant & shisha lounge in Barsha Heights, Dubai. Includes a customer-facing multi-page website, online reservation form, and a staff admin dashboard backed by Supabase.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from `PORT` env)
- `pnpm --filter @workspace/toma-lounge run dev` — run the frontend (port from `PORT` env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: Supabase (PostgreSQL via @supabase/supabase-js) — reservations only
- Internal DB: Drizzle ORM over Replit PostgreSQL (reserved for future use)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (don't edit manually)
- `lib/api-zod/src/generated/` — generated Zod validators (don't edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/supabase.ts` — two Supabase clients (anon + service role)
- `artifacts/api-server/src/middleware/auth.ts` — admin JWT verification middleware
- `artifacts/toma-lounge/src/pages/` — all frontend pages (home, menu, about, gallery, reviews, contact, admin-login, admin-dashboard)
- `artifacts/toma-lounge/src/hooks/use-admin-auth.ts` — localStorage JWT helpers for admin
- `supabase/schema.sql` — SQL schema to run in Supabase SQL Editor before deploying

## Architecture decisions

- **Supabase for reservations**: Public INSERT uses the anon key (enforced by RLS — anon can only INSERT, not SELECT/UPDATE). GET/PATCH use the service role key, server-side only, via the Express backend. The service role key is never sent to the browser.
- **Admin auth via Supabase Auth**: The admin login page calls `POST /api/admin/login` (Express), which calls `supabase.auth.signInWithPassword`. The returned JWT is stored in localStorage and sent as `Authorization: Bearer` to protected API endpoints.
- **API-first with codegen**: The OpenAPI spec in `lib/api-spec/openapi.yaml` is the single source of truth. Run `pnpm --filter @workspace/api-spec run codegen` after any spec change.
- **Orval index.ts patch**: Orval regenerates `lib/api-zod/src/index.ts` on every codegen run and appends a `./generated/types` export that conflicts with `./generated/api` exports. The codegen script patches the index.ts after orval runs.

## Product

- **Customer site**: Home (hero, CTAs, social proof), Menu (full categorized menu), About, Gallery, Reviews, Contact/Reservations
- **Admin dashboard**: Staff login at `/admin`, reservation list with status badges and inline status update dropdowns at `/admin/dashboard`. Responsive (table on desktop, cards on mobile).
- **Reservation flow**: Customer fills form → POST /api/reservations → saved in Supabase → visible in admin dashboard → staff can mark confirmed/completed/cancelled.

## Setup: Supabase Database

1. Go to your Supabase project → SQL Editor
2. Run `supabase/schema.sql` — this creates the `reservations` table, RLS policies, and indexes
3. To use admin login, create a Supabase Auth user in Authentication → Users with your staff email/password
4. Set the 3 env vars in Replit Secrets (already set for this project): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Orval index.ts**: After every `codegen` run, the `lib/api-zod/src/index.ts` barrel is rewritten. The codegen script (`lib/api-spec/package.json`) patches it. If you add `schemas:` back to the orval zod config, the duplicate-export conflict returns — don't.
- **Supabase RLS**: The anon client is used for public INSERT only. All admin reads/writes use the service role client in Express. If you add new admin operations, always use `supabaseAdmin` (service role), never `supabaseAnon`.
- **Do not run `pnpm dev` at the workspace root.** Use `restart_workflow` or run per-package with `--filter`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
