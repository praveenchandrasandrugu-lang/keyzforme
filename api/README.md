# Keyz API (`api/`)

The Keyz backend — a **FastAPI** service that owns all data access and business
logic. Next.js (`web/`) authenticates users with Supabase, then calls this API
with a `Bearer` JWT; this service verifies the token against Supabase's JWKS
endpoint and queries Postgres.

## Local development

Requires [uv](https://docs.astral.sh/uv/) (manages Python 3.12 + the venv).

```powershell
uv sync                                   # install deps from uv.lock
uv run uvicorn app.main:app --reload      # start the dev server on :8000
```

## Quality gate (run before every commit)

```powershell
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest -q
```

## Layout

| Path | Purpose |
|------|---------|
| `app/config.py` | settings (env vars) |
| `app/db.py` | async SQLAlchemy engine + session dependency |
| `app/auth.py` | Supabase JWT verification dependency |
| `app/routers/` | route handlers (`/health`, `/me`, …) |
| `app/main.py` | the FastAPI app (routes + middleware) |
| `migrations/` | Alembic migrations (owns the app-table schema) |
| `tests/` | pytest suite |

See `../docs/architecture/backend.md` for the full reference.
