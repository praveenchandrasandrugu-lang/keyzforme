// Runs on `git commit` via .husky/pre-commit → only when staged files match.
// Each value is a function returning commands; returning a function (not a
// string) tells lint-staged NOT to append the staged filenames — because
// tsc/mypy/ruff-format are whole-project tools, not single-file ones.
export default {
  // Frontend: lint, typecheck, and enforce design-token consistency.
  "web/**/*.{ts,tsx,js,jsx,css}": () => [
    "npm --prefix web run lint",
    "npm --prefix web run typecheck",
    "node scripts/check-tokens.mjs",
  ],
  // Backend: the same gate we run by hand (ruff lint + format check + mypy).
  "api/**/*.py": () => [
    "uv --directory api run ruff check .",
    "uv --directory api run ruff format --check .",
    "uv --directory api run mypy app",
  ],
};
