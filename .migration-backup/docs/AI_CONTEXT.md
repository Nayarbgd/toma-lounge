# AI Context — Reusable Business System Framework

> This file acts as a permanent knowledge base for any AI assistant (Replit AI, Claude, ChatGPT, Cursor, etc.) working on this project or any derivative of it.
>
> Read this file before making any changes. Treat every rule here as a constraint, not a suggestion.

---

## What This Project Is

This is a **reusable client business system** — a production-ready platform template that can be adapted for any service business (restaurants, clinics, gyms, law firms, barbershops, agencies, etc.).

The core architecture separates two concerns:

1. **Custom UI layer** — brand-specific frontend: colors, fonts, copy, images, pages. Changes per client.
2. **Reusable business engine** — the systems that every service business needs: reservations, booking, CRM, notifications, auth, dashboards, analytics, scheduling, payments. Shared across clients with configuration only.

The goal is to never rebuild these systems from scratch. Build once, configure per client, deploy fast.

---

## Project Philosophy

### Build Reusable Systems
Every feature should be designed as if it will be reused. Avoid client-specific logic inside business engine modules. Pass configuration in; never hardcode business names, emails, or rules into shared code.

### Prefer Modular Architecture
Each feature lives in its own module. Modules communicate through well-defined interfaces. No module should know the internals of another.

### Prefer Additive Changes Over Destructive Refactors
If something works, leave it working. Add new capabilities alongside existing ones. Deprecate gradually. Never delete working code without a documented reason.

### Prioritize Maintainability and Scalability
Future you (or another developer) should be able to understand any file in under 5 minutes. Prefer clarity over cleverness. Comments explaining *why* are more valuable than comments explaining *what*.

### Minimize Dependencies
Every dependency is a liability. Before adding a package, ask: can this be done with 20 lines of code instead? Dependencies should earn their place through genuine complexity reduction.

### Preserve Working Functionality
The most dangerous words in development are "while I'm in here, I'll also fix...". Make the minimum change to achieve the goal. Unrelated working code is not your responsibility to touch.

---

## AI Operating Rules

These rules apply to every AI assistant working on this codebase. Follow them in order.

### Before Touching Any Code

1. **Read the existing architecture first.** Open `docs/IMPLEMENTATION_PLAYBOOK.md` and any `ARCHITECTURE.md` present. Understand what exists before proposing what to add.
2. **Never make assumptions about what exists.** Use search/grep/read tools to verify. A file you assume exists may not. A function you assume is unused may be critical.
3. **Trace the full request flow** for any feature you intend to modify. Frontend → API → Database → Response → UI update. Know every hop.
4. **Identify all places a change will affect** before making it. Check for references, imports, and downstream consumers.

### When Proposing Changes

5. **Explain proposed changes before implementing them.** State what will change, why, and what the risk is. Get confirmation for any change that affects data, auth, or API contracts.
6. **Make incremental changes.** One concern at a time. Do not bundle unrelated changes into a single edit.
7. **Avoid unnecessary refactors.** Do not rename, restructure, or rewrite code that is not related to the current task. Cosmetic changes are not improvements if they introduce risk.
8. **Avoid introducing complexity.** If a solution requires a new abstraction layer, a new dependency, or a significant new pattern, justify it explicitly.

### When Writing Code

9. **Keep business logic separate from presentation.** Computations, validations, and data transformations belong in utility functions or API handlers — not inside React components.
10. **Prefer configuration over hardcoding.** Business names, email addresses, URLs, thresholds, and rules should come from environment variables or config objects — not string literals scattered through code.
11. **Preserve backward compatibility.** If you change an API endpoint, a database column, or a shared type, audit every consumer before changing the contract.
12. **Use the type system.** TypeScript types are not optional. Avoid `any`. Validate at boundaries (user input, API responses, env vars).

### When Debugging

13. **Diagnose before changing code.** Read logs. Reproduce the issue. Identify the root cause. Do not guess and patch.
14. **Add diagnostic logging first.** A well-placed `console.log` or structured log statement will tell you the root cause faster than a code change.
15. **Remove diagnostic code when done.** Temporary logs should be labeled with `// TEMP` and cleaned up before the session ends.

---

## Architecture Principles

### Frontend

- **Framework:** React + Vite (fast HMR, modern ESM build)
- **Router:** lightweight (wouter or React Router) — no framework-level routing
- **State:** TanStack React Query for server state; local `useState` for UI state
- **UI:** shadcn/ui + Radix UI (accessible, composable, unstyled primitives)
- **Styling:** Tailwind CSS (utility-first; no CSS-in-JS)
- **Design rule:** every page is a composition of small, reusable components — never one giant file
- **API calls:** always use the generated API client hooks (`@workspace/api-client-react`); never call `fetch` directly in components

### Backend

- **Framework:** Express (minimal, well-understood, unopinionated)
- **Language:** TypeScript (ESM modules), compiled with esbuild to a single bundle
- **Logging:** pino (structured JSON — never `console.log` in production)
- **Middleware stack:** pino-http → cors → express.json → routes
- **Route organization:** one file per resource (`reservations.ts`, `admin.ts`, `events.ts`)
- **Input validation:** Zod schemas on every POST/PATCH body — reject at the boundary, never trust client input

### Database

- **Platform:** Supabase (PostgreSQL)
- **Client:** two instances — `supabaseAnon` (uses anon key, respects RLS) and `supabaseAdmin` (uses service role key, bypasses RLS)
- **Rule:** all API-server database operations use `supabaseAdmin` — RLS is a safety net, not the primary access control layer (the API's `requireAdmin` middleware is the gate)
- **Schema changes:** always via SQL migrations in a dedicated `migrations/` folder; never alter production tables without a rollback plan
- **No ORM magic for critical paths:** raw Supabase queries for reservation CRUD; Drizzle ORM available for more complex querying

### Authentication

- **Provider:** Supabase Auth (email + password for admin)
- **Pattern:** admin logs in → receives JWT access token → sends it as `Authorization: Bearer <token>` on every admin API call → `requireAdmin` middleware validates the token via `supabaseAdmin.auth.getUser(token)`
- **Storage:** token stored in `sessionStorage` or `localStorage` on the frontend (`use-admin-auth` hook)
- **No cookie auth:** stateless JWT — no session cookies, no CSRF tokens needed
- **Public routes:** `POST /api/reservations` and `POST /api/admin/login` require no auth

### Emails

- **Provider:** Resend
- **Pattern:** fire-and-forget (email is sent after the DB write returns; never block the HTTP response on email delivery)
- **Two email types:**
  - Owner notification → fires on every new reservation
  - Guest confirmation → fires when admin changes status to "confirmed"
- **Critical constraint:** Resend's shared `onboarding@resend.dev` sender only allows sending to the account owner's email. For guest emails (arbitrary recipients), a verified custom domain is mandatory.
- **Customization:** both `from` addresses in `email.ts` must be updated per client deployment

### Realtime

- **Pattern:** Supabase Postgres CDC → supabase-js channel subscription on the API server → Node `EventEmitter` → SSE stream to browser
- **Why not WebSockets:** SSE is simpler, HTTP/1.1 compatible, proxy-friendly, and sufficient for this read-heavy broadcast use case
- **Heartbeat:** 25-second keep-alive comments prevent proxy/load balancer timeout
- **Consumer hook:** `useReservationsRealtime` — reads the SSE stream, updates React Query cache on INSERT/UPDATE/DELETE events

### Admin Dashboards

- **Principle:** mobile-first, role-gated, real-time where useful
- **Tab structure:** Overview (stats) → Reservations (list + actions) → Calendar → Analytics → Tables/Settings
- **Role model:** currently single-role (admin = full access). Design new tabs to be role-aware if multi-role support is added.
- **Real-time indicator:** always show the user whether the live connection is active (green dot)
- **Analytics:** compute from the in-memory reservation list using `useMemo` — no dedicated analytics endpoint unless data volume demands it

### APIs

- **Base path:** `/api`
- **Versioning:** version (`/api/v2/...`) only when introducing breaking contract changes; do not version preemptively
- **Response format:** `{ data }` on success, `{ error: string }` on failure
- **HTTP status codes:** 200 OK, 201 Created, 400 Bad Request (validation), 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
- **Input validation:** Zod schema on every mutating endpoint — reject with 400 + Zod error message before touching the database
- **No silent failures:** if a DB write fails, return a 500. If an email fails, log the error but still return 200 (email is non-blocking)

### Environment Variables

- **Never expose secrets to the frontend** — Supabase service role key, Resend API key, and any other server-only secrets stay on the API server
- **Validate on startup** — if a required env var is missing, throw immediately with a clear error message (fail fast, not silently)
- **Document every variable** — every env var used in the codebase must appear in the playbook
- **Replit pattern:** sensitive vars go in Replit Secrets; non-sensitive config goes in Environment Variables

### Modular Feature Design

Each feature module should be self-contained and follow this pattern:

```
feature/
├── route.ts          ← Express router (HTTP interface)
├── service.ts        ← Business logic (pure functions, no HTTP knowledge)
├── schema.ts         ← Zod validation schemas
└── email.ts          ← Email templates for this feature (optional)
```

Features should not import from each other's internal files. Shared utilities live in `lib/`.

---

## Environment Variable Rules

1. **Never expose a secret to the frontend.** Service role keys, payment keys, and internal API tokens are backend-only. If the frontend needs an API key, it must be a public/restricted key designed for client use.
2. **Validate on startup, not on first use.** Check all required env vars before the server starts accepting requests. A missing `RESEND_API_KEY` that fails silently on the first email is harder to debug than a startup crash.
3. **Document all env vars.** Every new env var introduced must be added to the project playbook with: name, purpose, example value, required/optional, frontend or backend, and files that use it.
4. **Prefer explicit validation.** Use a pattern like:
   ```typescript
   if (!process.env.REQUIRED_VAR) {
     throw new Error("REQUIRED_VAR is required but not set.");
   }
   ```
5. **Separate secrets from config.** API keys and passwords → Replit Secrets. Public URLs, email addresses, feature flags → Replit Environment Variables.

---

## Database Rules

1. **Prefer migrations over manual schema changes.** Every schema change gets a numbered SQL file in `migrations/`. Never alter a production table by hand in the SQL editor without saving the SQL first.
2. **Avoid destructive schema changes.** Dropping a column, renaming a table, or changing a column type without a migration is dangerous. Always prefer additive changes (new columns, new tables).
3. **Preserve existing data.** New columns must have a default value or be nullable. Never add a NOT NULL column without a default to an existing table with data.
4. **Test migrations on a copy first.** Run the SQL on a staging Supabase project or a local Postgres instance before applying to production.
5. **Document the schema.** Column names, types, constraints, and indexes must appear in the playbook.
6. **Use UUIDs as primary keys.** Avoids sequential ID enumeration and works across distributed inserts.

---

## API Rules

1. **Version APIs when introducing breaking changes.** A breaking change is: removing a field from a response, changing a field's type, removing an endpoint, or changing authentication requirements. New fields added to a response are non-breaking.
2. **Preserve contracts.** If a frontend relies on `{ id, name, status }`, do not rename those fields without updating every consumer.
3. **Validate all inputs at the boundary.** Use Zod schemas. Return 400 with a clear message if validation fails. Never let unvalidated data reach the database.
4. **Use TypeScript end-to-end.** Shared Zod schemas in `lib/api-zod` generate both runtime validators (backend) and TypeScript types (frontend). Do not diverge these.
5. **No silent error swallowing.** If a database query fails, log the error and return a 500. If an optional operation (like email) fails, log the error but do not fail the request.
6. **Never return internal stack traces to the client.** Log the full error server-side; return a generic message to the frontend.

---

## Dashboard Principles

1. **Mobile-first.** Every dashboard view must be usable on a phone. Admins often check reservations on mobile.
2. **Role-based access.** Gate admin routes at both the UI level (redirect if not authenticated) and the API level (validate JWT on every admin endpoint). Never rely on UI-only access control.
3. **Real-time where it adds value.** Live reservation updates prevent double-booking and give admins confidence. Implement SSE or WebSocket only for data that genuinely needs seconds-level freshness.
4. **Separate analytics from operations.** The reservations list is for operations (take action). Analytics (charts, rates, trends) are read-only and belong in a separate tab.
5. **Separate settings from operations.** Business hours, blocked dates, and configuration belong in a Settings tab — not mixed into the reservations flow.
6. **Show connection state.** Always show whether the real-time connection is live. A stale view that appears live is worse than a clearly offline view.

---

## Troubleshooting Principles

1. **Diagnose before changing code.** Read the error. Read the logs. Reproduce the issue. Only then look at the code.
2. **Trace the full request flow.** From the browser → API → database → response → UI. Find exactly where the chain breaks.
3. **Use startup diagnostic logs.** Any env var or external service initialization should log its status on startup. Add these if they don't exist.
4. **Isolate the variable.** If you're unsure whether it's a networking issue, a code issue, or a configuration issue, test each layer in isolation (curl the API directly, check the DB directly, etc.).
5. **Check the obvious things first.** Is the workflow running? Are all secrets set? Is the Supabase project paused? Most production issues are configuration, not code.
6. **Never make speculative code changes as a debugging step.** A change that "might fix it" without a clear hypothesis will create new bugs and make the root cause harder to find.

---

## Reusable Project Strategy

### The Core Insight

Every service business needs the same underlying systems. The difference between a restaurant, a clinic, and a gym is their **brand** and their **business rules** — not their technology. The reservation system, the admin dashboard, the notification engine, and the authentication layer are structurally identical.

### The Model

```
┌─────────────────────────────────┐
│      CLIENT-SPECIFIC LAYER      │
│                                 │
│  Brand colors, fonts, copy      │
│  Industry-specific page content │
│  Custom form fields             │
│  Client-specific email templates│
└────────────────┬────────────────┘
                 │ uses
┌────────────────▼────────────────┐
│      REUSABLE BUSINESS ENGINE   │
│                                 │
│  Reservation / Booking system   │
│  CRM (contact management)       │
│  Admin dashboard                │
│  Notification engine (email/SMS)│
│  Analytics                      │
│  Auth (admin login)             │
│  Scheduling / Calendar          │
│  Payment processing             │
│  Forms engine                   │
│  Automation triggers            │
└─────────────────────────────────┘
```

### What Changes Per Client

| Element | Changes? |
|---|---|
| Restaurant name, logo, colors | ✅ Always |
| Page copy, images, menu content | ✅ Always |
| `OWNER_EMAIL` | ✅ Always |
| `from` address in emails | ✅ Always (after domain verification) |
| Supabase project | ✅ Always (separate per client) |
| Resend API key / domain | ✅ Always |
| Admin credentials | ✅ Always |
| Business rules (hours, capacity) | ✅ Usually |

### What Stays the Same

| System | Reusable? |
|---|---|
| Reservation CRUD engine | ✅ Always |
| Admin dashboard structure | ✅ Always |
| Email notification pattern | ✅ Always |
| Supabase Realtime → SSE pattern | ✅ Always |
| JWT auth middleware | ✅ Always |
| pnpm monorepo structure | ✅ Always |
| Zod validation approach | ✅ Always |

### Reusable System Catalog

The following systems are implemented or scaffoldable from this template:

- **Reservation / Booking Engine** — CRUD, status flow, confirmation emails
- **Admin Dashboard** — tabbed layout, real-time updates, filters, search, bulk actions
- **Notification Engine** — owner alerts on new entries, guest confirmation on status change
- **Authentication** — JWT-based admin auth via Supabase
- **Analytics Module** — cancellation rate, peak hours, peak days, computed client-side
- **Calendar View** — reservation grid by date
- **CRM** — guest contact log, notes, repeat-guest detection (future)
- **Scheduling** — business hours, blocked dates, time slot management (future)
- **Payments** — Stripe or similar (future, architecture-ready)
- **Automations** — trigger-based email/SMS sequences (future)
- **Forms Engine** — multi-step public-facing data collection

---

*This document should be read by every AI assistant before working on this project. If you are an AI and you are reading this: follow the rules above, do not skip steps, and explain your reasoning before making changes.*
