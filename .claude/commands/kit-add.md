# Kit Add

Fold a reusable learning from THIS project back into the shared starter kit at
`W:\project-starter-kit` (the single source of truth), so every future project inherits it.

## When to use
Right after you discover something that would help ANY project — a lesson, a slash command, a
convention, a quality gate, or a doc improvement. Run `/kit-add <what>` or just say "add this to the kit."

## Instructions
1. **Identify the item** and its kind: lesson · command · convention · quality-gate · doc/explainer.
2. **Sanity-check it's universal**, not project-specific. If it's tied to this project's stack or
   domain, say so and keep it local instead (don't pollute the kit). If unsure, ask.
3. **Generalize it** — strip project names and stack specifics so it reads cleanly for any project.
4. **Apply to the kit** at `W:\project-starter-kit`:
   - lesson → a line in `LESSONS.md` (right section)
   - command → `.claude/commands/<name>.md`
   - convention → `docs/CONVENTIONS.md`
   - quality gate → `docs/QUALITY-GATES.md`
   - doc/explainer → the right file under `docs/` (and link it from `README.md` + `Home.md`)
   - Don't duplicate — if it refines an existing entry, edit that line instead.
5. **Log it** in the kit's `CHANGELOG.md` (dated, one line, name the source project).
6. **Commit + push** in the kit repo (it has a private GitHub remote — `git push`).
7. **Offer to backport** to other live projects (e.g. Keyz, OffTheLoop) that would benefit now.
8. Confirm in one line: what was added, where, and the kit commit hash.

## Rules
- The kit is the SINGLE SOURCE OF TRUTH. Improve it there first, then backport — never the reverse.
- Keep entries short and generalized. Specific-and-actionable beats long.
- Never copy secrets, project data, or domain-specific content into the kit.
