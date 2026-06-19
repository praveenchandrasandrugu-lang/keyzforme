# Status

A quick glance at project state. Keep it short and scannable.

## Gather
- Read the "Current Status" in MEMORY.md (if it exists).
- `git status`, `git branch`, `git log --oneline -3`.
- If a GitHub remote exists: `gh issue list --state open --limit 20` and `gh run list --limit 1`.

## Report
```
Branch:      <branch>
Last commit: <hash> <message>
Uncommitted: <yes/no — list files if yes>
CI:          <passing/failing/none>
Open issues: <count>
Deployed:    <preview/prod URL if known>
```

If there are uncommitted changes, ask whether to commit. Keep it to a glance.
