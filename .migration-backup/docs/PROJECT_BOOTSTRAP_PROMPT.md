# PROJECT_BOOTSTRAP_PROMPT.md

> **Purpose:** Paste this document into any new Replit project to bootstrap a new client implementation. It is industry-agnostic and reusable across all business types.

---

# SECTION 1 — Bootstrap Mission

The purpose of this prompt is to analyze an existing codebase and determine whether reusable modules can be integrated into the new client project instead of rebuilding systems from scratch.

Every client engagement starts here. Before writing a single line of code, the AI must read all available documentation, audit what already exists, identify which shared systems can be reused by configuration alone, and produce a structured proposal for review. Only after explicit approval from the client or project owner should implementation begin.

The business model this prompt supports is:

```
┌───────────────────────────────────────────┐
│           CLIENT-SPECIFIC LAYER           │
│   Brand, copy, images, custom fields      │
│   Industry-specific page content          │
└──────────────────┬────────────────────────┘
                   │ sits on top of
┌──────────────────▼────────────────────────┐
│          REUSABLE BUSINESS ENGINE         │
│                                           │
│  Booking / Reservation system             │
│  CRM and contact management               │
│  Admin dashboard                          │
│  Email notification engine                │
│  Analytics                                │
│  Auth (admin login)                       │
│  Calendar and scheduling                  │
│  Payment processing (when needed)         │
│  Forms engine                             │
│  Automation triggers                      │
└───────────────────────────────────────────┘
```

**Default rule: Reuse first. Build second.**

The business engine is configuration-driven, not client-specific. Brand, email addresses, environment variables, and content change per client — the engine does not.

---

# SECTION 2 — Mandatory Reading Order

Before doing anything else, the AI must read the following documents in this exact order. Do not skip steps. Do not begin analysis until all available documents have been read.

1. `docs/IMPLEMENTATION_PLAYBOOK.md` — architecture decisions, database schema, environment variables, deployment instructions
2. `docs/AI_CONTEXT.md` — operating rules, architecture principles, reusable system strategy
3. `docs/ARCHITECTURE.md` — if present, project-specific architecture decisions and diagrams
4. `docs/TROUBLESHOOTING.md` — if present, known issues, root causes, and resolved workarounds
5. `docs/CHANGELOG.md` — if present, history of changes and current system state

After reading all available documents, summarize in 3–5 sentences:
- What the platform does
- What tech stack it uses
- What is already built and working
- What appears incomplete, missing, or not yet implemented

---

# SECTION 3 — Initial Project Analysis Checklist

After reading all documentation, the AI must inspect the codebase and produce an inventory of the following:

**Folder Structure**
- Is this a monorepo or single repo?
- What is the package manager? (pnpm / npm / yarn)
- What build tooling is used?
- Are there shared libraries or workspace packages?

**Frontend**
- Framework and version
- Router used
- State management and data-fetching approach
- UI component library
- Pages and routes that currently exist
- Pages that appear unfinished, stubbed, or placeholder only

**Backend**
- Framework and version
- Route files and their endpoints
- Middleware stack
- Authentication pattern
- Logging approach

**Database**
- Provider and client SDK
- Tables and their schemas (infer from queries if no migration files exist)
- Realtime setup (if any)
- RLS or access control patterns

**Auth Provider**
- What authentication system is in use?
- What roles or permission levels exist?
- Is admin login implemented?

**Deployment Method**
- Where is this project deployed or intended to be deployed?
- What environment variables are required?
- Which environment variables appear to be set vs. potentially missing?
- Are any secrets hardcoded in source files? (Flag these immediately.)

**Email / Notifications**
- What email provider or SDK is used?
- What events trigger emails?
- What email templates exist?

**Existing Modules**
- List every reusable system that already exists in the codebase
- Note which are complete, which are partial, and which are stubbed

**Reusable Components**
- Flag any system that could serve a different client with only configuration changes
- Flag anything that is hardcoded to a specific client and must be generalized

Present findings as a concise inventory table before proceeding.

---

# SECTION 4 — Information To Request From User

After completing the codebase analysis, ask only what cannot be inferred. Group questions clearly and ask them all at once. Do not ask in multiple rounds.

```
Business Name:
Industry:
  (restaurant / clinic / gym / barbershop / law firm / agency / salon / other)
Target Audience:
  (B2C / B2B / both — describe briefly)
Services Offered:
  (what does this business sell, book, or schedule?)

Pages Required:
  (list all pages the frontend must include)
Dashboard Requirements:
  (who uses it, what actions they need, what data they must see at a glance)

Booking Requirements:
  (does this business need reservations, appointments, drop-in, or none?)
Email Requirements:
  (owner notifications / guest confirmations / automated follow-ups / none)
Automations:
  (any workflows that should trigger automatically — confirmations, reminders, alerts)
Payments:
  (required now / scaffolded for later / not needed)
Notifications:
  (email / SMS / both / none)

Third-party Integrations:
  (Google Calendar, Stripe, Twilio, Zapier, other — list all)

Brand Colors:
  (primary / secondary / accent hex values if known)
Fonts:
  (preferred typefaces, or "use defaults")
Logo:
  (available now / to be provided / not needed)
Domain:
  (custom domain if known, or "TBD")

Owner Email:
  (address for admin notifications)
Admin Roles:
  (single owner / multiple staff roles — describe)
Future Features:
  (anything planned but not needed immediately)
```

---

# SECTION 5 — Reusable Module Detection

For each system below, the AI must determine whether an existing implementation exists in the codebase that can be reused for this client, or whether it must be built from scratch.

| System | Detect How | Default Assumption |
|---|---|---|
| Authentication | Check for auth middleware, JWT, session handling, Supabase Auth | Reuse if present |
| Admin Dashboard | Check for /admin routes, protected pages, dashboard components | Reuse if present |
| Reservations / Bookings | Check for booking routes, reservation tables, form components | Reuse if present |
| CRM | Check for contacts, guests, or customer tables and views | Reuse if present |
| Analytics | Check for event tracking, usage stats, reporting endpoints | Reuse if present |
| Email Notifications | Check for Resend, Nodemailer, or email template files | Reuse if present |
| SMS Notifications | Check for Twilio or SMS provider integration | Reuse if present |
| Forms Engine | Check for reusable form components or form handling utilities | Reuse if present |
| Payments | Check for Stripe or payment provider integration | Reuse if present |
| Scheduling / Calendar | Check for calendar views, time-slot logic, business hours config | Reuse if present |
| Customer Management | Check for customer profiles, history views, or CRM-adjacent tables | Reuse if present |

**The default assumption is always: reuse first, build second.**

Before proposing to build any system from scratch, confirm that no existing implementation — even partial — can be adapted. If a partial implementation exists, extend it rather than replace it.

---

# SECTION 6 — Implementation Phases

Once the codebase analysis is complete and client information has been gathered, implementation must proceed in the following phases. Each phase must be completed and confirmed before the next begins.

**Phase 1 — Analyze Existing Architecture**
- Read all documentation
- Audit the codebase
- Identify reusable modules
- Identify gaps and what must be built
- Produce the inventory table

**Phase 2 — Generate Implementation Plan**
- Produce a numbered, ordered checklist of every task required
- Group tasks by phase
- Estimate complexity (low / medium / high) per task
- Present for approval before proceeding

**Phase 3 — Generate Database Proposal**
- List every new table or column required
- Provide full SQL including types, nullability, defaults, indexes, and RLS policies
- Identify which existing tables will be extended vs. left unchanged
- Present for approval before proceeding

**Phase 4 — Generate API Proposal**
- List every new endpoint required
- For each: method, path, auth requirement, request body schema, response shape, side effects
- Present for approval before proceeding

**Phase 5 — Generate Dashboard Proposal**
- Tab structure and purpose of each tab
- Key actions and data per tab
- Realtime requirements
- Mobile considerations
- Present for approval before proceeding

**Phase 6 — Generate Integrations Proposal**
- List every third-party service to be connected
- For each: SDK, environment variables required, activation steps
- Present for approval before proceeding

**Phase 7 — Implement Incrementally**
- Implement one phase at a time
- After each phase: report what was completed, what the user can test, and any issues resolved
- Confirm before starting the next phase
- Do not race ahead

---

# SECTION 7 — Rules

## Never do the following without explicit written approval:

- Refactor code unrelated to the current task
- Replace the existing architecture without clear justification
- Break any functionality that is currently working
- Introduce unnecessary dependencies
- Hardcode client-specific information (names, emails, URLs) into shared or reusable modules
- Make large changes in a single step — always work incrementally
- Assume files, tables, routes, or environment variables exist without verifying
- Delete files, tables, or columns that contain live data
- Rename API endpoints, database columns, or shared types that have existing consumers
- Change authentication patterns
- Replace a working library with a different one without documenting why
- Use `any` in TypeScript unless absolutely unavoidable and explicitly documented
- Expose secrets or service-role keys to the frontend

## Always do the following:

- Explain the change and its impact before making it
- Preserve backwards compatibility unless a breaking change is approved
- Document every new environment variable with its purpose and example value
- Prefer configuration over hardcoding for anything that may vary per client
- Make incremental changes — one logical unit at a time
- Diagnose before fixing — do not guess at root causes
- Test changes before reporting them as complete

---

# SECTION 8 — Master Bootstrap Prompt Template

Copy the text below and paste it as your first message in any new Replit project. Fill in the bracketed placeholders before sending.

---

```
Read all documentation files in the /docs directory and analyze the existing codebase.

This project is for:

Business: [NAME]
Industry: [TYPE — restaurant / clinic / gym / barbershop / law firm / agency / salon / other]

Features needed:
[List all features required — booking, CRM, payments, admin dashboard, email notifications, etc.]

Branding:
[Primary color, secondary color, fonts, logo status, tone of voice]

Domain: [Custom domain or TBD]
Owner email: [Address for admin notifications]
Deployment target: [Replit / Vercel / Render / other]

Follow the steps in docs/PROJECT_BOOTSTRAP_PROMPT.md exactly:

1. Read all documentation in the mandatory order.
2. Analyze the codebase and produce a full inventory.
3. Ask only what you cannot infer from the codebase and information provided above.
4. Determine:
   - What can be reused from the existing business engine
   - What needs to be built from scratch
   - Full architecture proposal
   - Database proposal (with SQL)
   - API proposal
   - Dashboard proposal
   - Integration plan
   - Step-by-step implementation roadmap grouped by phase

Do not modify any code until the full proposal has been reviewed and approved.

Say "Proposal ready. Please review and confirm to begin implementation, or request changes." when the proposal is complete.
```

---

## Document Maintenance

Update this file whenever a new reusable system is added to the platform.

| Date | Change |
|---|---|
| June 2026 | Initial version |
| | |
