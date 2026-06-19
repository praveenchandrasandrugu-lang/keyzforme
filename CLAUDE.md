# Keyzforme

> Website for **Keyz** (keyzforme.com) — a home-ownership startup co-founded by **Shawn Higginbotham**
> (Praveen's former M.S. "Databases & Data Warehouses" professor). Rebuild of their current GoDaddy template site.
> _Keep this file under ~100 lines._

## What this is

A new, better website to replace the founder's current site. Goal, audience, and pages
are defined in `docs/PRD.md` (write this first, before any code).

## Stack (proposed — confirm during scoping)

- **Framework**: Next.js (App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel (preview deploy on every push)
- **Content**: start with static content; add a CMS only if the founder needs to self-edit

Chosen because it matches what you already know from the HR project, so your learning carries over.

## How we build (the workflow that keeps it bug-free)

Follow this loop for every feature or fix. It is the single biggest lever on quality.

1. **Brainstorm** the idea before coding — agree on what we're building and why.
2. **Plan** — write the steps down for anything non-trivial.
3. **Build in small steps** — smallest change that works. Prefer deleting code over adding.
4. **Verify against something concrete** — run the app / tests / typecheck. Do NOT trust
   "it should work." Claude can declare a task done when it's only half done — always
   look at the real result.
5. **Review** before merging. Then write down anything that bit us in `LESSONS.md`.

The superpowers skills (`brainstorming`, `writing-plans`, `test-driven-development`,
`systematic-debugging`, `verification-before-completion`, `requesting-code-review`) encode
this loop — use them.

## Hard rules

1. **TypeScript strict, no `any`, don't ignore build errors.** Fix types, don't silence them.
2. **Verify before claiming done.** Run `npm run build` / lint / tests and read the output.
3. **Small commits, clear messages.** One logical change per commit.
4. **Never commit secrets.** Use `.env.local` (git-ignored) for keys.
5. **Read `LESSONS.md` at the start of work, and add to it whenever a mistake is found.**
6. **Use Context7 MCP** to fetch current docs before coding against any library (don't trust memory for API signatures).
7. **Verify pages in a real browser** via Playwright MCP for any visual or interactive change — don't trust that JSX "looks right." This is a website; how it renders is the whole point.
8. **Ask before destructive actions** (deleting files, force-push, overwriting).

## Conventions

Full, current, beginner-friendly conventions live in `docs/CONVENTIONS.md`. Read it once;
it explains the *why*, not just the *what*. **Enforced** quality gates (pre-commit hooks, CI,
security/performance/reliability checklists) live in `docs/QUALITY-GATES.md` — wiring the husky
pre-commit hook is a foundation task you can do now. `docs/SOFTWARE-FOUNDATIONS.md` is the
plain-English *why* behind the 8 pillars of solid software.

## Design & frontend skills (this is a website — use them)

Because the whole product is a polished, public-facing site, lean on the design skills, not
just the process ones:

- **`frontend-design`** / **`impeccable`** — build distinctive, production-grade UI that avoids
  generic AI aesthetics; use for pages, sections, components, and visual polish.
- **`ui-ux-pro-max`** — styles, color palettes, font pairings, layout/spacing guidance.
- **`web-design-guidelines`** — review UI for accessibility and web best-practice compliance.
- **`vercel-react-best-practices`** — performance patterns when writing/refactoring React/Next.js.
- **`deep-research`** — during scoping, research the company, the founder, and competitor/peer
  sites to inform the PRD and design direction (cited, fact-checked).

Reach for these the same way you reach for `brainstorming` and `test-driven-development`.

## Learn-from-mistakes system

- `LESSONS.md` — durable rules earned from real mistakes. Grows over time; never repeat a logged mistake.
- Auto-memory (`MEMORY.md` + topic files) — session-to-session state, handled by `/save-progress`.
- `docs/learning/` — plain-English notes on concepts you learn as we build (via `/learn`).

## Custom commands (in `.claude/commands/`)

- `/start-session` — load memory + lessons, show project state, suggest next step
- `/save-progress` and `/fresh` — checkpoint before ending or restarting a session
- `/check` — quick status glance (branch, commits, CI)
- `/quick-test` — run lint + typecheck + build in one shot (your local verification)
- `/learn` — log a concept you just learned to `docs/learning/`
- `/lesson` — record a mistake-turned-rule into `LESSONS.md`
- `/braindump` — turn messy notes into organized actions
