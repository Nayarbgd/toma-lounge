# Toma Lounge — Restaurant Reservation Platform
## Implementation Playbook

> Written for developers (or future you) to fully recreate this system for any restaurant in under 2 hours.

---

# 1. Project Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│   Public Site (React/Vite)         Admin Dashboard (React/Vite) │
│   /contact → Reservation Form      /admin → Login + Dashboard   │
└────────────┬───────────────────────────────┬────────────────────┘
             │ POST /api/reservations         │ GET/PATCH/DELETE
             │                               │ Bearer token
             ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express API Server (Node.js)                  │
│   Port: $PORT (Replit-managed)                                  │
│                                                                 │
│   Routes:                                                       │
│   POST   /api/admin/login                                       │
│   GET    /api/reservations          (admin, requireAdmin)        │
│   POST   /api/reservations          (public, no auth)           │
│   PATCH  /api/reservations/:id      (admin, requireAdmin)        │
│   DELETE /api/reservations/:id      (admin, requireAdmin)        │
│   POST   /api/reservations/:id/resend-confirmation (admin)       │
│   GET    /api/admin/events          (admin, SSE stream)          │
│   GET    /api/health                                            │
└──────┬───────────────────────────────────────┬──────────────────┘
       │ supabase-js (service role)             │ resend SDK
       ▼                                        ▼
┌─────────────────┐                   ┌──────────────────────────┐
│    Supabase     │                   │         Resend           │
│                 │                   │                          │
│  PostgreSQL DB  │◄── Realtime ──────│  Owner notification      │
│  Supabase Auth  │    Postgres CDC    │  Guest confirmation      │
│  reservations   │                   │  (requires verified      │
│  table          │                   │   domain for non-owner   │
└─────────────────┘                   │   recipients)            │
                                      └──────────────────────────┘

Realtime flow:
Supabase Postgres CDC → supabaseAdmin.channel() → Node EventEmitter
→ GET /api/admin/events (SSE) → useReservationsRealtime hook → React state
```

## Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| Frontend framework | React + Vite | React 18, Vite 6 | Fast HMR, modern build |
| Frontend router | wouter | ^3.3.5 | Lightweight, no boilerplate |
| State / data fetching | TanStack React Query | v5 | Cache, mutations, invalidation |
| UI components | shadcn/ui + Radix UI | — | Accessible, composable primitives |
| Styling | Tailwind CSS v4 | catalog | Utility-first, fast iteration |
| Charts | Recharts | ^2.15.2 | Simple bar/time charts |
| Animations | Framer Motion | catalog | Smooth page transitions |
| Date handling | date-fns | ^3.6.0 | Tree-shakeable, no moment.js |
| Backend framework | Express | ^5.2.1 | Minimal, well-known |
| Backend language | TypeScript (ESM) | ~5.9.3 | Full type safety |
| Build tool (API) | esbuild | 0.27.3 | Bundles to single `dist/index.mjs` |
| Logging | pino + pino-http | ^9.14.0 | Structured JSON logs |
| Database | Supabase (PostgreSQL) | — | Realtime CDC, Auth, REST API |
| DB client | @supabase/supabase-js | ^2.108.2 | Official SDK |
| Email | Resend | ^6.14.0 | Reliable transactional email |
| Package manager | pnpm workspaces | — | Monorepo, shared deps |
| Hosting | Replit | — | Dev + prod in one place |

## Folder Structure

```
workspace/                          ← pnpm monorepo root
├── package.json                    ← workspace root scripts
├── pnpm-workspace.yaml             ← workspace globs
├── pnpm-lock.yaml
│
├── artifacts/
│   ├── api-server/                 ← Express API (backend)
│   │   ├── src/
│   │   │   ├── index.ts            ← Entry point, starts server + realtime
│   │   │   ├── app.ts              ← Express app, middleware, route mount
│   │   │   ├── routes/
│   │   │   │   ├── index.ts        ← Route aggregator
│   │   │   │   ├── admin.ts        ← POST /api/admin/login
│   │   │   │   ├── reservations.ts ← Full CRUD + resend-confirmation
│   │   │   │   ├── events.ts       ← GET /api/admin/events (SSE)
│   │   │   │   └── health.ts       ← GET /api/health
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts         ← requireAdmin (validates Supabase JWT)
│   │   │   └── lib/
│   │   │       ├── supabase.ts     ← supabaseAnon + supabaseAdmin clients
│   │   │       ├── realtime.ts     ← Supabase Realtime → Node EventEmitter
│   │   │       ├── email.ts        ← sendNewReservationEmail + sendReservationConfirmedEmail
│   │   │       └── logger.ts       ← pino logger instance
│   │   ├── build.mjs               ← esbuild config
│   │   └── package.json
│   │
│   └── toma-lounge/                ← React/Vite frontend
│       ├── src/
│       │   ├── main.tsx            ← App entry, QueryClientProvider, ToastProvider
│       │   ├── App.tsx             ← wouter Router, page routes
│       │   ├── pages/
│       │   │   ├── home.tsx        ← Landing page
│       │   │   ├── contact.tsx     ← Public reservation form (multi-step)
│       │   │   ├── menu.tsx        ← Menu page
│       │   │   ├── gallery.tsx     ← Gallery page
│       │   │   ├── about.tsx       ← About page
│       │   │   ├── reviews.tsx     ← Reviews page
│       │   │   ├── admin-login.tsx ← Admin login form
│       │   │   ├── admin-dashboard.tsx       ← Dashboard shell + tab router
│       │   │   ├── admin-reservations-tab.tsx ← Reservations table + actions
│       │   │   ├── admin-calendar-tab.tsx     ← Calendar view
│       │   │   └── admin-analytics-tab.tsx    ← Charts and stats
│       │   ├── hooks/
│       │   │   ├── use-admin-auth.ts          ← JWT storage/retrieval
│       │   │   ├── use-reservations-realtime.ts ← SSE consumer hook
│       │   │   └── use-mobile.tsx
│       │   └── components/ui/      ← shadcn/ui components
│       └── package.json
│
└── lib/                            ← Shared workspace libraries
    ├── api-zod/                    ← Zod validation schemas (auto-generated by orval)
    │   └── src/generated/api.ts
    └── api-client-react/           ← React Query hooks (auto-generated by orval)
        └── src/generated/api.ts
```

---

# 2. Environment Variables

All variables below are set in **Replit Secrets** (for sensitive values) or shared env vars (for non-sensitive config). Do not commit any of these to source control.

| Variable | Purpose | Example | Required | Where used |
|---|---|---|---|---|
| `SUPABASE_URL` | Supabase project REST/Auth URL | `https://xxxx.supabase.co` | ✅ Required | `artifacts/api-server/src/lib/supabase.ts` |
| `SUPABASE_ANON_KEY` | Supabase public anon key (respects RLS) | `eyJ...` | ✅ Required | `artifacts/api-server/src/lib/supabase.ts` — used for `supabaseAnon` (login) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | `eyJ...` | ✅ Required | `artifacts/api-server/src/lib/supabase.ts` — used for `supabaseAdmin` (all DB ops) |
| `RESEND_API_KEY` | Resend API key for sending emails | `re_xxxx` | ✅ Required | `artifacts/api-server/src/lib/email.ts` |
| `OWNER_EMAIL` | Email address that receives new reservation alerts | `owner@restaurant.com` | ✅ Required | `artifacts/api-server/src/lib/email.ts` |
| `PORT` | TCP port the API server listens on | `8080` | ✅ Required | `artifacts/api-server/src/index.ts` — Replit injects this automatically |
| `DATABASE_URL` | Direct PostgreSQL connection string | `postgresql://...` | ⚠️ Present but unused in runtime | Available in env, not used by API server at runtime (API uses supabase-js) |

> **Important — `RESEND_API_KEY` restriction:** Resend's shared `onboarding@resend.dev` sender domain only allows sending to the account owner's email address. To send guest confirmation emails to arbitrary recipients, you must verify a custom domain at [resend.com/domains](https://resend.com/domains) and update the `from` address in `email.ts`.

---

# 3. Supabase Setup Checklist

## 3.1 Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **API keys** (anon + service role) from Settings → API

## 3.2 Enable Auth

1. Supabase Dashboard → Authentication → Settings
2. Enable **Email Auth** (enabled by default)
3. Disable email confirmation for the admin user if you want immediate login (optional)
4. Create the admin user: Authentication → Users → Invite User → enter admin email + password

## 3.3 Create Tables — SQL

Run the following in Supabase Dashboard → SQL Editor:

```sql
-- ── reservations table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  party_size  INTEGER NOT NULL,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Index for date-ordered queries ─────────────────────────────
CREATE INDEX IF NOT EXISTS reservations_date_idx ON public.reservations (date DESC, time DESC);

-- ── Index for status filtering ──────────────────────────────────
CREATE INDEX IF NOT EXISTS reservations_status_idx ON public.reservations (status);
```

## 3.4 Row Level Security (RLS)

```sql
-- Enable RLS on reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (public reservation form)
CREATE POLICY "Public can create reservations"
  ON public.reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admin) can read
CREATE POLICY "Admin can read reservations"
  ON public.reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admin) can update
CREATE POLICY "Admin can update reservations"
  ON public.reservations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admin) can delete
CREATE POLICY "Admin can delete reservations"
  ON public.reservations
  FOR DELETE
  TO authenticated
  USING (true);
```

> **Note:** The API server uses the **service role key** which bypasses RLS entirely. RLS policies apply when using the anon/authenticated keys. This is the expected pattern.

## 3.5 Enable Realtime

Run in SQL Editor:

```sql
-- Enable realtime on reservations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
```

Or in Dashboard: Database → Replication → enable `reservations` table.

## 3.6 Valid Reservation Statuses

The code handles these four status values. They are not enforced by a DB constraint but are enforced in the frontend:

```
pending     → new reservation, awaiting admin action
confirmed   → admin confirmed, guest email sent automatically
cancelled   → admin cancelled
completed   → reservation fulfilled
```

---

# 4. Resend Setup Checklist

## 4.1 Create Account & API Key

1. Go to [resend.com](https://resend.com) → Sign up
2. Dashboard → API Keys → Create API Key
3. Name it (e.g. `toma-lounge-prod`) → All access
4. Copy the key → add to Replit Secrets as `RESEND_API_KEY`

## 4.2 ⚠️ Verify a Domain (REQUIRED for guest emails)

Without domain verification, Resend only allows sending to your own account email. Guest confirmation emails will fail with HTTP 403.

1. Resend Dashboard → **Domains** → Add Domain
2. Enter your restaurant domain (e.g. `tomalounge.com`)
3. Add the DNS records Resend provides to your domain registrar:
   - `SPF` record (TXT)
   - `DKIM` record (TXT × 2)
   - `DMARC` record (TXT)
4. Click **Verify** (propagation can take 24–48 hours)
5. Once verified, update `email.ts` — change both `from` addresses:

```typescript
// Before (shared domain — limited to account owner only):
from: "Toma Lounge <onboarding@resend.dev>"

// After (your verified domain — sends to anyone):
from: "Toma Lounge <reservations@tomalounge.com>"
```

## 4.3 Testing

- Owner notification: submit a reservation on the public form → check `OWNER_EMAIL` inbox
- Guest confirmation: submit reservation with a test email → admin confirms it in dashboard → check that email inbox
- Resend dashboard → Emails → verify deliveries and any bounces

---

# 5. Backend Setup

## 5.1 Install Dependencies

```bash
# From workspace root
pnpm install
```

## 5.2 Set Environment Variables in Replit

In Replit → Secrets tab, add:

```
SUPABASE_URL         = https://yourproject.supabase.co
SUPABASE_ANON_KEY    = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
RESEND_API_KEY       = re_...
```

In Replit → Environment Variables (non-secret), add:

```
OWNER_EMAIL = owner@restaurant.com
```

## 5.3 Start API Server

The workflow is already configured. Manually:

```bash
pnpm --filter @workspace/api-server run dev
```

This runs: `export NODE_ENV=development && pnpm run build && pnpm run start`

The build uses esbuild to bundle to `dist/index.mjs`, then Node runs it.

## 5.4 Verify Startup Logs

On startup you should see all of these:

```
[INFO] DIAG: RESEND_API_KEY loaded    { loaded: true }
[INFO] DIAG: OWNER_EMAIL loaded       { loaded: true, value: "owner@restaurant.com" }
[INFO] DIAG: Resend client initialized { initialized: true }
[INFO] Server listening               { port: 8080 }
[INFO] Supabase Realtime subscription active on reservations
```

## 5.5 Test Endpoints

```bash
# Health check
curl https://$REPLIT_DEV_DOMAIN/toma-lounge-api/api/health

# Login (replace with real admin credentials from Supabase Auth)
curl -X POST https://$REPLIT_DEV_DOMAIN/toma-lounge-api/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"yourpassword"}'
# → { "accessToken": "eyJ..." }

# Create reservation (public, no auth)
curl -X POST https://$REPLIT_DEV_DOMAIN/toma-lounge-api/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"555-0100","email":"test@example.com","date":"2026-07-01T19:00:00","partySize":2}'
```

---

# 6. Frontend Setup

## 6.1 Install Dependencies

```bash
pnpm install   # from workspace root
```

## 6.2 Run Development Server

The workflow is already configured. Manually:

```bash
pnpm --filter @workspace/toma-lounge run dev
```

Vite binds to `0.0.0.0` and uses `$PORT`. All `/api/*` calls go to relative URLs — the Replit proxy routes them to the API server automatically.

## 6.3 Verify Public Reservation Flow

1. Navigate to `/contact`
2. Select a date → time → party size
3. Fill name, phone, email → Submit
4. Owner should receive an email immediately
5. In Supabase → Table Editor → reservations → new row should appear

## 6.4 Verify Dashboard

1. Navigate to `/admin`
2. Log in with Supabase Auth credentials
3. Reservations tab → all rows visible
4. Change a reservation status to "Confirmed" → guest email should fire
5. Realtime indicator (green dot top-right) should show "Live"

---

# 7. Reservation Flow Documentation

```
PUBLIC FORM (contact.tsx, Step 3)
  ├─ Collects: name, phone, email, date, time, partySize, occasion, notes
  └─ Validates: all required, email format, phone length

         │ POST /api/reservations  (no auth required)
         ▼

API SERVER (reservations.ts — POST handler)
  ├─ Zod validates body with CreateReservationBody schema
  ├─ Normalizes date/time → ISO date string + HH:MM:SS time
  ├─ Inserts row into Supabase reservations table
  │   └─ If email column missing: retries without email field (graceful degradation)
  ├─ Fires sendNewReservationEmail() → Resend → OWNER_EMAIL inbox
  └─ Returns 201 + reservation JSON

         │ INSERT event
         ▼

SUPABASE REALTIME (postgres_changes CDC)
  └─ supabaseAdmin.channel("reservations-admin-realtime")
         │
         ▼
  Node EventEmitter (realtime.ts)
         │ emitter.emit("change", event)
         ▼
  SSE Stream (GET /api/admin/events)
         │ text/event-stream
         ▼
  useReservationsRealtime hook (frontend)
  └─ Updates React Query cache → dashboard re-renders instantly

ADMIN DASHBOARD (admin-reservations-tab.tsx)
  ├─ Sees new reservation appear in real time (no page refresh)
  ├─ Can: Confirm / Cancel / Complete / Delete / Resend Email
  └─ Status change → PATCH /api/reservations/:id (requireAdmin)

         │ PATCH /api/reservations/:id  (Bearer token required)
         ▼

API SERVER (reservations.ts — PATCH handler)
  ├─ Validates Bearer token via Supabase Auth
  ├─ Fetches current record (to check previousStatus and guestEmail)
  ├─ Updates status in Supabase
  ├─ Responds 200 immediately (fire-and-forget email)
  └─ If transition is (any → "confirmed") AND guest has email:
       └─ sendReservationConfirmedEmail() → Resend → guest inbox

GUEST RECEIVES confirmation email with:
  - Reservation date, time, party size
  - Restaurant address + Google Maps link
  - Contact information
```

---

# 8. Dashboard Documentation

## Overview Tab

- **Purpose:** High-level stats — Today's reservations, This Week, Total, Total Guests
- **File:** `artifacts/toma-lounge/src/pages/admin-dashboard.tsx` (StatCard components)
- **Data source:** `GET /api/reservations` (full list, filtered client-side)
- **No dedicated API endpoint** — computed from the same reservation list

## Reservations Tab

- **Purpose:** Full list with filters, search, bulk actions, status changes
- **File:** `artifacts/toma-lounge/src/pages/admin-reservations-tab.tsx`
- **API endpoints:**
  - `GET /api/reservations` — list all
  - `PATCH /api/reservations/:id` — update status or notes
  - `DELETE /api/reservations/:id` — delete
  - `POST /api/reservations/:id/resend-confirmation` — manually resend guest email
- **Features:**
  - Date filters: Today / This Week / All / Custom range
  - Status filters: Pending / Confirmed / Cancelled / Completed
  - Name/phone search
  - Sort by date or party size
  - Bulk confirm (select multiple pending reservations)
  - Real-time updates via SSE
  - Resend Email button (blue mail icon) on confirmed rows

## Calendar Tab

- **Purpose:** Visual calendar view of reservations by date
- **File:** `artifacts/toma-lounge/src/pages/admin-calendar-tab.tsx`
- **Data source:** same reservation list passed as prop
- **No additional API calls**

## Analytics Tab

- **Purpose:** Cancellation rate, repeat guests, peak hours (bar chart), peak days (bar chart)
- **File:** `artifacts/toma-lounge/src/pages/admin-analytics-tab.tsx`
- **Data source:** same reservation list, computed with `useMemo`
- **Charts:** Recharts `BarChart` — reservations by hour of day, by day of week

## Tables / Settings Tabs

- **Current state:** "Coming Soon" placeholder
- Displays a message: `Run migrations/001_admin_features.sql in Supabase SQL Editor to unlock this section`
- These tabs are scaffolded but not yet implemented

---

# 9. Deployment Checklist

## On Replit (Development)

1. Fork/clone this project in Replit
2. Open Secrets tab → add all 5 secrets (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
3. Open Environment Variables → add OWNER_EMAIL
4. Run `pnpm install` in Shell
5. Start the `artifacts/api-server: API Server` workflow
6. Start the `artifacts/toma-lounge: web` workflow
7. Check both workflows show **RUNNING** status
8. Verify startup logs show all DIAG checks green

## Publishing on Replit (Production)

1. Click **Publish** in Replit
2. All secrets are automatically available in production
3. Production runs the same `dev` command — the build step is included
4. Replit handles TLS, health checks, and uptime

## Supabase Production

1. Create a **separate Supabase project** for production (do not use dev project)
2. Run all SQL from Section 3 on the new project
3. Create the admin user in the new project's Auth
4. Update all 3 Supabase secrets to point to the production project
5. Enable Realtime on the production `reservations` table

## Resend Production

1. Verify your domain (Section 4.2) — this is mandatory for guest emails
2. Create a production API key (separate from dev if desired)
3. Update `RESEND_API_KEY` secret
4. Update both `from` addresses in `email.ts` to use your verified domain

---

# 10. Troubleshooting Guide

## Missing Secrets

**Symptom:** API server crashes on startup with `Missing Supabase environment variables`

**Fix:**
1. Check Replit → Secrets tab — confirm all 3 Supabase keys exist
2. Restart the API server workflow after adding secrets
3. Verify startup logs show `DIAG: RESEND_API_KEY loaded: true`

---

## Broken Supabase Connection

**Symptom:** All API calls return 500, logs show Supabase errors

**Fix:**
1. Confirm `SUPABASE_URL` format is exactly `https://xxxx.supabase.co` (no trailing slash)
2. Confirm `SUPABASE_SERVICE_ROLE_KEY` is the **service role** key, not the anon key
3. Check Supabase project is not paused (free tier pauses after inactivity)
4. Go to Supabase → project → click **Restore** if paused

---

## Broken Realtime

**Symptom:** Dashboard does not update when new reservations arrive; green dot shows disconnected

**Fix:**
1. Check API server logs for `Supabase Realtime subscription error`
2. In Supabase: Database → Replication → confirm `reservations` table is in `supabase_realtime` publication
3. Run: `ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;`
4. Restart the API server workflow

---

## Dashboard Not Updating

**Symptom:** New reservations don't appear without page refresh

**Diagnosis chain:**
1. Is the realtime green dot showing "Live"? If not → fix realtime (above)
2. Check browser console for SSE errors on `/api/admin/events`
3. Confirm the admin token is valid (not expired — session is 1 hour by default)
4. Log out and log back in to get a fresh token

---

## Owner Email Not Sending

**Symptom:** New reservation submitted, no email to owner

**Fix:**
1. Restart API server → check startup log: `RESEND_API_KEY loaded: true`
2. Check startup log: `OWNER_EMAIL loaded: true`
3. If `OWNER_EMAIL` not set → add it in Replit Environment Variables (not Secrets)
4. Submit a test reservation → check API logs for `DIAG: Owner email function called`
5. If error in logs: check Resend dashboard for bounce/block reason

---

## Guest Confirmation Email Not Sending

**Symptom:** Admin marks reservation as "Confirmed", guest receives nothing

**Most common causes:**

| Cause | Log message | Fix |
|---|---|---|
| No verified domain | `403 validation_error: You can only send testing emails to your own email address` | Verify domain at resend.com/domains; update `from` in `email.ts` |
| No email on file | `Reservation confirmed but no guest email on file` | Guest submitted form before email field existed; use Resend Email button; future bookings will work |
| Reservation already confirmed | No email log | Status was already "confirmed"; use the blue Resend Email button in dashboard |
| RESEND_API_KEY not set | `RESEND_API_KEY not set — skipping confirmed email` | Add `RESEND_API_KEY` to Replit Secrets; restart server |

---

## Authentication Failures

**Symptom:** Dashboard shows login loop or 401 errors on API calls

**Fix:**
1. Confirm admin user exists in Supabase → Authentication → Users
2. Try logging in manually: `POST /api/admin/login` with email+password
3. If login fails: reset password via Supabase Dashboard → Auth → Users → Reset Password
4. If token expired: log out and log back in (tokens last 1 hour)
5. Confirm `SUPABASE_ANON_KEY` is set (used for `supabaseAnon.auth.signInWithPassword`)

---

## Invalid Environment Variables

**Symptom:** Specific keys fail silently

**Quick check script — run in Replit Shell:**

```bash
node -e "
const keys = ['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','OWNER_EMAIL','PORT'];
keys.forEach(k => console.log(k + ':', !!process.env[k] ? 'SET' : 'MISSING'));
"
```

---

## Deployment Failures

**Symptom:** Replit publish fails or app crashes in production

**Fix:**
1. Confirm all secrets are in Replit Secrets (they carry over to production automatically)
2. Check that the `PORT` env var is not hardcoded — the app reads `process.env.PORT`
3. Check that `vite.config.ts` has `server.allowedHosts: true` or the Replit domain is whitelisted
4. Check build logs for TypeScript errors: run `pnpm typecheck` in Shell

---

# 11. New Restaurant Onboarding Checklist

Use this list to clone the project for a new restaurant. Target time: **under 2 hours**.

```
□ STEP 1 — Fork Project (5 min)
  □ Duplicate the Replit project
  □ Rename project to restaurant name
  □ Update restaurant name, contact info, and colors in the frontend

□ STEP 2 — Supabase (15 min)
  □ Create new Supabase project at supabase.com
  □ Note Project URL, anon key, service role key
  □ Open SQL Editor → run Section 3.3 SQL (create reservations table)
  □ Open SQL Editor → run Section 3.4 SQL (RLS policies)
  □ Open SQL Editor → run Section 3.5 SQL (enable realtime)
  □ Authentication → Users → create admin user (email + password)

□ STEP 3 — Resend (15 min)
  □ Create Resend account or use existing
  □ Create new API key for this restaurant
  □ Add domain → add DNS records → wait for verification (up to 24h)
  □ Note: you can skip domain verification temporarily to test owner emails only

□ STEP 4 — Replit Secrets (5 min)
  □ SUPABASE_URL = https://xxxx.supabase.co
  □ SUPABASE_ANON_KEY = eyJ...
  □ SUPABASE_SERVICE_ROLE_KEY = eyJ...
  □ RESEND_API_KEY = re_...

□ STEP 5 — Replit Environment Variables (2 min)
  □ OWNER_EMAIL = owner@newrestaurant.com

□ STEP 6 — Update email.ts (5 min)
  □ Change both `from` addresses to use verified domain
  □ Example: "Restaurant Name <reservations@newrestaurant.com>"

□ STEP 7 — Branding (20 min)
  □ Update restaurant name, tagline, description
  □ Update address, phone number, Google Maps link
  □ Update opening hours
  □ Replace images/gallery
  □ Update color scheme (Tailwind config / CSS variables)
  □ Update menu items if applicable

□ STEP 8 — Start Workflows (3 min)
  □ Start "API Server" workflow → verify startup logs (all DIAG green)
  □ Start "web" workflow → verify Vite starts without errors

□ STEP 9 — Test Reservations (10 min)
  □ Submit test reservation via public form (/contact)
  □ Verify owner email arrives
  □ Open admin dashboard (/admin) → log in
  □ Verify reservation appears in dashboard
  □ Change status to "Confirmed"
  □ Verify guest confirmation email arrives (requires verified Resend domain)
  □ Test "Resend Email" button on confirmed reservation
  □ Verify real-time update (open dashboard in two tabs simultaneously)

□ STEP 10 — Deploy (5 min)
  □ Click Publish in Replit
  □ Test all flows on production URL
  □ Share /admin URL with restaurant owner + their login credentials
```

---

# 12. Quick Start Guide (Print / PDF Version)

```
╔═══════════════════════════════════════════════════════════════════╗
║         RESTAURANT RESERVATION PLATFORM — QUICK START            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  1. SUPABASE                                                      ║
║     □ Create project → note URL, anon key, service role key       ║
║     □ SQL Editor → run: CREATE TABLE reservations (...)           ║
║     □ Enable RLS + realtime on reservations table                 ║
║     □ Auth → create admin user (email + password)                 ║
║                                                                   ║
║  2. RESEND                                                        ║
║     □ Create account → create API key                             ║
║     □ Domains → add domain → add DNS records → verify             ║
║     □ Update email.ts from: "..." to use verified domain          ║
║                                                                   ║
║  3. REPLIT SECRETS                                                ║
║     □ SUPABASE_URL                                                ║
║     □ SUPABASE_ANON_KEY                                           ║
║     □ SUPABASE_SERVICE_ROLE_KEY                                   ║
║     □ RESEND_API_KEY                                              ║
║                                                                   ║
║  4. REPLIT ENV VARS (non-secret)                                  ║
║     □ OWNER_EMAIL = owner@restaurant.com                          ║
║                                                                   ║
║  5. BRANDING                                                      ║
║     □ Restaurant name, address, phone, hours                      ║
║     □ Colors, images, menu                                        ║
║                                                                   ║
║  6. TEST                                                          ║
║     □ Submit reservation → owner email arrives?                   ║
║     □ Confirm in dashboard → guest email arrives?                 ║
║     □ Real-time dot green in dashboard?                           ║
║                                                                   ║
║  7. DEPLOY                                                        ║
║     □ Replit → Publish                                            ║
║     □ Share /admin URL + login to owner                           ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  STARTUP LOG CHECKLIST (restart API server and verify these):    ║
║  ✅ RESEND_API_KEY loaded: true                                   ║
║  ✅ OWNER_EMAIL loaded: true                                      ║
║  ✅ Resend client initialized: true                               ║
║  ✅ Server listening { port: XXXX }                               ║
║  ✅ Supabase Realtime subscription active on reservations         ║
╠═══════════════════════════════════════════════════════════════════╣
║  KEY FILES TO CUSTOMIZE PER RESTAURANT:                          ║
║  • artifacts/api-server/src/lib/email.ts  → from address         ║
║  • artifacts/toma-lounge/src/pages/home.tsx → landing page       ║
║  • artifacts/toma-lounge/src/pages/contact.tsx → form + hours    ║
║  • artifacts/toma-lounge/src/pages/menu.tsx → menu items         ║
║  • artifacts/toma-lounge/src/pages/about.tsx → about content     ║
║  • artifacts/toma-lounge/src/layout.tsx → nav + footer           ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Diagnostic Log Reference

Every time the API server starts, these logs appear. Use them to verify the system is healthy:

```
[INFO] DIAG: RESEND_API_KEY loaded    { loaded: true }   ← email will work
[INFO] DIAG: OWNER_EMAIL loaded       { loaded: true, value: "..." }
[INFO] DIAG: Resend client initialized { initialized: true }
[INFO] Server listening               { port: 8080 }
[INFO] Supabase Realtime subscription active on reservations
```

Per-request email logs (appear when a reservation is created or confirmed):

```
[INFO] DIAG: Owner email function called      { guest: "...", resendReady: true, ownerEmailSet: true }
[INFO] DIAG: Calling resend.emails.send       { to: "owner@...", subject: "..." }
[INFO] DIAG: Resend API success               { resendResponse: { id: "..." } }
[INFO] Owner notification email sent          { to: "...", guest: "..." }

[INFO] DIAG: Guest confirmation email called  { guest: "...", to: "...", resendReady: true }
[INFO] DIAG: Calling resend.emails.send       { to: "guest@..." }
[INFO] DIAG: Resend API success               { resendResponse: { id: "..." } }
[INFO] Reservation confirmed email sent       { to: "...", guest: "..." }
```

If you see `403 validation_error` on the guest confirmation log, you need to verify a domain in Resend (see Section 4.2).

---

*Last updated: June 2026 | Platform: Replit + Supabase + Resend*
