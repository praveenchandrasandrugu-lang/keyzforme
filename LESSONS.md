# Lessons

Mistakes turned into rules. **Read this before starting work. Add to it whenever something
bites us.** Over time this is what makes the AI (and you) stop repeating mistakes — it's a
project that gets better the more you build.

## How to use this file

- **When a bug, wrong assumption, or correction happens:** add a one-line rule here (or run `/lesson`).
- **Format:** `- [AREA] The rule, stated as a do/don't. (Why: what went wrong.)`
- **Keep each lesson to one or two lines.** Specific and actionable beats long.
- **If a lesson is mechanical and must ALWAYS happen** (formatting, linting), promote it to a
  hook in `.claude/settings.local.json` — hooks run 100% of the time; this file is advisory.
- Delete a lesson if it turns out to be wrong. This file should stay true, not just grow.

---

## Workflow & verification

- [VERIFY] Never say "done" or "fixed" without running the real thing (build / test / open the page) and reading the output. (Why: AI often declares partial work complete.)
- [VERIFY] Static reading of code is not proof it works — run it. A real run has caught bugs that "looked correct." (Why: browsers, data, and config behave differently than they read.)
- [SCOPE] Build the smallest change that works; prefer deleting lines over adding them. (Why: less code = fewer bugs.)
- [GIT] Commit small and often with clear messages; never force-push or delete without asking. (Why: easy to undo, easy to review.)

## TypeScript & code quality

- [TYPES] Keep `strict` on and never use `any` to silence an error — fix the actual type. (Why: `any` hides real bugs until runtime.)
- [BUILD] Never ignore build/type errors to "deal with later." Fix them now. (Why: they compound and break deploys.)

## Libraries & APIs

- [DOCS] Before coding against any library, fetch current docs via Context7 MCP — don't trust remembered API signatures. (Why: APIs change; memory is often a version behind.)

## Next.js specifics (confirm against current docs)

- [NEXTJS] `params` and `searchParams` in pages are now Promises — `await` them. (Why: changed in Next.js 15/16; old object access breaks.)
- [NEXTJS] Default to Server Components. Only add `"use client"` when a component needs interactivity (state, events). (Why: less client JS = faster, fewer hydration bugs.)
- [NEXTJS] Set an explicit caching/revalidation strategy on data you fetch; Next caches aggressively by default and can show stale data. (Why: silent staleness is a classic gotcha.)
- [NEXTJS] Validate any form/Server Action input (e.g., with Zod) and return typed errors. (Why: never trust client input.)

## Config & environment

- [ENV] New environment variables often need a rebuild/redeploy to take effect — changing the value alone may do nothing. (Why: build-time vars are baked in at build; learned the hard way on the HR project.)
- [ENV] Never commit secrets; keep them in `.env.local` (git-ignored) and document the names (not values) in the README. (Why: leaked keys are hard to undo.)

## UI

- [UI] Test responsive/mobile layout in a real browser, not just by reading the JSX. (Why: layout bugs only show when rendered.)
- [UI] Verify visual/interactive changes with Playwright MCP against the running app, not by reading code. (Why: this proven habit caught real bugs static review missed on the previous project.)
- [UI] Prefer one shared component over duplicating markup — change once, changes everywhere. (Why: duplication drifts out of sync.)
- [OVERLAYS] Every floating component (date picker, dropdown/select, combobox, popover, tooltip, menu) MUST render in a **portal** (Base UI/Radix do this by default — keep it) so it escapes ancestor `overflow:hidden/auto` clipping and stacking contexts. Use the lib's built-in **collision-aware positioning** (flip/shift) so it never opens off-screen, and give overlays a consistent high `z-index` layer. (Why: on the previous project date pickers/dropdowns rendered *under* parents and got cut off / opened where you couldn't see or pick a date.)
- [OVERLAYS] Don't add `overflow-hidden`/`overflow-auto` to a container that holds an overlay trigger unless necessary; if a scroll container is required, confirm the overlay still portals out and stays visible. (Why: an `overflow` ancestor is the #1 cause of clipped popovers.)
- [OVERLAYS] Verify EVERY date picker/dropdown in a real browser (Playwright) at the hard spots: near the viewport bottom/right edge, inside a table cell, and inside a scroll area — confirm it's fully visible and the date/option is clickable. (Why: these only break at edges/scroll, never in the happy-path middle.)

## Tooling (this Windows setup)

- [TOOLING] The brainstorming **visual-companion server dies between turns** here (owner-PID watchdog + background-process reaping). Don't rely on it — instead write **standalone HTML mockups** to `mockups/` and have the user open them via `file:///W:/Keyzforme/mockups/<file>.html`. (Why: the live server got reaped every turn; static files just work.)
- [TOOLING] **Playwright MCP blocks the `file://` protocol.** To screenshot a local HTML file for verification, serve the folder first (`python -m http.server <port> --bind 127.0.0.1`) and navigate to `http://127.0.0.1:<port>/<file>.html`. (Why: direct file:// navigation errors out.)
- [TOOLING] Webfonts (Google Fonts `<link>`) DO load in Playwright screenshots — wait ~2s after navigate before capturing so the font swaps in. (Why: first paint shows fallback fonts.)
- [TOOLING] Use the **PowerShell tool** for PowerShell syntax (`Get-Content`, `Measure-Object`, `.Lines`, `$env:`); the **Bash tool** runs POSIX sh and errors on cmdlets. Don't mix them. (Why: a `(Get-Content …).Lines` call failed in the Bash tool this session.)
- [TOOLING] Installing third-party skills via `npx skills add` is blocked by the auto-permission classifier (external code) — have the user run it themselves with `! npx skills add <owner/repo@skill> -g -y`. Also: the sub-skill name must match the repo exactly (the CLI lists valid names if wrong). (Why: install of `vercel-react-best-practices` was denied to me, and an early name guess didn't match.)

---

## Planning & scaffolding (2026-06-19)

- [PLAN] Verify a plan against CURRENT docs (parallel reviewer subagents + Context7) BEFORE executing it — it caught that `create-next-app@latest` now installs **Next.js 16, not 15**, plus a Tailwind-v4 font bug. (Why: a plan written from memory bakes in version-stale assumptions that break on the first command.)
- [SCAFFOLD] `create-next-app` refuses a non-empty dir: scaffold into a temp folder, then move files to root with `Move-Item -LiteralPath ... -Destination $root` (a bare `-Destination .` is unreliable for dirs on Windows). Pass `--yes --disable-git --no-agents-md` (the last protects an existing `CLAUDE.md`/`AGENTS.md` from being overwritten). (Why: missing `--yes` hangs on Next 16 prompts; `--no-turbopack`/`--no-git` are wrong flags.)
- [TAILWIND] Tailwind v4: define `--color-*` in plain `@theme` (emits `bg-*`/`text-*`), but any token that references another var (fonts → next/font vars) MUST go in `@theme inline` or the utility won't resolve. (Why: plain `@theme` flattens the value and breaks the next/font variable chain.)
- [SHADCN] `shadcn init` REWRITES `globals.css` — run it BEFORE authoring final tokens, then layer tokens on top. Its `-d` default is `base-nova`/Base UI (`@base-ui/react`), not Radix. We chose Base UI deliberately; port Radix snippets (`asChild` → `render` prop). (Why: init clobbered hand-written CSS; the foundation lib changes which imports work.)
- [TOKENS] Don't name a brand primitive `--color-muted` — it collides with shadcn's semantic `--muted` and silently corrupts the theme. Use a distinct name (`--color-brandmuted`). (Why: same utility name, last definition wins.)
- [SUPABASE] Current key is the **publishable** key (`sb_publishable_…`, env `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), not the legacy `anon` key. A connectivity health check must do a real round-trip (`await supabase.auth.getClaims()`) — constructing the client throws nothing. (Why: legacy naming is silent tech debt; a no-op check proves nothing.)
- [SUBAGENT] When dispatching an implementer, specify which files go in which commit explicitly — a literal `git add fileA fileB` put `package.json` in the wrong commit, leaving an earlier commit non-buildable. (Why: cosmetic but violates "every commit builds".)

_Newest project-specific lessons go below as we build._
