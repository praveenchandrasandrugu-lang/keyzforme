# Quick Test

Local verification in one shot — lint, typecheck, build (and tests if present). Run this
before committing. This is your "is it actually OK?" check.

## Steps (run from the app directory, e.g. the Next.js root)

1. **Lint**: `npm run lint`
2. **Typecheck**: `npx tsc --noEmit`
3. **Build**: `npm run build`
4. **Tests** (only if a test script exists): `npm test`

Adapt the commands to whatever `package.json` actually defines. If there's no app yet, say so.

## Output
```
Lint:       PASS / FAIL (show errors)
Typecheck:  PASS / FAIL (show errors)
Build:      PASS / FAIL (show errors)
Tests:      PASS / FAIL / none

All checks passed!  (or: fix the errors above before committing)
```

## Rules
- Stop at the first failing step that makes later ones pointless (lint/typecheck before build).
- Show exact error messages so they can be fixed.
- Do NOT auto-fix — just report. Keep it encouraging.
