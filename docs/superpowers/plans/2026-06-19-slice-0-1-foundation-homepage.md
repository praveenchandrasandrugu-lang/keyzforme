# Slice 0 + 1 — Foundation & Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployed Next.js + Tailwind + shadcn/ui app wired to Supabase (Slice 0), then build the public marketing homepage to match `mockups/homepage.html` section-for-section (Slice 1).

**Architecture:** App Router, TypeScript strict. Design tokens live in `src/app/globals.css` via Tailwind v4 `@theme` (single source of truth for the locked palette/fonts). The homepage is composed in `src/app/page.tsx` from one presentational component per section under `src/components/site/`. Supabase clients (browser + server) are wired now but no tables yet — those arrive in Slice 2/3. Backend stays inside the Next.js app (Server Actions / Route Handlers); no separate server.

**Tech Stack:** Next.js 16 (App Router, Turbopack default), TypeScript (strict, no `any`), Tailwind CSS v4, shadcn/ui, lucide-react, `@supabase/supabase-js` + `@supabase/ssr`, deployed on Vercel.

> **Verified 2026-06-19 against current docs.** `create-next-app@latest` now installs **Next.js 16** (not 15) — Turbopack is the stable default; the session-refresh file is `proxy.ts` (deferred to Slice 3). Fonts in Tailwind v4 MUST use `@theme inline`. `shadcn init` rewrites `globals.css`, so it runs BEFORE we author final tokens. Supabase uses the **publishable** key. These corrections are baked into the tasks below.

**Source of truth for the homepage:** `mockups/homepage.html` — Praveen approved it exactly. Each section task below cites its line range in that file. Copy/markup MUST match it (copy/numbers are placeholders to refine later, but ship as-is now). Convert inline-styled HTML → React + Tailwind utilities mapped to the tokens from Task 0.3. Replace emoji icons (🏠🧭🤝) with lucide icons.

**Verification model (important — read before starting):** This slice is a static, presentational site with no business logic, so classic unit-test TDD does not apply. The verification gates for every task are: `npm run typecheck`, `npm run lint`, `npm run build` (all must pass clean), and — for any visual change — a **Playwright MCP** check in a real browser against the mockup (CLAUDE.md rule 7). Treat those as the "tests." Do NOT invent meaningless unit tests for static markup.

**Branch:** work on `dev` (already current). Commit after each task. Push when Praveen approves (he has 2 unpushed commits + these).

**Per CLAUDE.md rule 6:** before running scaffold/Supabase commands, fetch current docs via Context7 (`mcp__context7__resolve-library-id` → `query-docs`) for `next.js`, `tailwindcss`, `shadcn/ui`, and `@supabase/ssr` to re-confirm the (already-verified) commands below still hold at execution time.

---

## File Structure (created across this plan)

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs   # Task 0.1–0.2
src/app/layout.tsx          # fonts + metadata + <body> shell           (0.3, 1.1)
src/app/globals.css         # Tailwind import + @theme design tokens     (0.3)
src/app/page.tsx            # composes the homepage sections             (1.1)
src/lib/utils.ts            # cn() helper from shadcn                    (0.4)
src/lib/supabase/client.ts  # browser Supabase client                   (0.5)
src/lib/supabase/server.ts  # server Supabase client                    (0.5)
src/components/ui/          # shadcn primitives (button)                 (0.4)
src/components/site/Nav.tsx          (1.2)
src/components/site/Hero.tsx + ReadinessCard.tsx   (1.3)
src/components/site/TrustStrip.tsx   (1.4)
src/components/site/HowItWorks.tsx   (1.5)
src/components/site/Marketplace.tsx  (1.6)
src/components/site/Audience.tsx     (1.7)
src/components/site/CtaBand.tsx      (1.8)
src/components/site/Footer.tsx       (1.9)
.env.local                  # Supabase keys (git-ignored)               (0.5)
.env.example                # documented placeholder keys (committed)   (0.5)
docs/architecture/frontend.md   # frontend architecture reference        (0.6)
```

---

# SLICE 0 — FOUNDATION (issue #1)

## Task 0.1: Scaffold Next.js into the existing repo

The repo is non-empty (`docs/`, `mockups/`, `CLAUDE.md`, etc.), so `create-next-app .` will refuse. Scaffold into a temp folder, move the generated files to root, then install.

**Files:** Creates `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/*`, `public/*`, `next-env.d.ts`.

- [ ] **Step 1:** (Context7) Fetch current `create-next-app` usage to confirm flags. NOTE: `@latest` = **Next.js 16** (Turbopack default). Do NOT use `--no-turbopack` (removed) or `--no-git` (wrong). `--yes` is required so Next 16's new prompts (defaults / linter / React Compiler / AGENTS.md) don't hang a non-interactive session. `--no-agents-md` is required — without it the scaffold generates its own `CLAUDE.md`/`AGENTS.md` that would overwrite this project's existing ones when files move to root.

- [ ] **Step 2:** Scaffold into a temp dir with fully non-interactive, version-correct flags:

```powershell
npx create-next-app@latest _scaffold --yes --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --no-agents-md
```
Expected generated files (Tailwind v4): NO `tailwind.config.*`; `postcss.config.mjs` with `@tailwindcss/postcss`; `globals.css` starting `@import "tailwindcss";`; `next.config.ts`; `eslint.config.mjs` (flat config).

- [ ] **Step 3:** Move generated files into the repo root with an explicit resolved destination (a bare `Move-Item -Destination .` is unreliable for directories on Windows). Exclude `node_modules`/`.git`/`.gitignore`; merge `.gitignore` separately.

```powershell
$root = (Get-Location).Path
Get-ChildItem -Path _scaffold -Force |
  Where-Object { $_.Name -notin @('node_modules', '.gitignore', '.git') } |
  ForEach-Object { Move-Item -LiteralPath $_.FullName -Destination $root -Force }
# append the scaffold's gitignore entries to ours (Next.js: /.next, /node_modules, /build, .env*, etc.)
Get-Content _scaffold/.gitignore | Add-Content .gitignore
Remove-Item _scaffold -Recurse -Force
```
Confirm the existing root `CLAUDE.md` / `AGENTS.md` are untouched (the `--no-agents-md` flag should have prevented any scaffold version).

- [ ] **Step 4:** De-duplicate `.gitignore` by hand (open it, remove any duplicate lines from the append). Ensure it ignores `/.next`, `/node_modules`, `.env*` (keep `!.env.example`).

- [ ] **Step 5:** Install deps at root:

```powershell
npm install
```

- [ ] **Step 6 (verify):** Build the untouched starter to confirm the scaffold is healthy.

```powershell
npm run build
```
Expected: build completes with no type/lint errors.

- [ ] **Step 7 (verify):** Start dev server and confirm the Next.js starter renders.

```powershell
npm run dev    # run in background; open http://localhost:3000
```
Use Playwright MCP `browser_navigate` to `http://localhost:3000` and confirm the default Next.js page loads. Then stop the dev server.

- [ ] **Step 8 (commit):**

```powershell
git add -A
git commit -m "feat: scaffold Next.js app (App Router, TS, Tailwind v4)"
```

## Task 0.2: Tighten TypeScript + add scripts

**Files:** Modify `tsconfig.json`, `package.json`.

- [ ] **Step 1:** In `tsconfig.json` `compilerOptions`, confirm `"strict": true` and ADD `"noUncheckedIndexedAccess": true` and `"noImplicitOverride": true`. Do not loosen anything.

- [ ] **Step 2:** In `package.json` `scripts`, add a typecheck script (lint/build already exist):

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3 (verify):**

```powershell
npm run typecheck ; npm run lint ; npm run build
```
Expected: all three pass clean.

- [ ] **Step 4 (commit):**

```powershell
git add tsconfig.json package.json
git commit -m "chore: stricter TS config + typecheck script"
```

## Task 0.3: Fonts + shadcn init + final theme tokens (correct order)

The heart of the zero-tech-debt design system. **ORDER MATTERS:** `shadcn init` rewrites `globals.css` to its template, so we run it FIRST, then author the final merged token file on top. Fonts use `@theme inline` (a plain `@theme` breaks the next/font variable chain), and the primitive muted color is named `--color-brandmuted` to avoid colliding with shadcn's semantic `--muted`.

**Two-tier token architecture:**
- **Tier 1 — primitives:** raw brand values (`--color-navy`, `--color-sage`, …) + scale, in a plain `@theme` block (emits `bg-navy`, `text-navy`, …).
- **Tier 2 — semantic roles:** shadcn's `--background`/`--primary`/`--card`/`--border`/`--ring`/… in `:root`, exposed via `@theme inline`, each mapped to a Tier-1 primitive. Interactive components (buttons, inputs, tables, date pickers, dialogs) consume ONLY semantic roles. Raw `navy`/`sage` primitives are used ONLY in marketing `src/components/site/*`. No raw hex in components, ever. (Recorded in `docs/architecture/frontend.md`, Task 0.6.)

**Files:** Creates `components.json`, `src/lib/utils.ts`. Modifies `src/app/layout.tsx`, `src/app/globals.css`.

- [ ] **Step 1 (fonts → layout.tsx):** Load fonts via `next/font/google` and put their CSS variables on `<html>`:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Keyz — Home ownership, made human.",
  description:
    "Keyz brings your finances, a real coach, and the right lenders & realtors into one place — so you go from someday to keys-in-hand with a plan, not a guess.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2 (shadcn init — BEFORE authoring tokens):** (Context7) Confirm current `shadcn init` for Tailwind v4 + Next 16 + `--src-dir`, then:

```powershell
npx shadcn@latest init
```
Accept the Tailwind-v4 path. This creates `components.json` + `src/lib/utils.ts` and REWRITES `src/app/globals.css` with its template (`@import "tailwindcss"`, `@custom-variant dark`, `@theme inline`, full `:root`/`.dark` in oklch, a base layer). Expected — we overwrite the values in Step 4.

- [ ] **Step 3 (verify config path):** In `components.json` confirm `"css": "src/app/globals.css"` and `"tailwind.config": ""` (v4 = no JS config). With `--src-dir`, init occasionally guesses `app/globals.css` — if so, fix it and delete any stray `app/` file it created.

- [ ] **Step 4 (author final globals.css):** Replace `src/app/globals.css` with this exact structure — primitives (plain `@theme`), fonts (`@theme inline`), semantic mapping (`@theme inline` + `:root`), base layer:

```css
@import "tailwindcss";
@import "tw-animate-css";                 /* added by shadcn init — keep */
@custom-variant dark (&:is(.dark *));      /* added by shadcn init — keep */

/* Tier 1 — brand primitives (static; emit bg-navy/text-navy/etc.) */
@theme {
  --color-cream: #F5F0E8;
  --color-surface: #FFFFFF;
  --color-navy: #1B3A6B;
  --color-ink: #1F2B3D;
  --color-brandmuted: #566377;   /* muted body text → text-brandmuted in marketing */
  --color-sage: #7C9A7E;
  --color-green: #3F6B4E;
  --color-pill: #DDE7DE;
  --color-pilltext: #3C5A45;
  --color-line: #E7E0D2;
  --color-line2: #ECEADF;
  --color-gold: #C08A2D;
  --shadow-card: 0 24px 60px -28px rgba(27, 58, 107, 0.35);
}

/* fonts + any var()-referencing token MUST be inline or the utility won't resolve */
@theme inline {
  --font-serif: var(--font-fraunces);
  --font-sans: var(--font-inter);
}

/* Tier 2 — shadcn semantic roles exposed as utilities, each → a Tier-1 primitive */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.75rem;
  --background: var(--color-cream);
  --foreground: var(--color-ink);
  --card: var(--color-surface);
  --card-foreground: var(--color-ink);
  --popover: var(--color-surface);
  --popover-foreground: var(--color-ink);
  --primary: var(--color-navy);
  --primary-foreground: #FFFFFF;
  --secondary: var(--color-pill);
  --secondary-foreground: var(--color-pilltext);
  --muted: var(--color-pill);
  --muted-foreground: var(--color-brandmuted);
  --accent: var(--color-sage);
  --accent-foreground: var(--color-pilltext);
  --destructive: oklch(0.577 0.245 27.325);   /* keep shadcn's red */
  --border: var(--color-line);
  --input: var(--color-line);
  --ring: var(--color-navy);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans), system-ui, sans-serif;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 {
    font-family: var(--font-serif), Georgia, serif;
    color: var(--color-navy);
    line-height: 1.08;
    letter-spacing: -0.5px;
  }
}
```
Site is light-only; leave `.dark` unused. `:root` is the single place mapping semantic→primitive.

- [ ] **Step 5 (verify):** Add a throwaway block to `src/app/page.tsx`: `<h1 className="font-serif text-navy">Token test</h1>`, a `bg-sage` box, `<p className="text-brandmuted">muted</p>`. `npm run dev` + Playwright confirm Fraunces renders and navy/sage/brandmuted are correct; then revert. `npm run build` — pass.

- [ ] **Step 6 (commit):**

```powershell
git add src/app/layout.tsx src/app/globals.css components.json src/lib/utils.ts
git commit -m "feat: two-tier design tokens + fonts + shadcn theme base"
```

## Task 0.4: Add base components + lucide, verify on-brand

shadcn is initialized and themed (Task 0.3). Add the first component + icons and prove the brand mapping works. Every shadcn component added in later slices (table, date picker, form, dialog…) inherits this theme automatically.

**Files:** Creates `src/components/ui/button.tsx`. Modifies `package.json`.

- [ ] **Step 1:**

```powershell
npx shadcn@latest add button
npm install lucide-react
```

- [ ] **Step 2 (verify brand mapping):** Temporarily render `<Button>Primary</Button>` and `<Button variant="outline">Outline</Button>` on the page; `npm run dev` + Playwright confirm the primary button is **navy** (not gray) and the outline border/focus ring use brand colors. Remove the temporary markup.

- [ ] **Step 3 (verify build):**

```powershell
npm run typecheck ; npm run build
```
Expected: pass. `src/components/ui/button.tsx` exists; default Button renders on-brand.

- [ ] **Step 4 (commit):**

```powershell
git add -A
git commit -m "chore: add shadcn button + lucide-react"
```

## Task 0.5: Wire Supabase (clients + env), no tables yet

**Files:** Creates `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `.env.local` (git-ignored), `.env.example` (committed). Modifies `package.json`.

> **Key naming:** current Supabase uses the **publishable** key (`sb_publishable_...`), env name `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. (Legacy `anon` keys still work, but we start on the current path — zero tech debt.) Use this exact name in ALL five places: `.env.local`, `.env.example`, `client.ts`, `server.ts`, and Vercel (Task 0.7).
>
> **Session refresh deferred:** Supabase SSR normally ships a `proxy.ts` (Next 16; `middleware.ts` on Next 15) that refreshes auth tokens. Slice 0 has no auth/tables, so the server client is **read-only** and we deliberately defer that file to **Slice 3 (auth)**. Until then the `setAll` try/catch is a harmless no-op.

- [ ] **Step 1:** Create a Supabase project (dashboard at supabase.com OR the Supabase MCP `create_project` — requires a cost confirmation). Copy the **Project URL** and **publishable key** (`sb_publishable_...`).

- [ ] **Step 2:** Install SDKs:

```powershell
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3:** Create `.env.local` (NEVER commit) with the real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

- [ ] **Step 4:** Create `.env.example` (committed, no secrets):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 5:** (Context7) Fetch current `@supabase/ssr` browser/server client patterns, then create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

- [ ] **Step 6:** Create `src/lib/supabase/server.ts` (Next 16 async `cookies()`; `getAll`/`setAll` per current @supabase/ssr docs):

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context — no-op until the Slice 3 session-refresh proxy exists
          }
        },
      },
    },
  );
}
```

- [ ] **Step 7 (verify REAL connectivity):** `createClient()` alone opens no connection — a bare `{ ok: true }` proves nothing. Create a temporary `src/app/health/route.ts` that does a real round-trip to the Supabase Auth server (works with no tables and no session):

```ts
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.auth.getClaims(); // real round-trip; no session is fine
  return Response.json({ ok: !error, error: error?.message ?? null });
}
```
`npm run dev`, navigate to `http://localhost:3000/health` with Playwright, confirm `{ ok: true, error: null }` (a wrong URL/key surfaces as `ok: false`). Then DELETE the route.

- [ ] **Step 8 (verify):** `npm run typecheck ; npm run build` — pass.

- [ ] **Step 9 (commit):**

```powershell
git add src/lib/supabase .env.example package.json package-lock.json
git commit -m "feat: wire Supabase browser + server clients"
```
Confirm `git status` does NOT show `.env.local`.

## Task 0.6: Write docs/architecture/frontend.md

**Files:** Create `docs/architecture/frontend.md`.

- [ ] **Step 1:** Write a concise reference covering: folder structure (`src/app`, `src/components/site`, `src/components/ui`, `src/lib`); the **two-tier token system** (Tier 1 primitives in `@theme`; Tier 2 semantic roles for shadcn) and the enforced rule — *interactive components use ONLY semantic tokens / shadcn primitives; raw hex is banned; raw brand tokens (`navy`/`sage`) are allowed only in `src/components/site/*`*; font setup; and the "one component per homepage section" convention. Note that all shadcn components inherit the brand automatically via the semantic mapping, so new components are consistent by default. Keep under ~110 lines. State that `database.md` and `backend.md` will be added in Slice 2/3.

  Also record the **approved frontend toolkit** (one tool per job; add per-slice, never all at once):
  - **shadcn/ui** for all components (Button, Input, Select, Form, Card, Badge, Tabs, Table/Data Table, Dialog, Sheet, Popover, Dropdown, Tooltip, Sonner, Skeleton, Progress, Sidebar, Breadcrumb, Calendar/Date Picker, Command, Chart).
  - **react-hook-form + zod** (forms + validation), **TanStack Table** (data tables), **Recharts** (charts), **date-fns** (dates), **lucide-react** (icons), **Framer Motion** (motion/delight).
  - Add only when needed: TanStack Query, next-themes, zustand.
  - Excluded by decision (avoid bloat / token conflicts): MUI/Ant/Chakra, Redux, styled-components/emotion, any second animation lib.

- [ ] **Step 2 (commit):**

```powershell
git add docs/architecture/frontend.md
git commit -m "docs: add frontend architecture reference"
```

## Task 0.7: Deploy to Vercel

This needs interactive login — Praveen runs the auth step (suggest the `!` prefix in the session, e.g. `! npx vercel login`).

- [ ] **Step 1:** Push `dev` to GitHub so Vercel can import it (Praveen approves the push first):

```powershell
git push origin dev
```

- [ ] **Step 2:** Link the local dir from the CLI so Step 4 is non-interactive (do this, not just a dashboard import): `npx vercel link`. Framework auto-detects Next.js.

- [ ] **Step 3:** Add env vars BEFORE the first build (a build without them runs with `undefined`). Either in Vercel Project Settings → Environment Variables, or via CLI, add the SAME names as `.env.local`:

```powershell
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
```

- [ ] **Step 4:** Deploy (now non-interactive since the dir is linked and env vars exist):

```powershell
npx vercel --prod
```

- [ ] **Step 5 (verify):** Open the returned `*.vercel.app` URL in Playwright MCP and confirm the app loads (still the starter/blank page at this point — that's expected; homepage is Slice 1).

- [ ] **Step 6:** Comment the live URL on issue #1 and close it:

```powershell
gh issue close 1 --comment "Foundation deployed: <vercel-url>"
```

---

# SLICE 1 — MARKETING HOMEPAGE (issue #2)

**Method for every section task below:** create the component file; port the markup from the cited `mockups/homepage.html` lines, converting `class=` → `className`, inline `style=` and the mockup's CSS classes → Tailwind utilities using Task 0.3 tokens; keep the **exact copy**; then verify the section in a real browser against the mockup via Playwright MCP. Commit per section. Use a shared container utility for the mockup's `.wrap` (`max-width:1140px; padding:0 28px;`) → `mx-auto max-w-[1140px] px-7`.

**Token mapping for marketing components:** `.navy` → `text-navy`/`bg-navy`; `--line` borders → `border-line`. ⚠️ The mockup's muted text color (`--muted: #566377`) maps to **`text-brandmuted`**, NOT `text-muted` — `text-muted`/`bg-muted` are now shadcn surface roles (light pill color). Wherever a task below says "muted text," use `text-brandmuted`. Headline accent words (`.accent`) → `text-green italic font-semibold`. The sage accent (`bg-sage`/`text-sage`) is for decoration/large only, never small text (contrast).

## Task 1.1: Homepage shell + section skeletons

**Files:** Modify `src/app/page.tsx`.

- [ ] **Step 1:** Build `page.tsx` importing the eight page-level section components (created in later tasks; `ReadinessCard` is internal to `Hero`, not imported here) in mockup order. Until each exists, stub missing ones inline so the file compiles. Final order:

```tsx
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { TrustStrip } from "@/components/site/TrustStrip";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Marketplace } from "@/components/site/Marketplace";
import { Audience } from "@/components/site/Audience";
import { CtaBand } from "@/components/site/CtaBand";
import { Footer } from "@/components/site/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Marketplace />
        <Audience />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2:** Define a shared container. Add to `globals.css @layer base` (or a component): a `.wrap` equivalent — prefer a Tailwind pattern `mx-auto max-w-[1140px] px-7`. Use that class set on each section's inner div.

- [ ] **Step 3 (verify):** It will not build until components exist — that's expected. Proceed to Task 1.2; this file is finalized when all sections are built. (Do not commit a broken build; commit page.tsx at the end of Task 1.9.)

## Task 1.2: Nav (mockup lines 30–36, 131–137)

**Files:** Create `src/components/site/Nav.tsx`.

- [ ] **Step 1:** Build a sticky top nav: `sticky top-0 z-10`, translucent cream bg `bg-cream/80 backdrop-blur`, `border-b border-line`, height 72px, inner flex justify-between in the `.wrap` container.
  - Logo: `Key` + `z` where the `z` is sage — `<span className="font-serif font-bold text-[25px] text-navy">Key<span className="text-sage">z</span></span>`.
  - Links (muted, hover→navy): **How it works · The marketplace · For partners · About** — as in-page anchor links (`#how`, `#marketplace`, `#partners`, `#about`); add matching `id`s to the corresponding sections in their tasks.
  - Right side: "Sign in" ghost button + "Check my readiness" primary (navy) button. Buttons are styled `Link`s/`<a>` matching `.btn`/`.btn-primary`/`.btn-ghost` (lines 23–25): `rounded-[11px] px-6 py-3 text-[15px] font-semibold`.

- [ ] **Step 2 (verify):** Playwright: nav sticks on scroll, links + buttons render, colors match mockup.

- [ ] **Step 3 (commit):** `git add src/components/site/Nav.tsx && git commit -m "feat(home): sticky nav"`

## Task 1.3: Hero + ReadinessCard (mockup lines 38–65, 139–169)

**Files:** Create `src/components/site/Hero.tsx`, `src/components/site/ReadinessCard.tsx`.

- [ ] **Step 1:** `Hero` — two-column grid (`md:grid-cols-[1.05fr_.95fr] gap-[54px] items-center`, stacks to one column on mobile), padding `pt-[72px] pb-20`, in `.wrap`. Left column:
  - Pill: "No cost to you, ever" (`.pill` → `rounded-full bg-pill text-pilltext px-[15px] py-[7px] text-[13px] font-semibold`).
  - `<h1>` `text-[60px] font-semibold` (responsive: smaller on mobile, e.g. `text-4xl md:text-[60px]`): "Home ownership," <br/> italic-sage accent "made human." (`.accent` → `text-green italic font-semibold`).
  - Lead `<p className="text-[19px] text-brandmuted my-[24px_0_32px] max-w-[90%]">`: exact copy from line 144.
  - Actions: primary "Check my readiness →" + ghost "See how it works".
  - Reassure row (line 149–153): three items each with a sage dot — "Free for buyers", "Bank-level security", "No credit impact".

- [ ] **Step 2:** `ReadinessCard` — the right-column visual (lines 49–66 styles, 155–168 markup). White card, `rounded-[20px] border border-line p-[26px]`, soft shadow `shadow-[0_24px_60px_-28px_rgba(27,58,107,0.35)]`. Contains:
  - Top row: label "Your home-readiness" + "On track" (Fraunces) on the left; the **readiness ring** on the right.
  - Ring (line 52–55): a 96px circle using a conic-gradient at 72%. Implement with an inline style since it's a one-off:
    ```tsx
    <div className="grid h-24 w-24 place-items-center rounded-full"
         style={{ background: "conic-gradient(var(--color-green) 72%, #e8eef0 0)" }}>
      <div className="grid h-[74px] w-[74px] place-items-center rounded-full bg-white text-center">
        <div><b className="font-serif text-2xl text-navy leading-none">72</b><br /><small className="text-[10px] text-brandmuted">/ 100</small></div>
      </div>
    </div>
    ```
  - Three rows (line 160–162): "Down-payment savings ✓ Ready" (green), "Credit health ✓ Ready" (green), "Debt-to-income · 2 steps left" (gold). Use lucide `Check` for the ✓.
  - Offer preview block (line 163–167): cream rounded box, heading "Offers waiting when you're ready", two rows: "Lender · Summit Home Loans → 6.1%" and "Realtor · M. Alvarez → [Top match] badge".

- [ ] **Step 3 (verify):** Playwright at desktop AND mobile widths (`browser_resize`): ring shows ~72% green arc, layout matches mockup, stacks cleanly on mobile.

- [ ] **Step 4 (commit):** `git add src/components/site/Hero.tsx src/components/site/ReadinessCard.tsx && git commit -m "feat(home): hero + readiness card"`

## Task 1.4: TrustStrip (mockup lines 67–72, 171–177)

**Files:** Create `src/components/site/TrustStrip.tsx`.

- [ ] **Step 1:** Full-width band `bg-[#f1eadf] border-y border-line`. Inner `.wrap` flex, `py-[22px]`, wraps on mobile. Four stats, each centered with a Fraunces `text-[30px] text-navy` number + muted caption:
  - "1 place" / "Finances, coaching & offers"
  - "$0" / "Cost to home buyers"
  - "Real data" / "Offers based on your actual position"
  - "Side by side" / "Compare lenders & realtors"

- [ ] **Step 2 (verify):** Playwright — four stats evenly spaced desktop, wrap to 2x2 on mobile.

- [ ] **Step 3 (commit):** `git add src/components/site/TrustStrip.tsx && git commit -m "feat(home): trust strip"`

## Task 1.5: HowItWorks (mockup lines 74–85, 179–191)

**Files:** Create `src/components/site/HowItWorks.tsx`. Add `id="how"`.

- [ ] **Step 1:** `section` padding `py-[88px]` (`py-16 md:py-[88px]`). Centered `.shead`: eyebrow "How it works" (`text-sage uppercase tracking-[0.08em] text-[13px] font-bold`), `<h2 className="text-[42px] font-semibold">` "Three steps from *wanting* to *ready*." (accent words green/italic), muted sub-paragraph (line 184 copy).
  - Three-column grid (`md:grid-cols-3 gap-[22px]`, stacks mobile). Each `.step` card: white, `rounded-[18px] border border-line p-[30px_26px]`, a numbered badge (`.num`: 42px rounded square, `bg-pill text-green font-serif`), `<h3 className="text-[22px]">`, muted `<p>`. Exact copy from lines 187–189 (Centralize your money / Get coached to ready / Compare real offers).

- [ ] **Step 2 (verify):** Playwright — three cards desktop, stacked mobile; accent words render green italic.

- [ ] **Step 3 (commit):** `git add src/components/site/HowItWorks.tsx && git commit -m "feat(home): how it works"`

## Task 1.6: Marketplace (mockup lines 87–103, 193–227)

**Files:** Create `src/components/site/Marketplace.tsx`. Add `id="marketplace"`.

- [ ] **Step 1:** Navy section `bg-navy text-[#eaf0fb]`, `py-[88px]`. Two-column grid (`md:grid-cols-[1fr_1.1fr] gap-[54px] items-center`). Left:
  - eyebrow (sage-tint `#9ec3a7`) "The marketplace", `<h2 className="text-white text-[40px] font-semibold">` "Let lenders & realtors *compete for you.*" (accent `#9ec3a7` italic).
  - lead `text-[#b9c6df]` (line 198 copy).
  - Three-item check list (lines 200–202) — each with a round `#2f5a87` check chip (lucide `Check`, color `#9ec3a7`); preserve the bold spans on "real" and "you".
  - Ghost button "Explore the marketplace" (white text, `border-[#3d5e8c]`).
  - Right: the **compare card** — white `rounded-[18px] p-5 text-ink`, heading "Your lender offers · ranked for you". Three offer rows (lines 208–225): grid `grid-cols-[1.4fr_.8fr_.8fr_auto]`. Row 1 is `.best` (sage border + ring + `#f6faf6` bg) with a "Best fit" sage tag; rows 2 and 3 show "#2"/"#3". Each row: lender name + "30-yr fixed · $X fees" sub, Fraunces APR, Fraunces "/mo" payment. Exact numbers from the mockup (Summit 6.08% $1,840 Best fit; Harbor 6.24% $1,879 #2; Nationwide 6.31% $1,896 #3).

- [ ] **Step 2 (verify):** Playwright — navy bg, "Best fit" row highlighted with sage ring, grid aligns, stacks on mobile.

- [ ] **Step 3 (commit):** `git add src/components/site/Marketplace.tsx && git commit -m "feat(home): marketplace section"`

## Task 1.7: Audience (mockup lines 105–112, 229–255)

**Files:** Create `src/components/site/Audience.tsx`. Add `id="partners"`.

- [ ] **Step 1:** `section py-[88px]`. Centered `.shead`: eyebrow "Built for everyone at the table", `<h2>` "One platform, *three sides* that win." Three-column grid of `.aud` cards (white, `rounded-[18px] border border-line p-[30px_26px]`). Replace the emoji icons with lucide icons in a `bg-pill` rounded-square `.ico` (46px):
  - "For home buyers" — lucide `House` — copy line 239 — "Always free →" (sage).
  - "For financial counselors" — lucide `Compass` — copy line 245 — link "Partner with us →" (green).
  - "For lenders & realtors" — lucide `Handshake` — copy line 251 — link "List on Keyz →" (green).

- [ ] **Step 2 (verify):** Playwright — three cards, lucide icons (no emoji), correct links.

- [ ] **Step 3 (commit):** `git add src/components/site/Audience.tsx && git commit -m "feat(home): three-sided audience"`

## Task 1.8: CtaBand (mockup lines 114–118, 257–264)

**Files:** Create `src/components/site/CtaBand.tsx`.

- [ ] **Step 1:** A section (`pt-0`) holding a rounded gradient band: `rounded-[26px] p-14 text-center text-white` with `background: linear-gradient(135deg,#16315a,#1B3A6B 55%,#244b85)`. `<h2 className="text-white text-[40px] font-semibold">` "Your first home is closer\nthan it feels." muted-blue `<p>` (line 261 copy). White primary button "Check my readiness →" (`bg-white text-navy`).

- [ ] **Step 2 (verify):** Playwright — gradient renders, white button, centered.

- [ ] **Step 3 (commit):** `git add src/components/site/CtaBand.tsx && git commit -m "feat(home): CTA band"`

## Task 1.9: Footer + finalize page (mockup lines 120–126, 266–278)

**Files:** Create `src/components/site/Footer.tsx`; finalize `src/app/page.tsx` (add `id="about"` target if used).

- [ ] **Step 1:** `footer py-[56px_0_40px] text-brandmuted text-[14px]`. Four-column grid (`grid-cols-[1.4fr_1fr_1fr_1fr] gap-[30px]`, stacks mobile):
  - Brand col: Keyz logo + tagline (line 271).
  - Product: How it works / The marketplace / Readiness check.
  - Partners: For counselors / For lenders / For realtors.
  - Company: About / Contact / Privacy.
  - Bottom bar (`border-t border-line pt-[22px] flex justify-between`): "© 2026 Keyz. All rights reserved." + "Made with care for first-time buyers."

- [ ] **Step 2:** Finalize `page.tsx` (from Task 1.1) — all imports now resolve.

- [ ] **Step 3 (verify):** `npm run typecheck ; npm run lint ; npm run build` — all pass. Then `npm run dev` and Playwright full-page screenshot; compare top-to-bottom against `mockups/homepage.html` open in a second tab.

- [ ] **Step 4 (commit):** `git add src/components/site/Footer.tsx src/app/page.tsx && git commit -m "feat(home): footer + assemble homepage"`

## Task 1.10: Responsive + accessibility + final visual pass

**Files:** Touch components as needed for fixes only.

- [ ] **Step 1:** Playwright `browser_resize` at 390px, 768px, 1280px. Verify: nav usable, hero stacks, all grids collapse to single/again-readable columns, no horizontal scroll, text legible.

- [ ] **Step 2:** Accessibility quick pass (invoke `web-design-guidelines` skill): one `<h1>`, semantic landmarks (`nav`/`main`/`footer`), links have discernible text, color contrast — confirm body text uses navy/ink/green (NOT sage) per the accessibility rule in the design brief. Fix any violations.

- [ ] **Step 3 (verify):** Re-run `npm run build`; Playwright final pass at all three widths.

- [ ] **Step 4 (commit):** `git add -A && git commit -m "fix(home): responsive + a11y polish"` (only if changes were needed).

## Task 1.11: Deploy + close issue

- [ ] **Step 1:** Push and let Vercel auto-deploy:

```powershell
git push origin dev
```

- [ ] **Step 2 (verify):** Open the live `*.vercel.app` URL in Playwright; confirm the real homepage matches the mockup.

- [ ] **Step 3:** Close issue #2:

```powershell
gh issue close 2 --comment "Homepage live and matching the approved mockup: <vercel-url>"
```

- [ ] **Step 4:** Add a `LESSONS.md` entry for anything that bit us during this slice.

---

## Self-Review (completed by plan author)

- **Spec coverage:** PRD §4 Slice 0 (scaffold/Supabase/Vercel) → Tasks 0.1–0.7. PRD §4 Slice 1 (8 homepage sections) → Tasks 1.2–1.9, each section accounted for. PRD §6 design system (palette/fonts/lucide) → Task 0.3 + per-section icon swaps. PRD §7 stack → 0.1–0.5. `docs/architecture/frontend.md` request → Task 0.6. ✅
- **Placeholder scan:** Section markup references exact mockup line ranges + exact copy + token mappings rather than re-pasting 280 lines of HTML — this is a deliberate, concrete method (source file is the authoritative markup), not a "TODO." Non-trivial visuals (readiness ring, compare grid) have full code. ✅
- **Type/name consistency:** Component names match between `page.tsx` imports (Task 1.1) and their creating tasks (Nav, Hero, TrustStrip, HowItWorks, Marketplace, Audience, CtaBand, Footer). Supabase `createClient()` named consistently across client/server. ✅
- **Verification model:** Adapted from unit-TDD to build + browser verification because the slice is static presentational markup with no logic — stated up front so the executor doesn't fake tests. ✅
