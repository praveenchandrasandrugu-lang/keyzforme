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

## Tooling (this Windows setup)

- [TOOLING] The brainstorming **visual-companion server dies between turns** here (owner-PID watchdog + background-process reaping). Don't rely on it — instead write **standalone HTML mockups** to `mockups/` and have the user open them via `file:///W:/Keyzforme/mockups/<file>.html`. (Why: the live server got reaped every turn; static files just work.)
- [TOOLING] **Playwright MCP blocks the `file://` protocol.** To screenshot a local HTML file for verification, serve the folder first (`python -m http.server <port> --bind 127.0.0.1`) and navigate to `http://127.0.0.1:<port>/<file>.html`. (Why: direct file:// navigation errors out.)
- [TOOLING] Webfonts (Google Fonts `<link>`) DO load in Playwright screenshots — wait ~2s after navigate before capturing so the font swaps in. (Why: first paint shows fallback fonts.)
- [TOOLING] Use the **PowerShell tool** for PowerShell syntax (`Get-Content`, `Measure-Object`, `.Lines`, `$env:`); the **Bash tool** runs POSIX sh and errors on cmdlets. Don't mix them. (Why: a `(Get-Content …).Lines` call failed in the Bash tool this session.)
- [TOOLING] Installing third-party skills via `npx skills add` is blocked by the auto-permission classifier (external code) — have the user run it themselves with `! npx skills add <owner/repo@skill> -g -y`. Also: the sub-skill name must match the repo exactly (the CLI lists valid names if wrong). (Why: install of `vercel-react-best-practices` was denied to me, and an early name guess didn't match.)

---

_Newest project-specific lessons go below as we build._
