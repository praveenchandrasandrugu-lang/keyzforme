# PRD — Keyz (keyzforme) Prototype

> Product Requirements for a **surprise, full-functional prototype** of Keyz, built by Praveen to
> present to co-founder **Shawn Higginbotham** (and as a portfolio piece / job bid).
> Shawn does NOT know this is being built — so **Praveen is the product decision-maker**, not Shawn.
> Keyz has ~no public web footprint; this PRD is the canonical brief. Keep it tight; revise as we build.

## 1. Context

- **Company / founder**: **Keyz** (keyzforme.com) — co-founded by **Shawn Higginbotham** (Praveen's
  former M.S. "Databases & Data Warehouses" professor). Fintech + proptech startup.
- **What Keyz is**: a **three-sided marketplace for home buyers** that closes the gap between
  *wanting* to buy a home and *being ready* to:
  1. **Centralize** a consumer's financial data in one place.
  2. **Financial counselors coach them up** until they're mortgage-ready.
  3. The consumer **compares real lender & realtor offers** based on their actual financial data.
- **Business model (three-sided)**: consumers **never charged**; **counselors are paid** to use it;
  **Keyz charges lenders & realtors**.
- **This build is a surprise**: Shawn doesn't know. Praveen makes the product/UX/copy decisions and
  presents a finished, working prototype. No access to Shawn, no access to the keyzforme.com domain.
- **Current site**: keyzforme.com — a stale GoDaddy template that mis-frames Keyz as a "task organizer
  app." We are NOT migrating or touching it.

## 2. Audience (two layers)

- **The person we must impress**: **Shawn** — he should click through a polished, *working* product
  and see the full three-sided vision realized. "Doing over over-analyzing" — a deployed, clickable
  thing beats any deck.
- **The in-product users (three roles)**, demoed with seeded/test accounts:
  - **Buyers** (subsidized side): centralize finances, get a readiness score, compare offers.
  - **Counselors** (paid side): coach assigned buyers, track their readiness improving.
  - **Lenders & realtors** (paying side): post offers that ready buyers compare.

## 3. Goals

- **A deployed, working full-stack prototype** that demonstrates the centralize → coach → compare
  model end-to-end across all three roles.
- **Explain the product correctly and instantly** on the public homepage — kill the "task organizer"
  confusion within one scroll.
- **Manufacture trust** — look as credible as Stripe / Rocket Money / a polished neobank.
- **Showcase Praveen's full-stack ability** — real auth, real DB, real flows — to land the job.

## 4. Scope — built in slices (each = its own design → plan → build → deploy)

| # | Slice | What it is | Status |
|---|-------|-----------|--------|
| 0 | **Foundation** | Monorepo: `web/` (Next.js + TS + Tailwind + shadcn/ui → Vercel) + `api/` (FastAPI + Alembic → Railway), Supabase wired, pre-commit hooks | ← starting now |
| 1 | **Marketing homepage** | The approved mockup. Public, no login. Design already locked. | ← starting now |
| 2 | **Contact form** | "Ask a question" → store in Supabase + email Praveen (Resend) | next |
| 3 | **Auth + roles** | Signup/login, three roles, role-based dashboards | |
| 4 | **Buyer flow** | Enter financial data → readiness score → view offers | |
| 5 | **Lender/realtor flow** | Create offers buyers can compare | |
| 6 | **Marketplace** | Buyer compares ranked offers ("best fit") from their profile | |
| 7 | **Counselor flow** | See assigned buyers, coach them, track readiness improvement | |

**Build order:** 0 → 1 → 2 (deployed public site + working form first), then 3 (auth), then 4 → 5 → 6 → 7.

## 5. Content

- **Praveen writes the copy** (it's a surprise — Shawn can't provide it). Placeholder copy/numbers in
  the mockup are fine to ship initially, then refine. Do not present invented figures as Keyz's real metrics.
- **Tone / brand**: warm but credible — fintech-grade trust + emotional warmth. Plain-spoken, human.
- **Factual stats are real & cited** — pulled from public sources and shown as static, sourced content:
  - **CFPB** — "nearly half of mortgage borrowers don't shop/compare lenders" (anchors the compare pitch);
    also HMDA API for mortgage data.
  - **NAR** — first-time-buyer share, median buyer age, down-payment % (annual *Profile of Home Buyers*).
  - **FRED / Census / Freddie Mac / FHFA** — homeownership rate, current mortgage rate, house-price index.
  - Rule: cite the source; verify the number before publishing. Live API pulls are optional polish (e.g.
    today's 30-yr rate from FRED), not core.

## 6. Visual direction

Locked 2026-06-18 (full system in memory `design-brand-direction`; build target is the mockup).

- **Feel**: warm / human (warm cream, generous spacing, approachable) — NOT cold corporate.
- **Palette "Harbor Navy + Sage"**: bg cream `#F5F0E8`, cards `#FFFFFF`, navy `#1B3A6B`, body ink
  `#1F2B3D`, sage accent `#7C9A7E` (decorative/large only — fails text contrast), deeper green `#3F6B4E`.
- **Type**: headlines **Fraunces** (400/600/700, italic accents); body/UI **Inter**.
- **North star**: Stripe / Rocket Money / polished neobank.
- **Homepage build target**: `mockups/homepage.html` — the real homepage must match it section-for-section.
  Replace emoji icons (🏠🧭🤝) with lucide line icons. Refs: `mockups/design-direction.html`,
  `color-palettes.html`, `typography.html`.

## 7. Tech & hosting

**Two-service architecture in one monorepo** (`web/` + `api/`). Confirmed 2026-06-19.

- **Frontend (`web/`)**: **Next.js 16** (App Router, TS strict, no `any`) + **Tailwind CSS v4** +
  **shadcn/ui on Base UI** (`base-nova`). Hosts on **Vercel** (deploys from the `web/` subdir).
  Icons: **lucide-react**.
- **Backend (`api/`)**: **Python FastAPI** (separate service) — owns **all** data access + business
  logic. Tooling: uv, Pydantic v2, SQLAlchemy 2.0, Alembic, pytest, ruff, mypy. Hosts on **Railway**
  (deploys from the `api/` subdir).
- **Database / Auth**: **Supabase** (hosted Postgres), **two projects (dev + prod)**. Postgres = the DB;
  Supabase Auth = identity/JWT; Storage = files. **Alembic owns the app-table schema**; Supabase owns
  the `auth` schema.
- **Data boundary**: Next.js uses Supabase **only for auth** (obtain JWT). It makes **no direct DB
  reads** — all data flows through FastAPI. Auth flow: Supabase Auth → JWT → `Authorization: Bearer`
  to FastAPI → FastAPI verifies vs Supabase JWKS → authorizes by role → queries Postgres.
- **Email**: **Resend** (form submission → email to Praveen).
- **Hosting**: **Vercel** (web) + **Railway** (api), preview deploy on every push. Share via the free
  `*.vercel.app` URL.
- **Domain**: none required to ship/share. Optional custom domain later (a variant Praveen owns —
  e.g. `trykeyz.com`; keyzforme.com belongs to Shawn and is off-limits). Add to Vercel any time.
- **Secrets**: `.env.local` / Railway env vars (git-ignored). Never commit keys.

## 8. Out of scope

- **Real public users / real consumer financial PII** — demo uses seeded/test accounts only. Opening to
  real users (real financial data) is a separate, heavier project (security, compliance) — not this build.
- Domain migration / touching the live keyzforme.com.
- CMS / self-editing.
- Real third-party integrations (credit bureaus, bank aggregation, real lender APIs) — flows are
  prototyped with manual entry + seeded data.
- Native mobile apps.
