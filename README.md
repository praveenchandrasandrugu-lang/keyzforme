# Keyzforme

Website for **Keyz** (keyzforme.com), co-founded by **Shawn Higginbotham** — a rebuild of their current site.

## Status

Setup / scoping. No app code yet. **First task: write `docs/PRD.md`** (goal, audience, pages,
content, style), then scaffold the Next.js app.

## How this repo works

- **`CLAUDE.md`** — instructions for Claude Code (read first).
- **`LESSONS.md`** — rules earned from real mistakes; read before working, add to it when something breaks.
- **`docs/CONVENTIONS.md`** — how we build and why (current best practices, beginner-friendly).
- **`docs/PRD.md`** — what we're building (write this before code).
- **`docs/learning/`** — plain-English notes on concepts, grown as we build.
- **`.claude/commands/`** — custom slash commands (`/start-session`, `/save-progress`, `/check`,
  `/quick-test`, `/learn`, `/lesson`, `/braindump`, `/fresh`).

## Getting started in a new session

Open Claude Code in this folder and type `/start-session`.

## Environment

Secrets go in `.env.local` (git-ignored). Document variable **names** here when they exist —
never commit values.
