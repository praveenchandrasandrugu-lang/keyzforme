# Braindump

Turn raw, messy notes into organized actions. The user pastes whatever's in their head —
questions, bugs, ideas, reminders, fragments. This makes sense of it.

**Usage**: `/braindump` then paste the notes. Any format. Any mess.

## 1. Load context
- Read MEMORY.md (state, next-session notes) and `docs/PRD.md` if present.
- If a GitHub remote exists, fetch open issues for dedup/linking
  (`gh issue list --state open --limit 50 --json number,title,labels`).

## 2. Read intent, not keywords
A line without a "?" can still be a question; "nav weird on phone" is a bug. Interpret meaning.
Sort each item into ONE of:

- **URGENT** — blocking/broken now (tone, caps, frustration).
- **QUESTIONS** — wants to understand → answered inline, one at a time.
- **BUGS / NEW ISSUES** — broken/missing, not already tracked.
- **UPDATES TO EXISTING ISSUES** — relates to something already open (be generous here).
- **IDEAS** — "what if" — listed for discussion, not auto-committed.
- **REMINDERS** — to-dos → saved to MEMORY.md "Next Session".
- **DECISIONS** — a made-up-mind rule → saved to MEMORY.md (or PRD).
- **LEARNING** — a concept to study → explain + log via `/learn`.
- **LESSON** — a mistake to avoid repeating → log via `/lesson`.

## 3. Show the categorized summary BEFORE acting
List everything grouped, numbered. Let the user move items between categories or skip some.

## 4. Execute (after confirmation)
- **NEVER create GitHub issues without confirmation.** Questions, reminders, learning, and
  lessons are safe to do without asking.
- Answer questions one at a time (plain language — the user is ~1 month in).
- Create/comment issues only if a GitHub remote exists; otherwise save them to a
  "Backlog" section in MEMORY.md.
- Date-stamp anything written to memory or issues.

## 5. Receipt
Compact summary of what happened (answered N, created issues #.., saved N reminders, logged ...).
