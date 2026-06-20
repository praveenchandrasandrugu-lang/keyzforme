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
- [FAVICON] A browser picks from MULTIPLE favicon sources, and Chrome/Firefox prefer the SVG `rel="icon"` over `favicon.ico` — so when changing a favicon, regenerate ALL tab-icon files (`favicon.ico`, `icon*.svg`, `icon*.png`), not just one. Give them a non-transparent background or a dark logo vanishes in dark-mode tabs; keep `apple-icon`/maskable PWA icons as the full-color tile (the OS tiles those). Verify by rendering the served icons on a dark backdrop in Playwright, including at 16px. (Why: a navy-on-transparent logo was invisible in dark tabs, and swapping only one file wouldn't have fixed Chrome.)
- [OVERLAYS] Every floating component (date picker, dropdown/select, combobox, popover, tooltip, menu) MUST render in a **portal** (Base UI/Radix do this by default — keep it) so it escapes ancestor `overflow:hidden/auto` clipping and stacking contexts. Use the lib's built-in **collision-aware positioning** (flip/shift) so it never opens off-screen, and give overlays a consistent high `z-index` layer. (Why: on the previous project date pickers/dropdowns rendered *under* parents and got cut off / opened where you couldn't see or pick a date.)
- [OVERLAYS] Don't add `overflow-hidden`/`overflow-auto` to a container that holds an overlay trigger unless necessary; if a scroll container is required, confirm the overlay still portals out and stays visible. (Why: an `overflow` ancestor is the #1 cause of clipped popovers.)
- [OVERLAYS] Verify EVERY date picker/dropdown in a real browser (Playwright) at the hard spots: near the viewport bottom/right edge, inside a table cell, and inside a scroll area — confirm it's fully visible and the date/option is clickable. (Why: these only break at edges/scroll, never in the happy-path middle.)

## Tooling (this Windows setup)

- [TOOLING] The brainstorming **visual-companion server dies between turns** here (owner-PID watchdog + background-process reaping). Don't rely on it — instead write **standalone HTML mockups** to `mockups/` and have the user open them via `file:///W:/Keyzforme/mockups/<file>.html`. (Why: the live server got reaped every turn; static files just work.)
- [TOOLING] **Playwright MCP blocks the `file://` protocol.** To screenshot a local HTML file for verification, serve the folder first (`python -m http.server <port> --bind 127.0.0.1`) and navigate to `http://127.0.0.1:<port>/<file>.html`. (Why: direct file:// navigation errors out.)
- [TOOLING] Webfonts (Google Fonts `<link>`) DO load in Playwright screenshots — wait ~2s after navigate before capturing so the font swaps in. (Why: first paint shows fallback fonts.)
- [TOOLING] Use the **PowerShell tool** for PowerShell syntax (`Get-Content`, `Measure-Object`, `.Lines`, `$env:`); the **Bash tool** runs POSIX sh and errors on cmdlets. Don't mix them. (Why: a `(Get-Content …).Lines` call failed in the Bash tool this session.)
- [TOOLING] Installing third-party skills via `npx skills add` is blocked by the auto-permission classifier (external code) — have the user run it themselves with `! npx skills add <owner/repo@skill> -g -y`. Also: the sub-skill name must match the repo exactly (the CLI lists valid names if wrong). (Why: install of `vercel-react-best-practices` was denied to me, and an early name guess didn't match.)
- [TOOLING] Widen the permission allowlist via the **`/update-config`** skill (read → merge → validate), NOT by directly writing `settings.local.json` — the auto-classifier blocks the agent silently broadening its own permissions. (Why: a direct Write of a new settings file with `Bash(git:*)` etc. was denied this session; `/update-config` with explicit user intent succeeded.)

---

## Planning & scaffolding (2026-06-19)

- [PLAN] Verify a plan against CURRENT docs (parallel reviewer subagents + Context7) BEFORE executing it — it caught that `create-next-app@latest` now installs **Next.js 16, not 15**, plus a Tailwind-v4 font bug. (Why: a plan written from memory bakes in version-stale assumptions that break on the first command.)
- [SCAFFOLD] `create-next-app` refuses a non-empty dir: scaffold into a temp folder, then move files to root with `Move-Item -LiteralPath ... -Destination $root` (a bare `-Destination .` is unreliable for dirs on Windows). Pass `--yes --disable-git --no-agents-md` (the last protects an existing `CLAUDE.md`/`AGENTS.md` from being overwritten). (Why: missing `--yes` hangs on Next 16 prompts; `--no-turbopack`/`--no-git` are wrong flags.)
- [TAILWIND] Tailwind v4: define `--color-*` in plain `@theme` (emits `bg-*`/`text-*`), but any token that references another var (fonts → next/font vars) MUST go in `@theme inline` or the utility won't resolve. (Why: plain `@theme` flattens the value and breaks the next/font variable chain.)
- [SHADCN] `shadcn init` REWRITES `globals.css` — run it BEFORE authoring final tokens, then layer tokens on top. Its `-d` default is `base-nova`/Base UI (`@base-ui/react`), not Radix. We chose Base UI deliberately; port Radix snippets (`asChild` → `render` prop). (Why: init clobbered hand-written CSS; the foundation lib changes which imports work.)
- [TOKENS] Don't name a brand primitive `--color-muted` — it collides with shadcn's semantic `--muted` and silently corrupts the theme. Use a distinct name (`--color-brandmuted`). (Why: same utility name, last definition wins.)
- [SUPABASE] Current key is the **publishable** key (`sb_publishable_…`, env `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), not the legacy `anon` key. A connectivity health check must do a real round-trip (`await supabase.auth.getClaims()`) — constructing the client throws nothing. (Why: legacy naming is silent tech debt; a no-op check proves nothing.)
- [SUBAGENT] When dispatching an implementer, specify which files go in which commit explicitly — a literal `git add fileA fileB` put `package.json` in the wrong commit, leaving an earlier commit non-buildable. (Why: cosmetic but violates "every commit builds".)

## Homepage build (2026-06-19)

- [RESPONSIVE] Test the responsive nav at the **in-between widths (~800–1000px)**, not just the named breakpoints — switching mobile→desktop nav at `md` (768px) crammed 4 links + 2 buttons until ~1024px. Switch at `lg` and add `whitespace-nowrap` to labels. (Why: a 768/1280 sweep passed but the tablet zone wrapped and crowded; the user caught it.)
- [COPY] For a mockup port, copy must be **verbatim** — a subagent rewrote the Marketplace lead + bullets in its own words. Spec review MUST diff rendered text against the source line-by-line. (Why: copy fidelity matters on a client site, and "reasonable substitute" copy reads as done but isn't.)
- [RESPONSIVE] The approved mockup is **desktop-only** — mobile treatments (hamburger nav, reduced hero top-padding) are unspecified and must be DESIGNED, not ported. Make desktop-mockup paddings responsive (`pt-10 md:pt-[var(--nav-h)]`). (Why: porting 72px hero top-padding straight to mobile left a ~144px gap above the fold; the user flagged it twice.)
- [A11Y] **Accessibility overrides mockup fidelity.** The mockup used sage for small eyebrow text (~2.8:1, fails AA) — use `text-green` for small text per the brand rule (sage = decoration/large only). The gold "wait" status `#C08A2D` is ~3:1, borderline at 14px — flag locked brand colors that fail AA at text size rather than silently shipping them. (Why: a concept mockup's decorative colors aren't all AA at text size.)
- [A11Y] Give every interactive element a visible `focus-visible` ring (the global `outline-ring/50` was invisible on navy buttons) and `aria-hidden` on decorative lucide icons. (Why: keyboard users need visible focus; lucide SVGs otherwise get announced.)
- [RESPONSIVE] For a multi-section footer, default to `grid-cols-1` and add columns at `sm`/`md` — don't make `grid-cols-2` the mobile base. (Why: on a phone, `grid-cols-2` put the PRODUCT/COMPANY columns to the *right* instead of left-aligned under the logo; the user flagged it. Verified the fix at 390px in Playwright.)
- [CACHE] When a deployed asset "won't update" (esp. favicons), prove the fix is live by checking the **served bytes/pixels** from production (e.g. fetch + draw to canvas + read RGB), not by staring at the browser — then treat any remaining staleness as a browser cache problem, not a re-deploy. (Why: the favicon was correct on prod the whole time; the browser's separate favicon cache ignored hard-refresh AND incognito.)

## Deploy / Vercel (2026-06-19)

- [VERCEL] For a monorepo, set the project **Root Directory = `web`** in the Vercel import (or it builds from the repo root, finds no `package.json`, and fails). (Why: Vercel defaults to the git root.)
- [VERCEL] New projects enable **Deployment Protection → "Require Log In"**, which puts a Vercel login wall on the site — anyone you share it with is blocked. For a public marketing page, turn it **OFF** (Settings → Deployment Protection) and **Save**. (Why: the deploy succeeded but the URL redirected everyone to a Vercel login.)
- [VERCEL] Share the **hash-less production alias** (`keyzforme-….vercel.app`), NOT the **deployment-specific URL** (`keyzforme-<hash>-….vercel.app`). Deployment-hash URLs stay protected even after "Require Log In" is off; only the clean production/preview alias goes public. (Why: both looked similar; the hash one kept showing the login wall.)
- [VERCEL] `vercel` is only a bare command if installed globally. With `npx`, it's **`npx vercel …`** (a bare `vercel link` errors "not recognized"). Login (`npx vercel login`) is saved globally, so once the user logs in, agent-run `npx vercel` calls are authenticated too.

## Backend (FastAPI) foundation (2026-06-19)

- [ALEMBIC] Feed the DB URL into Alembic **directly from `app.config`** (build the engine with `create_async_engine` in `env.py`); do NOT route it through `alembic.ini`/`set_main_option`. `configparser` treats `%` as interpolation syntax, so a percent-encoded password (`%23` for `#`) crashes with "invalid interpolation syntax". (Why: it blew up `alembic upgrade` until we bypassed configparser.)
- [RAILWAY] Railway uses **Railpack** now (not Nixpacks) and natively supports `uv` (detects `uv.lock`, runs `uv sync`, honors `.python-version`). It auto-guesses the FastAPI start as `uvicorn main:app` — you MUST override to `uvicorn app.main:app --host 0.0.0.0 --port $PORT` for a flat `app/` package, or it fails to boot. Set Root Directory=`api` for the monorepo. (Why: the plan said `NIXPACKS` + the wrong module path.)
- [ENV] Rotating a DB password means updating it **everywhere it's stored** — local `.env` AND every deploy target's env vars (Railway). A stale deploy var fails DB auth while `/health` still passes (engine is lazy), so the break hides until `/health/db`. (Why: changing the Supabase password left Railway's `DATABASE_URL` stale.)
- [HOOK] The `check-tokens` allowlist must include the **theme-definition file** (`web/src/app/globals.css`), not just `components/site/` — that file legitimately defines the brand hex (`--color-navy: #1B3A6B`). Run the check standalone against existing code before wiring it. (Why: the plan's allowlist would have blocked every future commit.)
- [MYPY] Don't add a speculative `# type: ignore` — strict mypy's `warn_unused_ignores` fails the gate on an unused one. The pydantic mypy plugin already knows `Settings()` reads required fields from env. (Why: a planned `type: ignore[call-arg]` broke `mypy`.)
- [UV] Scaffold a service with `uv init --app` (flat `app/` layout), not `--package` (a `src/` library layout you'd delete, leaving build config pointing at nothing). Add `pythonpath = ["."]` to `[tool.pytest.ini_options]` so tests can `import app`. (Why: matches the official uv-FastAPI guide and keeps zero leftover config.)
- [ALEMBIC] Alembic's generated migration template always imports `op`/`sa` and uses old `Union` typing — modernize `script.py.mako` (use `str | None`, sorted imports) and add a ruff per-file-ignore for `F401` in `migrations/versions/*` so generated migrations pass the lint gate. (Why: ruff `F401`/`UP` flagged every generated migration.)

## PROD promotion (2026-06-19)

- [VERCEL] The Vercel **MCP has NO env-var tool** (only deployments/projects/logs/domains/docs). To set env vars, use the **CLI** (`vercel env add/ls/rm`) or the dashboard. (Why: searched the whole MCP toolset looking for one — it isn't there.)
- [VERCEL] `vercel env add --force` (overwrite) **hangs** in non-interactive agent shells even with `--yes`/`--value`. The plain **`"value" | vercel env add NAME <env>`** (stdin) form works first-try. Set different values per environment by adding the SAME key 3× (production/preview/development). (Why: two `--force` runs hung and had to be killed; stdin adds were instant.)
- [VERCEL] For `NEXT_PUBLIC_*` URLs the CLI may auto-mark production/preview **Sensitive** — pointless (they still inline at build) and it blocks reading the value back. Pass `--no-sensitive`, or just flip the toggle in the dashboard. (Why: ended with a mixed sensitive/non-sensitive state.)
- [VERCEL] The dashboard env dropdown only offers environments the key **isn't already using** — if it shows just one, a prior save grabbed the others. `vercel env ls` is the source of truth (the dashboard had glitched to zero saved). (Why: the per-env dropdown looked broken; it was stale state.)
- [SUPABASE] `SUPABASE_URL` (for JWKS/auth) is the **base** `https://<ref>.supabase.co` — strip the `/rest/v1/` suffix the dashboard's API-URL field shows. Convert the **Session pooler (5432)** URI scheme to `postgresql+asyncpg://` for SQLAlchemy. (Why: the dashboard hands you the REST URL and a `postgresql://` URI; both need fixing.)
- [SUPABASE] The connected Supabase **MCP can be a different account** than the project's — here it only saw the HR project, not Keyz's. Provision/manage Keyz Supabase in the dashboard, not via MCP. (Why: `list_projects` didn't show either Keyz project.)
- [RAILWAY] "Generate Domain" asks for **the internal port your app listens on** — enter **8080** (Railway's detected port behind the `$PORT` binding), not 80/443. (Why: the prefill is 8080 and that's what the uvicorn container serves.)

_Newest project-specific lessons go below as we build._
