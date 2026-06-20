# Quality Gates — consistency, security & performance from day one

`CLAUDE.md` / `docs/CONVENTIONS.md` are **advisory** (followed most of the time). This file is the
**enforced** layer: gates that run automatically so quality can't drift — plus from-the-start
checklists for security, performance, reliability, and data.

> **Stack:** Next.js 16 (App Router) + TS strict + Tailwind v4 + shadcn (Base UI) on **Vercel**;
> FastAPI on **Railway** (planned); **Supabase** (auth + data). Keep the halves that apply.
>
> **Status:** §1 pre-commit hook is **WIRED** (2026-06-19) for both `web/` and `api/`. §2 CI mirror
> still to do. Wiring the gates is a foundation task — cheaper now than retrofitting.

---

## 1. Pre-commit hook — the anti-"creep" gate (BIGGEST WIN — and you asked for this)

Stops inconsistent code/UI from entering a commit.

### Wired — husky + lint-staged, ONE hook for BOTH stacks

A private root `package.json` owns the git hooks. `.husky/pre-commit` runs `npx lint-staged`, which
routes staged files to per-stack gates via `.lintstagedrc.mjs`:

| Staged glob | Commands run |
|-------------|--------------|
| `web/**/*.{ts,tsx,js,jsx,css}` | `npm --prefix web run lint` (eslint) · `… run typecheck` (tsc) · `node scripts/check-tokens.mjs` |
| `api/**/*.py` | `uv --directory api run ruff check .` · `ruff format --check .` · `mypy app` |

`scripts/check-tokens.mjs` fails the commit on raw hex or bare `navy`/`sage` anywhere in `web/src`
**except** the theme file (`web/src/app/globals.css`, where Tier-1 primitives are defined) and
`web/src/components/site/**` (marketing components that consume primitives directly).

**Verified 2026-06-19:** a raw-hex web file and an unused-import in an api file are each blocked by
the hook (HEAD doesn't move); clean changes pass.

> Requires `uv` on PATH for the api gate — the Astral installer adds it; restart the terminal once
> after installing. ⚠️ A hook can be skipped with `--no-verify`. That's why §2 (CI) exists — it
> can't be bypassed. (Secret-scanning via gitleaks — §4 — can be added here later.)

## 2. CI mirror (GitHub Actions) — the un-bypassable gate

One workflow re-running `npm run lint` + `tsc --noEmit` + `npm run build` (+ backend checks when it
exists) on every push/PR. Make it a **required status check** before merge to `main`. Mirror `/quick-test`.

## 3. Consistency from the start — design-system discipline (anti-UI-creep)

You already built a two-tier token system — protect it:
- **Design tokens are the only source** for color/spacing/radius/type/shadow. **No raw hex, no magic
  px** in components (the `--color-brandmuted` vs shadcn `--muted` lesson is exactly this risk).
- **One component per concept** — never a second copy-pasted variant. Change once, changes everywhere.
- **shadcn (Base UI / base-nova) as the base layer** — wrap, don't fork. **Lucide** for all icons.
  Port Radix snippets correctly (`asChild` → `render` prop).
- **Overlays portal out** (date pickers, dropdowns, popovers) with collision-aware positioning — see
  the OVERLAYS lessons in `LESSONS.md`. Verify at viewport edges / in scroll areas.
- **Server Components by default**; add `"use client"` only for real interactivity.

## 4. Security checklist — from day one

- **AuthN vs AuthZ:** *Authentication* = "who are you?" (login). *Authorization* = "are you allowed to
  do THIS?" Confirm the user owns the row they touch, server-side — not just that they're logged in.
  This is the #1 data-leak cause.
- **The classic web attacks** (defenses mostly built-in if you don't fight them):
  - **SQL injection** — use parameters / the query builder, never string-concat.
  - **XSS** — React/Next escapes output by default; the danger is raw HTML injection.
  - **CSRF** — same-site cookies / tokens (`@supabase/ssr` handles most of it).
- **Secrets:** never committed; `.env.local` git-ignored; names in `.env.example`. **gitleaks** in
  pre-commit + CI. (Use the **publishable** key `sb_publishable_…`, not the legacy anon key.)
- **Dependency audit:** `npm audit` in CI; fail on high severity.
- **Supabase RLS:** enable Row-Level Security on every table with user data; test the policies.
- **Validate Server Action / route input** with Zod; return typed errors. Never trust the client.
- **Rate limiting / abuse:** middleware on any public/auth endpoints; cap any paid API spend.
- **Transport/CORS:** HTTPS everywhere (Vercel does this); allowlist origins — never `*` in prod.

## 5. Performance checklist — from day one

- **Next.js caching:** set an explicit `revalidate` / `cache` strategy — Next caches aggressively and
  can serve stale data silently. Wrap each async data dep in its own `<Suspense>` so the page streams.
- **Images:** use `next/image`; pre-render known pages (`generateStaticParams`).
- **DB (Supabase):** index columns you filter/sort on; watch for **N+1**; **paginate** lists.
- **Frontend:** small bundle (avoid heavy client libs); good **Core Web Vitals** (LCP, CLS, INP).
- **Budgets:** set a bundle-size budget + Lighthouse target; check in CI when it matters.

## 6. Reliability & data integrity — don't lose or corrupt data

- **Backups & recovery:** know *"if the DB died now, how much would I lose, how fast could I restore?"*
  Supabase auto-backs-up — **verify** the schedule; test a restore once.
- **Transactions:** group writes that must all succeed or all fail; never half-write.
- **DB constraints:** foreign keys, `NOT NULL`, `UNIQUE`, checks — enforce rules in the DB, the last defense.
- **Health checks & graceful failure:** a `/health` route on the FastAPI service; degrade when a
  dependency is down instead of crashing.

## 7. Environments & rollback — ship safely

- **dev → staging → prod.** You already have separate Supabase **dev/prod** projects — keep them similar.
- **Rollback plan:** undo a bad deploy in ~60s — `git revert`, or redeploy the previous Vercel build.
- **Migrations forward-only in prod:** never edit an applied migration; write a new one. (Alembic owns the schema.)

## 8. UX completeness — every screen has four states

- **Loading / empty / error / success** — build all four. Missing states are why a working site *looks* broken.
- **Accessibility:** keyboard-navigable, labeled inputs, alt text, WCAG AA contrast (your palette already passes).
- **Verify in a real browser (Playwright)** — this is a website; how it renders is the whole point.

## 9. Easy-to-forget list

- `.env.example` committed (names only) · **error monitoring** (Sentry) · **structured logs (no PII)**
- lockfiles committed · DB **seed/reset** script · **dependency licenses** · cloud **cost alerts**
- a `dev` branch + PR + **Vercel preview deploy** before `main`

---

### One-line version
Wire up the **husky pre-commit hook + a CI mirror first** (§1–§2) — you can do the frontend hook
today. The deeper "why" behind each item lives in `docs/SOFTWARE-FOUNDATIONS.md`.
