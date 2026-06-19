# Slice 0 + 1 — Foundation & Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployed Next.js + Tailwind + shadcn/ui app wired to Supabase (Slice 0), then build the public marketing homepage to match `mockups/homepage.html` section-for-section (Slice 1).

**Architecture:** App Router, TypeScript strict. Design tokens live in `src/app/globals.css` via Tailwind v4 `@theme` (single source of truth for the locked palette/fonts). The homepage is composed in `src/app/page.tsx` from one presentational component per section under `src/components/site/`. Supabase clients (browser + server) are wired now but no tables yet — those arrive in Slice 2/3. Backend stays inside the Next.js app (Server Actions / Route Handlers); no separate server.

**Tech Stack:** Next.js 15 (App Router), TypeScript (strict, no `any`), Tailwind CSS v4, shadcn/ui, lucide-react, `@supabase/supabase-js` + `@supabase/ssr`, deployed on Vercel.

**Source of truth for the homepage:** `mockups/homepage.html` — Praveen approved it exactly. Each section task below cites its line range in that file. Copy/markup MUST match it (copy/numbers are placeholders to refine later, but ship as-is now). Convert inline-styled HTML → React + Tailwind utilities mapped to the tokens from Task 0.3. Replace emoji icons (🏠🧭🤝) with lucide icons.

**Verification model (important — read before starting):** This slice is a static, presentational site with no business logic, so classic unit-test TDD does not apply. The verification gates for every task are: `npm run typecheck`, `npm run lint`, `npm run build` (all must pass clean), and — for any visual change — a **Playwright MCP** check in a real browser against the mockup (CLAUDE.md rule 7). Treat those as the "tests." Do NOT invent meaningless unit tests for static markup.

**Branch:** work on `dev` (already current). Commit after each task. Push when Praveen approves (he has 2 unpushed commits + these).

**Per CLAUDE.md rule 6:** before running scaffold/Supabase commands, fetch current docs via Context7 (`mcp__context7__resolve-library-id` → `query-docs`) for `next.js` (create-next-app flags, Tailwind v4 setup) and `@supabase/ssr`. Pin versions to whatever is current; the commands below reflect Next 15 / Tailwind v4 conventions and may need minor adjustment.

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

- [ ] **Step 1:** (Context7) Fetch current `create-next-app` usage for Next.js to confirm flags and Tailwind v4 defaults.

- [ ] **Step 2:** Scaffold into a temp dir (non-interactive flags so it doesn't prompt):

```powershell
npx create-next-app@latest _scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --no-git
```

- [ ] **Step 3:** Move generated app files into the repo root, preserving our existing files. Merge `.gitignore` rather than overwriting.

```powershell
# move everything except node_modules and .gitignore up to root
Get-ChildItem -Path _scaffold -Force |
  Where-Object { $_.Name -notin @('node_modules', '.gitignore', '.git') } |
  ForEach-Object { Move-Item -Path $_.FullName -Destination . -Force }
# append the scaffold's gitignore entries to ours (Next.js entries: /.next, /node_modules, etc.)
Get-Content _scaffold/.gitignore | Add-Content .gitignore
Remove-Item _scaffold -Recurse -Force
```

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

## Task 0.3: Design tokens + fonts (the locked design system)

Encode the "Harbor Navy + Sage" palette and Fraunces/Inter fonts once, so every component consumes tokens.

**Files:** Modify `src/app/globals.css`, `src/app/layout.tsx`.

- [ ] **Step 1:** Replace `src/app/globals.css` with the Tailwind v4 import + `@theme` tokens (values lifted from `mockups/homepage.html` `:root`, lines 11–15) + base element styles (lines 16–27):

```css
@import "tailwindcss";

@theme {
  --color-cream: #F5F0E8;
  --color-surface: #FFFFFF;
  --color-navy: #1B3A6B;
  --color-ink: #1F2B3D;
  --color-muted: #566377;
  --color-sage: #7C9A7E;
  --color-green: #3F6B4E;
  --color-pill: #DDE7DE;
  --color-pilltext: #3C5A45;
  --color-line: #E7E0D2;
  --color-line2: #ECEADF;
  --color-gold: #C08A2D;

  --font-serif: var(--font-fraunces);
  --font-sans: var(--font-inter);
}

@layer base {
  body {
    background-color: var(--color-cream);
    color: var(--color-ink);
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

- [ ] **Step 2:** In `src/app/layout.tsx`, load fonts via `next/font/google` and expose them as CSS variables on `<html>`. Replace the scaffold's font setup with:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

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

- [ ] **Step 3 (verify):** Add a throwaway token check to `src/app/page.tsx` (e.g. a `<h1 className="font-serif text-navy">Token test</h1>` and a `bg-sage` box), run `npm run dev`, and use Playwright MCP to confirm Fraunces renders for the heading and the navy/sage colors are correct. Then revert the throwaway markup.

- [ ] **Step 4 (commit):**

```powershell
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: design tokens + Fraunces/Inter fonts"
```

## Task 0.4: Initialize shadcn/ui + lucide

shadcn gives us `cn()` and a consistent component base for later slices. The homepage buttons are simple styled links (Task 1.2/1.3), but we still set shadcn up now.

**Files:** Creates `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`. Modifies `package.json`.

- [ ] **Step 1:** (Context7) Confirm current shadcn CLI init command for Tailwind v4 / Next 15.

- [ ] **Step 2:** Init shadcn (choose defaults; base color neutral — our colors come from tokens):

```powershell
npx shadcn@latest init
npx shadcn@latest add button
npm install lucide-react
```

- [ ] **Step 3 (verify):**

```powershell
npm run typecheck ; npm run build
```
Expected: pass. `src/lib/utils.ts` (cn) and `src/components/ui/button.tsx` exist.

- [ ] **Step 4 (commit):**

```powershell
git add -A
git commit -m "chore: init shadcn/ui + lucide-react"
```

## Task 0.5: Wire Supabase (clients + env), no tables yet

**Files:** Creates `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `.env.local` (git-ignored), `.env.example` (committed). Modifies `package.json`.

- [ ] **Step 1:** Create a Supabase project (dashboard at supabase.com OR the Supabase MCP `create_project` — note it requires a cost confirmation). Copy the **Project URL** and **anon/publishable key**.

- [ ] **Step 2:** Install SDKs:

```powershell
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3:** Create `.env.local` (NEVER commit) with the real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

- [ ] **Step 4:** Create `.env.example` (committed, no secrets):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 5:** (Context7) Fetch current `@supabase/ssr` browser/server client patterns, then create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 6:** Create `src/lib/supabase/server.ts` using the cookie-based server client (exact cookie API per Context7 — the shape below is the @supabase/ssr pattern):

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // called from a Server Component — safe to ignore when middleware refreshes sessions
          }
        },
      },
    },
  );
}
```

- [ ] **Step 7 (verify connectivity):** Create a temporary route `src/app/health/route.ts` that calls the server client and returns `{ ok: true }` if no throw; hit `http://localhost:3000/health` with Playwright/`browser_navigate`, confirm `ok: true`, then delete the route.

- [ ] **Step 8 (verify):** `npm run typecheck ; npm run build` — pass.

- [ ] **Step 9 (commit):**

```powershell
git add src/lib/supabase .env.example package.json package-lock.json
git commit -m "feat: wire Supabase browser + server clients"
```
Confirm `git status` does NOT show `.env.local`.

## Task 0.6: Write docs/architecture/frontend.md

**Files:** Create `docs/architecture/frontend.md`.

- [ ] **Step 1:** Write a concise reference covering: folder structure (`src/app`, `src/components/site`, `src/components/ui`, `src/lib`), the design-token system (tokens in `globals.css @theme`, consumed as `text-navy`, `bg-cream`, `font-serif`, etc. — never hardcode hex in components), font setup, and the "one component per homepage section" convention. Keep under ~80 lines. State that `database.md` and `backend.md` will be added in Slice 2/3.

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

- [ ] **Step 2:** Import the repo at vercel.com (New Project → import `keyzforme`) OR `npx vercel link`. Framework auto-detects Next.js.

- [ ] **Step 3:** In Vercel Project Settings → Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`).

- [ ] **Step 4:** Deploy:

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

**Method for every section task below:** create the component file; port the markup from the cited `mockups/homepage.html` lines, converting `class=` → `className`, inline `style=` and the mockup's CSS classes → Tailwind utilities using Task 0.3 tokens (e.g. `.navy` → `text-navy`/`bg-navy`, `.muted` → `text-muted`, `--line` borders → `border-line`); keep the **exact copy**; then verify the section in a real browser against the mockup via Playwright MCP. Commit per section. Mark `this.layout` widths off the mockup `.wrap` (`max-width:1140px; padding:0 28px;`) — build a shared container utility.

## Task 1.1: Homepage shell + section skeletons

**Files:** Modify `src/app/page.tsx`.

- [ ] **Step 1:** Build `page.tsx` importing all nine section components (created in later tasks) in mockup order. Until each exists, stub missing ones inline so the file compiles. Final order:

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
  - Lead `<p className="text-[19px] text-muted my-[24px_0_32px] max-w-[90%]">`: exact copy from line 144.
  - Actions: primary "Check my readiness →" + ghost "See how it works".
  - Reassure row (line 149–153): three items each with a sage dot — "Free for buyers", "Bank-level security", "No credit impact".

- [ ] **Step 2:** `ReadinessCard` — the right-column visual (lines 49–66 styles, 155–168 markup). White card, `rounded-[20px] border border-line p-[26px]`, soft shadow `shadow-[0_24px_60px_-28px_rgba(27,58,107,0.35)]`. Contains:
  - Top row: label "Your home-readiness" + "On track" (Fraunces) on the left; the **readiness ring** on the right.
  - Ring (line 52–55): a 96px circle using a conic-gradient at 72%. Implement with an inline style since it's a one-off:
    ```tsx
    <div className="grid h-24 w-24 place-items-center rounded-full"
         style={{ background: "conic-gradient(var(--color-green) 72%, #e8eef0 0)" }}>
      <div className="grid h-[74px] w-[74px] place-items-center rounded-full bg-white text-center">
        <div><b className="font-serif text-2xl text-navy leading-none">72</b><br /><small className="text-[10px] text-muted">/ 100</small></div>
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

- [ ] **Step 1:** `footer py-[56px_0_40px] text-muted text-[14px]`. Four-column grid (`grid-cols-[1.4fr_1fr_1fr_1fr] gap-[30px]`, stacks mobile):
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
