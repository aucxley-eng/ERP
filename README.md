# ERNT Properties

A real-estate **marketplace + CRM** for land, homes and commercial property in
Kenya. Buyers browse and save listings; agents publish properties and run their
pipeline; admins moderate and manage the platform.

**Core flow:** `Enquiry → Lead → Viewing → Offer → Quotation → Deal Won →
Invoice → Commission`

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Prisma** + **PostgreSQL** (Supabase / Neon / local)
- **Auth.js (NextAuth v5)** — email + password (credentials), JWT sessions, roles
- Server Actions for mutations (no REST API surface beyond auth + upload)
- Local filesystem image uploads to `public/uploads` (swap for object storage in
  production — see Notes)

## Audience model (non-negotiable)

Three audiences share one codebase but must never see each other's internal data.

| Role  | Scope |
|-------|-------|
| BUYER (and anonymous) | Published listings; **own** favourites, saved searches, enquiries, viewings |
| AGENT | **Own** listings (all statuses), leads, viewings, deals, quotations, invoices, documents, commissions |
| ADMIN | Everything platform-wide, plus moderation and role management |

Isolation is enforced at **three layers**, so no single mistake leaks data:

1. **Route guard** — `src/proxy.ts` + `authorized()` in `src/auth.config.ts`
   block navigation by role.
2. **Action re-check** — `requireAgent()` / `requireAgentScope()` /
   `requireAdmin()` re-check the role in every server action.
3. **Query ownership filter** — every query filters by `agentId` / `buyerId`
   / `senderId` (see `src/lib/crm.ts`).

Rule for new code: **filter in the query, not the template.**

### Role refresh

The session callback in `src/auth.ts` re-reads the user's role from the database
on every request, so a demotion takes effect immediately rather than at next
login.

## Data model

18 models in `prisma/schema.prisma`, spanning the marketplace and the CRM:

| Area | Models |
|------|--------|
| Identity | `User` |
| Marketplace | `Location`, `Property`, `PropertyImage`, `Favorite`, `SavedSearch`, `Inquiry` |
| CRM | `Lead`, `Viewing`, `Deal`, `Quotation`, `QuotationLine` |
| Finance | `Invoice`, `Payment`, `Commission` |
| Supporting | `Document`, `ActivityLog`, `Notification` |

Money is stored as `Decimal(14,2)` (default currency KES). Listings move through
`ListingStatus` (`DRAFT → PENDING → PUBLISHED → REJECTED / SOLD / RENTED`); new
and edited listings require admin approval before appearing publicly.

## Application surface

| Audience | Routes |
|----------|--------|
| Public | `/`, `/listings`, `/listings/[slug]`, `/about`, `/contact`, `/login`, `/register` |
| Buyer | `/account/viewings` |
| Agent | `/dashboard`, `/dashboard/listings` (+ `new`/`[id]/edit`), `/dashboard/leads` (+ `[id]`, `follow-ups`), `/dashboard/viewings`, `/dashboard/inquiries`, `/dashboard/notifications` |
| Admin | `/admin`, `/admin/listings`, `/admin/users`, `/admin/inquiries` + all `/dashboard/*` |
| API | `/api/auth/[...nextauth]`, `/api/upload` (AGENT/ADMIN only) |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and set your Postgres connection strings and a
   random `AUTH_SECRET`:

   ```bash
   cp .env.example .env
   # generate a secret:
   # node -e "console.log(crypto.randomUUID())"
   ```

   | Variable | Purpose |
   |----------|---------|
   | `DATABASE_URL` | Pooled Postgres URL (Supabase port `6543`, `?pgbouncer=true`) |
   | `DIRECT_URL` | Direct Postgres URL for migrations (port `5432`) |
   | `AUTH_SECRET` | Signing secret for Auth.js |
   | `NEXT_PUBLIC_SITE_URL` | Public site base URL |

3. **Create the schema and seed sample data**

   ```bash
   npm run db:push     # push schema (no migration history)
   # or: npm run db:migrate
   npm run db:seed
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Seed accounts

All seeded users share the password `password123`.

| Role  | Email |
|-------|-------|
| Admin | `admin@erntproperties.co.ke` |
| Agent | `agent@erntproperties.co.ke` |
| Buyer | `buyer@example.com` |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
prisma/
  schema.prisma        Data model (18 models: marketplace + CRM)
  seed.ts              Sample Kenyan listings, demo accounts, CRM data
src/
  app/
    page.tsx           Home (hero search, featured, latest)
    listings/          Search + filters, property detail, enquiry + viewing forms
    (auth)/            Login and register
    account/viewings/  Buyer's own viewings
    dashboard/         Agent area: listings, leads (pipeline/detail/follow-ups),
                       viewings, enquiries, notifications
    admin/             Admin area: moderation, users, enquiries
    api/auth/          Auth.js route handlers
    api/upload/        Image upload endpoint (AGENT/ADMIN)
  components/          Header (+ mobile nav), footer, property card, forms, uploader
  lib/
    crm.ts             Scoped CRM query layer (Scope = {agentId} | {admin})
    crm-constants.ts   Lead/viewing stage metadata
    crm-validation.ts  Zod schemas for CRM actions
    notifications.ts   notify() / logActivity() helpers
    properties.ts      Public listing queries
    prisma.ts          Prisma client singleton
  auth.ts              Auth.js config (credentials) + role refresh from DB
  auth.config.ts       Edge-safe config (route protection callbacks)
  proxy.ts             Next.js proxy (middleware) protecting /dashboard, /admin
docs/
  ROADMAP.md           Living build roadmap (phases + verification)
  ARCHITECTURE-GAP-ANALYSIS.md   Codebase vs. the Kenya architecture blueprint
  Kenya_Real_Estate_System_Architecture.pdf   Reference blueprint
```

## Architecture reference

`docs/Kenya_Real_Estate_System_Architecture.pdf` is a broader technical
blueprint (a full property-management + rent-collection platform). This codebase
implements its **marketplace + CRM** slice. `docs/ARCHITECTURE-GAP-ANALYSIS.md`
reconciles what is built against that document; `docs/ROADMAP.md` tracks the
build phases.

## Notes

- Uploaded images are stored in `public/uploads` and served statically. This is
  **not persistent on serverless hosting (e.g. Vercel)** — swap for object
  storage (S3/Supabase Storage/Cloudinary) before deploying. The endpoint is
  isolated in `src/app/api/upload/route.ts`.
- Dashboard queries run with **bounded concurrency** (no large `Promise.all`
  fan-out) because the Supabase pooler is a high-latency single connection pool;
  parallel fan-out triggers Prisma `P2024` pool timeouts. See `docs/ROADMAP.md`.
- Decimal prices are returned by Prisma as `Decimal`; the UI casts to number via
  `formatPrice`.
