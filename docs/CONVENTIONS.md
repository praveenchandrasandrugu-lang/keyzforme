# Conventions & Best Practices

Plain-English guide to how we build, why, and what "good" looks like in 2026. Written for
someone ~1 month into building real apps. Skim it once; come back when unsure.

> Sources at the bottom. These reflect current (mid-2026) Next.js/React and Claude Code guidance.

---

## 1. The mindset that prevents bugs

The single biggest quality lever is **verifying against something real** instead of trusting
that code "should work." Every change gets checked by running it — the build, a test, or the
actual page in a browser. AI assistants (and people) often think a task is done when it's only
half done, so we always look at the real result before moving on.

Three habits that follow from this:

1. **Small steps.** Make the smallest change that works. If you can delete code instead of
   adding it, do that. Less code = fewer places for bugs to hide.
2. **One concrete check per change.** Did the build pass? Did the page render? Did the test go
   green? If you can't point to a check, you're guessing.
3. **Write down what bit you.** When something breaks, add a line to `LESSONS.md`. That's how
   the project stops repeating mistakes.

## 2. Workflow (the loop)

For anything bigger than a typo:

```
Brainstorm  →  Plan  →  Build (small steps)  →  Verify  →  Review  →  Log lessons
```

- **Brainstorm**: agree on what and why before writing code.
- **Plan**: for multi-step work, write the steps first. A 5-line plan saves hours.
- **Build**: smallest working change.
- **Verify**: `npm run build`, lint, typecheck, tests, or open the page.
- **Review**: read the diff before committing/merging.
- **Log**: update `LESSONS.md` and (via `/save-progress`) the memory.

Start a **fresh session** for each major feature or distinct bug — long sessions drift.

## 3. TypeScript

- **`strict: true`. No `any`.** If you reach for `any`, you've hidden a bug, not fixed one.
  Use real types or `unknown` + a check.
- **Don't ignore build/type errors.** Fix them when they appear; they compound.
- Turn on **typed routes** in Next.js so links and navigation are type-checked.

## 4. Next.js (App Router)

- **Server Components by default.** Only add `"use client"` when a component needs
  interactivity (clicks, state, effects). Less client JavaScript = faster and fewer bugs.
- **`params` / `searchParams` are Promises** in Next 15/16 — `await` them.
- **Caching is aggressive by default.** For any data that must be fresh, set an explicit
  `revalidate` value or `cache: 'no-store'`. Silent stale data is a top gotcha.
- **Validate input** to forms and Server Actions (e.g., with Zod). Never trust client input.
- **Pre-render known pages** (`generateStaticParams`) for things like blog posts — faster and
  cheaper.
- Wrap each async data dependency in its own **`<Suspense>`** so the page streams in.

## 5. Styling (Tailwind + shadcn/ui)

- Use **shared components** over copy-pasting markup. Change once, changes everywhere.
- Keep spacing/colors/typography consistent — pull from a small set of tokens, not random values.
- Check **mobile and desktop** in a real browser. Layout bugs only appear when rendered.

## 6. Git

- **Small commits, one logical change each**, with a clear message
  (`feat: add hero section`, `fix: mobile nav overlap`).
- Work on a branch; open a PR; let preview deploys show the change before merging to `main`.
- Use `git revert` to undo a commit (don't hand-edit history).
- **Never commit secrets.** `.env.local` is git-ignored; document variable *names* in the README.

## 7. Make the must-always things automatic (hooks)

`CLAUDE.md` and this file are **advisory** — followed most of the time, not always. For rules
that must run **every time** (format, lint, typecheck before "done"), use a **hook** in
`.claude/settings.local.json`. Hooks are deterministic. Add these once the project has a
`package.json`:

```jsonc
// example — enable after the Next.js app exists
"hooks": {
  "Stop": [
    { "matcher": "", "hooks": [
      { "type": "command", "command": "npm run lint && npx tsc --noEmit" }
    ]}
  ]
}
```

## 8. Accessibility & performance (baseline)

- Real `<button>`/`<a>` for actions/links; every input has a label; images have `alt` text.
- Use Next.js `<Image>` for images; keep the bundle small by avoiding heavy client libraries.
- Aim for good Lighthouse scores — a marketing site should load fast.

---

## Sources

- [Next.js App Router Best Practices for Production (2026) — ZTABS](https://ztabs.co/blog/nextjs-app-router-best-practices)
- [Next.js 16 App Router: The Complete Guide for 2026 — Craftly](https://getcraftly.dev/blog/nextjs-16-app-router-guide)
- [App Router Guides — Next.js official docs](https://nextjs.org/docs/app/guides)
- [Best practices for Claude Code — Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Designing CLAUDE.md right: the 2026 architecture — obviousworks](https://www.obviousworks.ch/en/designing-claude-md-right-the-2026-architecture-that-finally-makes-claude-code-work/)
- [50 Claude Code Tips and Best Practices — Builder.io](https://www.builder.io/blog/claude-code-tips-best-practices)
