# ERNT Properties — Architecture Gap Analysis

Reconciliation of the shipped codebase against
`docs/Kenya_Real_Estate_System_Architecture.pdf`.

**Source document:** *Kenya Real Estate System Architecture*, 22 pages,
dated 21 October 2026. It is a technical blueprint and **recommendation**
document ("Architecture choices and proposed targets in this document are
recommendations derived from the requirements, not vendor guarantees"), not a
specification. Where it describes a target we have not built, that is noted as a
gap, not a defect.

**Reference build state:** Phases 0, 0.5 and 1 of `docs/ROADMAP.md` are
complete and verified (67/67 automated checks). This analysis is informational;
it makes no priority ordering and no build recommendation.

---

## 1. Scope comparison

The two artifacts describe overlapping but different products.

- **Blueprint scope:** a full **property-management and rent-collection
  platform** — organizations/landlords, units, leases/tenancies, rent billing,
  allocations, a financial ledger, deposits, statements, M-PESA collection and
  reconciliation, maintenance, and eTIMS tax invoicing.
- **Our scope:** the **marketplace + CRM** slice of that vision — published
  listings, enquiries, leads, viewings, quotations, deals, invoices, payments,
  commissions, documents and notifications.

The schema already contains groundwork for the financial slice (`Deal`,
`Quotation`, `QuotationLine`, `Invoice`, `Payment`, `Commission`, `Document`),
but the tenancy/ownership domain is entirely absent. The tables below govern the
rest of this document.

---

## 2. Section-by-section reconciliation

Legend: ✅ aligned · ⚠️ partial · ❌ gap.

| Blueprint expectation | Status | Evidence in our code | Gap |
|---|---|---|---|
| Multi-tenant isolation enforced on every private API, file, export and worker path (OWASP multi-tenant guidance) | ⚠️ | Role-based isolation across BUYER/AGENT/ADMIN; 3 layers — `src/proxy.ts` + `authorized()`, `requireAgent()`/`requireAgentScope()`/`requireAdmin()` in actions, ownership filter in queries (`src/lib/crm.ts`, `src/app/dashboard/crm-actions.ts`) | Isolation axis is **role**, not **organization**. No `Organization` model; no org-scoped tests. |
| Stack: Next.js front end + separate NestJS backend + PostgreSQL (+ PostGIS) + Kysely/Prisma | ⚠️ | Next.js 16 App Router, Prisma 6, PostgreSQL (Supabase) | No NestJS backend (single Next.js app, server actions). No PostGIS — `Property.latitude`/`longitude` are plain `Float` with no distance query. |
| Data model: properties, units, media, moderation, search, leads | ⚠️ | `Property`, `PropertyImage`, `Location`, `Lead`, `Inquiry`, `Viewing`, `Favorite`, `SavedSearch` in `prisma/schema.prisma` | **No `Unit`** model. Moderation is enum-status only (`ListingStatus` DRAFT/PENDING/PUBLISHED/REJECTED) with no reviewer workflow/queue. |
| Data model: organizations, landlords/owners, leases, tenancies | ❌ | none | Entire tenancy/ownership domain absent — no `Organization`, `Owner`, `Lease`, `Tenant` models. |
| Financial core: billing, allocations, ledger, deposits, statements; money as decimals; accountant-reviewed examples; rerun-safe billing | ⚠️ | `Invoice`, `Payment`, `Quotation`+`QuotationLine`, `Commission`, all `Decimal(14,2)`, KES default | No double-entry **ledger**. No allocation table (payment↔invoice split). No deposit/statement model. No rerun-safe/idempotent billing logic. |
| Payments: M-PESA C2B / STK Push / Transaction Status, transactional outbox, reconciliation, exception workflow | ❌ | `PaymentMethod.MPESA` enum value; `Payment.gatewayRef` string field | No Daraja integration, no callback/confirmation handling, no outbox, no reconciliation, no duplicate/delayed/unmatched exception workflow. |
| Object storage with presigned URLs; public media via CDN | ❌ | `PropertyImage.url` (string), `Document.url` (string) | `/api/upload` writes to `public/uploads` via `node:fs` `writeFile` (`src/app/api/upload/route.ts:45-47`). Read-only/ephemeral on serverless; no S3/Supabase Storage, no presigned URLs, no CDN. |
| Background workers / queue (BullMQ/Redis); heavy work off the request path | ❌ | none | No queue or worker process; all work is request-scoped. |
| Authentication hardening (OWASP auth guidance), MFA | ⚠️ | NextAuth v5 credentials, JWT sessions, role re-read from DB each request (`src/auth.ts`) | No MFA. No documented password-reset or email-verification flow. |
| Rate limiting / abuse controls (OWASP API Top 10) | ❌ | none | No limiter on server actions or `/api/upload`. |
| Caching of safe read projections; CDN; read replicas only when measured | ❌ | none | Server components query Postgres live; no cache layer or revalidation strategy. |
| Observability: OpenTelemetry signals, SRE alerting, actionable runbooks, health checks | ❌ | none | No metrics, tracing, alerting or health endpoint. |
| Backups / PITR / tested restore with defined RPO/RTO | ❌ | relies on Supabase managed defaults | No documented recovery objective, retention policy, or timed restore exercise. |
| Compliance: ODPC data-controller registration, data-subject rights, KRA eTIMS system-to-system | ❌ | none | No data export/erasure endpoints; no eTIMS integration. |
| Testing: Playwright browser tests, load tests establishing capacity | ⚠️ | 67 scripted checks (route/boundary/workflow) | No Playwright e2e suite; no load test; no mixed-load or timed-restore verification. |
| Connection budgeting: explicit budget, PgBouncer, bound concurrency | ✅ | `DATABASE_URL` uses `?pgbouncer=true&connection_limit=10&pool_timeout=30`; sequential `getLeadMetrics`; `P2024` fix documented in `docs/ROADMAP.md` | Needs tuning against Vercel serverless concurrency; current budget is sized for dev. |
| Implementation roadmap Phases 1–7 with exit evidence | ⚠️ | Our Phases 0/0.5/1 complete; schema groundwork for 2–3 | Our roadmap is not mapped to the blueprint's phase structure; blueprint Phases 3 (Tenancy) and 5 (Payments) have no counterpart. |

---

## 3. Roadmap mapping

| Blueprint phase | Blueprint deliverable | Our counterpart | Status |
|---|---|---|---|
| 1 Foundation | Identity, organizations, migrations, CI, secrets, audit | Phase 0 / 0.5 | ✅ built, minus **organization** isolation |
| 2 Inventory & marketplace | Properties, units, media, moderation, search, leads | Phase 1 | ✅ built, minus **units** and media object storage |
| 3 Tenancy | Lease lifecycle, parties, inspections, amendments | — | ❌ unmapped |
| 4 Financial core | Billing, allocations, ledger, deposits, statements | Phase 2 / 3 (partial schema only) | ⚠️ pre-modeled, not built |
| 5 Payments | M-PESA, inbox/outbox, reconciliation, exceptions | Phase 3 (M-Pesa listed) | ❌ unmapped |
| 6 Operations | Maintenance, notifications, reports, eTIMS scope | Phase 4 (reports, notifications partial) | ⚠️ partial |
| 7 Production readiness | Load, security, recovery, support runbooks | — | ❌ not started |

---

## 4. Gap list (unordered)

Factual gaps, each with its location. No severity or priority implied.

1. No `Organization` model and no organization-scoped isolation; tenant boundary
   is role-only.
2. No `Unit`, `Owner`, `Lease` or `Tenant` models — tenancy domain absent
   (`prisma/schema.prisma`).
3. No PostGIS distance search; `Property.latitude`/`longitude` are plain `Float`.
4. No separate backend service (NestJS); app is a single Next.js codebase using
   server actions.
5. `/api/upload` persists files with `node:fs` `writeFile` to `public/uploads`
   (`src/app/api/upload/route.ts:45-47`) — non-persistent on serverless.
6. No object storage / presigned URLs / CDN for media; `PropertyImage.url` and
   `Document.url` are plain strings.
7. No background worker or queue (BullMQ/Redis); no transactional outbox.
8. No M-PESA / Daraja integration (C2B, STK Push, Transaction Status), no
   callbacks, no reconciliation, no payment-exception workflow.
9. No double-entry ledger, payment-allocation table, deposits or statements.
10. No idempotent/rerun-safe billing logic.
11. No MFA, and no documented password-reset or email-verification flow.
12. No rate limiting on server actions or API routes.
13. No caching layer or read-projection strategy for read-heavy pages.
14. No observability — OpenTelemetry, metrics, alerting, or health-check
    endpoint.
15. No documented backup/RPO/RTO target or tested restore procedure.
16. No ODPC registration/data-subject-rights endpoints; no eTIMS integration.
17. No Playwright e2e suite; no load testing.
18. Connection budget sized for dev; not yet validated against production
    serverless concurrency.

---

## 5. Source note

- Analyzed document: `docs/Kenya_Real_Estate_System_Architecture.pdf` (22 pages,
  21 October 2026).
- The document is an architecture recommendation, not a fixed specification; its
  stack and provider targets may change and should be re-confirmed at
  implementation time.
- This file records observed differences only. It does not rank them and does not
  prescribe a next step.
