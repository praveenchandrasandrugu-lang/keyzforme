# Start Session

Resume work. Get oriented before doing anything.

## 1. Load context
- Read `CLAUDE.md`, `LESSONS.md`, and (if present) `docs/PRD.md`.
- Read ALL files in the auto-memory directory (MEMORY.md and any topic files), if it exists.
- Note any "Next Session" / "Current Status" notes.

## 2. Check project state
- `git status` and `git log --oneline -5` — branch, uncommitted changes, recent work.
- If a `dev` branch exists, confirm we're on it (not `main`) for development.
- If a GitHub remote exists: `gh issue list --state open --limit 10` and `gh run list --limit 1`.
  (Detect the repo with `gh repo view --json nameWithOwner -q .nameWithOwner`. Skip silently if no remote.)

## 3. Reminder
- If `CLAUDE.md` still has `[COMPANY NAME]` / `[PROFESSOR NAME]` placeholders or `docs/PRD.md`
  is missing, note that writing the PRD is the first task. Offer to use the `deep-research`
  skill to research the company, the founder, and competitor/peer sites to inform it.

## 4. Summarize
A short, welcoming status report:
- **Branch** / uncommitted changes
- **Last session**: what was done (from memory)
- **Open issues**: count + any priority item
- **Ready to work on**: suggested next step

Keep it concise. The user is ~1 month into building real apps — be clear and encouraging.
