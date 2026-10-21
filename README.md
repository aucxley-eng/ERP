# ERNT Properties

A full real-estate marketplace for land, homes and commercial property in Kenya.
Buyers browse and save listings; agents publish and manage properties; admins
moderate and run the platform.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Prisma** + **PostgreSQL** (Supabase / Neon / local)
- **Auth.js (NextAuth v5)** — email + password (credentials), JWT sessions, roles
- Local filesystem image uploads to `public/uploads`

## Roles

| Role  | Capabilities |
|-------|--------------|
| BUYER | Browse, search, save favourites, send enquiries |
| AGENT | Everything above + dashboard, create/edit listings, view enquiries |
| ADMIN | Everything above + moderate listings, feature, manage users, view all enquiries |

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
   | `DATABASE_URL` | Pooled Postgres URL (Supabase port `6543`) |
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
  schema.prisma        Data model (User, Property, Location, Inquiry, ...)
  seed.ts              Sample Kenyan listings + demo accounts
src/
  app/
    page.tsx           Home (hero search, featured, latest)
    listings/          Search + filters, property detail, enquiry form
    (auth)/            Login and register
    dashboard/         Agent area (listings, new/edit, enquiries)
    admin/             Admin area (moderation, users, enquiries)
    api/auth/          Auth.js route handlers
    api/upload/        Image upload endpoint
  components/          Header, footer, property card, forms, uploader
  lib/                 prisma client, constants, formatting, validation, queries
  auth.ts              Auth.js config (credentials provider)
  auth.config.ts       Edge-safe config (route protection callbacks)
  proxy.ts             Next.js proxy (middleware) protecting /dashboard, /admin
```

## Notes

- Uploaded images are stored in `public/uploads` and served statically. For
  production on serverless hosting (e.g. Vercel) swap this for object storage
  (S3/Cloudinary) — the upload endpoint is isolated in `src/app/api/upload/route.ts`.
- New and edited listings are set to `PENDING` and require admin approval before
  appearing publicly.
- Decimal prices are returned by Prisma as `Decimal`; the UI casts to number via
  `formatPrice`.
