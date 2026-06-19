# Lesson

Record a mistake-turned-rule into `LESSONS.md` so it never happens again.

## When to use
- Right after a bug, a wrong assumption, a failed build, or any "oops — don't do that again."
- Either the user invokes `/lesson` with the mistake, or you proactively suggest one after a fix.

## Instructions
1. Read `LESSONS.md` so you don't duplicate an existing rule.
2. Distill the mistake into ONE actionable line:
   ```
   - [AREA] Do/don't, stated clearly. (Why: what went wrong.)
   ```
   `AREA` is a short tag like VERIFY, TYPES, NEXTJS, GIT, ENV, UI, DOCS.
3. Add it under the most fitting section (or "Newest project-specific lessons" at the bottom).
4. **If the rule is mechanical and must happen every time** (formatting, linting, a forbidden
   command), say so and offer to promote it to a **hook** in `.claude/settings.local.json` —
   hooks run 100% of the time; `LESSONS.md` is advisory.
5. Confirm in one line what was added.

## Rules
- One mistake = one short rule. Specific and actionable beats long.
- Don't log the same lesson twice. If it refines an existing one, edit that line instead.
- If a previously logged lesson is now wrong, delete it — this file must stay true.
