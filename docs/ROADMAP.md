# ERNT Properties — System Roadmap

Living document. Update the checkboxes as work lands. Any agent or developer
should be able to read this and know exactly where the project stands.

**Product:** Real Estate CRM + transaction/document management built on top of
the existing property listing portal.

**Core flow:** `Enquiry → Lead → Viewing → Offer → Quotation → Deal Won → Invoice → Commission`

---

## Audience boundaries (NON-NEGOTIABLE)

The system has three audiences. They must never see each other's internal data.
Data isolation is enforced at three layers: (1) route guard, (2) server-action
re-check, (3) row-level ownership filtering in every query.

### PUBLIC (anonymous visitors + logged-in BUYER)
May see:
- Published property listings, photos, prices, location, amenities
- Agent public profile on a listing (name, company, phone)
- Their own favourites, saved searches, enquiries they sent, viewings they booked

Must NEVER see:
- Other buyers' identities, enquiries, viewings, budgets or notes
- Any `Lead`, `Deal`, `Quotation`, `Invoice`, `Payment`, `Commission`, `ActivityLog`,
  `Document` (internal), or `Notification` belonging to someone else
- Draft / pending / rejected listings
- Agent or admin dashboards, analytics, or internal notes

Rules:
- Anonymous users have no ownership rows. Buyer-scoped pages query **only** rows
  where `buyerId === session.user.id` / `senderId === session.user.id`.
- A buyer can never reach `/dashboard` or `/admin` (guarded by `proxy.ts` + role).

### AGENT
May see:
- Their **own** listings (all statuses), leads, viewings, deals, quotations,
  invoices, documents and commissions assigned to them
- Public listings and public buyer contact details **for their own leads only**

Must NEVER see:
- Another agent's leads, deals, quotations, invoices, commissions or pipeline
- Admin-only data: platform-wide revenue, other agents' performance, role management
- Buyer data that is not tied to one of their own leads

Rules:
- Every agent query filters by `agentId === session.user.id`.
- Ownership checks run in each action before any read/write (pattern already used
  in `src/app/dashboard/actions.ts`).

### ADMIN
May see:
- Everything platform-wide: all users, listings, leads, deals, quotations,
  invoices, payments, commissions, reports and the audit trail
- Role management and moderation

Rules:
- `/admin/*` is ADMIN-only, guarded at all three layers.
- Admin actions still log to `ActivityLog` for the audit trail.
- ADMIN is intentionally global: an admin using the agent dashboard surface
  (`/dashboard`) may read/write any listing. This is deliberate, not a leak —
  see the ownership checks in `src/app/dashboard/actions.ts` which read
  `property.agentId !== user.id && user.role !== "ADMIN"`.
- Admins must NOT see a buyer's private data unless it is tied to a lead/deal
  they are working as part of platform administration.

### Enforcement pattern (already in the codebase)

| Layer | File | Purpose |
|-------|------|---------|
| Route guard | `src/proxy.ts` + `src/auth.config.ts` `authorized()` | Blocks navigation by role |
| Action re-check | `requireAgent()` / `requireAdmin()` in `*-/actions.ts` | Blocks direct server-action calls |
| Ownership filter | `where: { agentId: user.id }` / `where: { buyerId: user.id }` | Prevents cross-tenant leakage |

**Rule for new code:** never trust the UI. Every new query and action must apply
an ownership filter appropriate to the actor's role. If a page shows data, the
query that fetched it must have filtered it — not the template.

---

## Phase 0 — Foundation ✅

- [x] Extend Prisma schema: `Lead`, `Viewing`, `Deal`, `Quotation`, `QuotationLine`,
      `Invoice`, `Payment`, `Document`, `Commission`, `ActivityLog`, `Notification`
- [x] Supporting enums: `LeadStage`, `LeadSource`, `ViewingStatus`, `DealStatus`,
      `QuotationStatus`, `DocumentType`, `InvoiceStatus`, `PaymentMethod`,
      `PaymentStatus`, `CommissionParty`
- [x] Push schema to Supabase (19 tables) + regenerate client
- [x] Seed demo CRM data (4 leads, 1 viewing, 1 deal, activity log)

## Phase 0.5 — Audience boundary hardening ✅

- [x] `createInquiry` now requires the target property to be `PUBLISHED`
      (no probing/enquiries against draft/rejected listings)
- [x] `toggleFavorite` validates the property exists and is `PUBLISHED`
- [x] `/api/upload` now enforces AGENT/ADMIN role (was any authenticated user)
- [x] `/api/upload` validates magic bytes and derives the file extension from
      the verified type (was: trusted client MIME + filename → XSS vector)
- [x] Role re-read from DB on every request (`src/auth.ts` session callback) so
      demotions take effect immediately instead of at next login
- [x] Defense-in-depth role check added to dashboard edit-listing page
- [x] Admin global-write behaviour documented as intentional in this roadmap
- [x] Verified live: buyer blocked from dashboard/admin/upload; agent blocked
      from admin; fake image rejected; real image accepted

## Phase 1 — Viewings + Leads ✅

- [x] Enquiry / viewing request auto-creates a `Lead` (source-tagged)
- [x] Buyer viewing booking on property page: pick date/time → creates `Viewing`
      (`REQUESTED`) + `Notification` to agent
- [x] Agent viewing management: confirm / reschedule / cancel / complete / no-show;
      availability check (agent + property not double-booked)
- [x] Agent viewing list (pending / scheduled / closed)
- [x] Lead pipeline: New → Qualifying → Viewing → Offer → Won/Lost (with stage move)
- [x] Lead detail: contact, budget, linked property, timeline (`ActivityLog`),
      notes, next follow-up
- [x] Follow-up reminders (overdue / upcoming)
- [x] Per-agent dashboard: counts by stage, upcoming viewings, conversion, wins
- [x] Buyer "My viewings" page (`/account/viewings`) with status
- [x] Notifications centre (in-app, per-user; mark read / mark all read)
- [x] Enforce audience boundaries for all of the above
- [ ] Email notifications (deferred — in-app notifications shipped instead)

**Verified:** 67 automated checks pass — 37 route/role boundary checks and
30 workflow checks (enquiry→lead, viewing lifecycle, double-booking, past-date,
cross-agent isolation, badge/pipeline, buyer & anon denial).

**Infra note:** `DATABASE_URL` uses `?pgbouncer=true&connection_limit=10&pool_timeout=30`.
The Supabase pooler is ~1s/query from this environment, so dashboard queries are
run with **bounded concurrency** (sequential), never a large `Promise.all` fan-out,
to avoid `P2024` pool-timeout 500s.

## Phase 2 — Quotations + Documents

- [ ] Price book / fee templates (admin-managed)
- [ ] Agent quotation builder (line items, tax, validity, terms)
- [ ] Quotation PDF export with company letterhead
- [ ] Quotation status flow: Draft → Sent → Accepted / Rejected / Expired
- [ ] Documents per property / lead / deal (agreements, IDs, title docs)
- [ ] Document versions + permissioned download (owner agent / admin only)

## Phase 3 — Payments + Commissions

- [ ] Deal close-out (Won/Lost), links to quotations and invoices
- [ ] Invoices (deposit / fees), partial payments, status tracking
- [ ] Online payment gateway — M-Pesa (Daraja) first, Stripe for cards
- [ ] Payment records + reconciliation against invoices
- [ ] Commission rules (company / agent / referral splits)
- [ ] Automatic commission calculation on deal close
- [ ] YTD commission + production reports

## Phase 4 — Admin & Reporting

- [ ] Company-wide dashboard: revenue, pipeline value, viewings, conversions
- [ ] Agent performance report (listings, leads, viewings, wins, commission)
- [ ] Audit trail view over `ActivityLog`
- [ ] Notification centre for all roles

---

## Engineering rules

1. **Verify before claiming done:** run `npm run lint`, `npm run typecheck`,
   `npm run build` and exercise the feature against Supabase.
2. **Audience boundaries:** apply the ownership filter in the query, not the view.
3. **No fabricated state:** if something isn't built, it stays unchecked here.
4. **Migrations:** use `npm run db:push` for dev; document schema changes here.
5. **One phase at a time:** do not start a phase until the previous one is verified.
