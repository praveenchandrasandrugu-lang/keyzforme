# Backend architecture (`api/`)

The Keyz backend is a **FastAPI** service in `api/`, deployed separately from the Next.js site
(`web/`). It owns **all data access and business logic**; `web/` uses Supabase only for auth, then
calls this API with a Bearer JWT. See the learning-oriented walkthrough in the Obsidian vault
(`02 - The Stack/Backend (FastAPI)/`); this file is the terse engineering reference.

## Stack

Python 3.12 · **uv** (deps + venv + lockfile) · FastAPI · uvicorn · Pydantic v2 + pydantic-settings ·
SQLAlchemy 2.0 async (asyncpg) · Alembic · PyJWT[crypto] (ES256/RS256) · pytest · ruff · mypy (strict).

## Layout

```
api/
├─ app/
│  ├─ config.py        # Settings (pydantic-settings) + jwks_url / cors_origins_list
│  ├─ db.py            # async engine (pool_pre_ping) + async_sessionmaker + get_session dep
│  ├─ auth.py          # HTTPBearer + PyJWKClient → get_current_user dep → CurrentUser
│  ├─ routers/health.py# /health, /health/db, /me
│  └─ main.py          # FastAPI app: lifespan (engine.dispose), CORS, include routers
├─ migrations/         # Alembic (async template); env.py reads URL from app.config
│  └─ versions/        # a7785ede2dea = empty baseline (no app tables yet)
├─ tests/              # smoke, config, auth (ES256 keypair via dependency_overrides), health
├─ pyproject.toml      # deps + ruff/mypy/pytest config (pythonpath=["."])
└─ .env                # secrets (git-ignored); .env.example documents the names
```

## Auth boundary

```
browser → Next.js → Supabase Auth (login) → JWT
       → FastAPI request: Authorization: Bearer <jwt>
       → auth.py: PyJWKClient fetches Supabase JWKS public key by `kid`
       → jwt.decode(..., algorithms=["ES256","RS256"], audience="authenticated")
       → CurrentUser(id, email, role) → route authorizes → Postgres
```

- Supabase must use **asymmetric signing keys (ES256)** — shows as "ECC (P-256)" in the dashboard.
  HS256 (shared secret) will NOT work with JWKS verification.
- JWKS URL = `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` (built in `config.py`).

## Database & migrations

- **Alembic owns the app-table schema; Supabase owns the `auth` schema.** Never change app tables
  via the dashboard — only via a committed Alembic migration.
- `migrations/env.py` reads `DATABASE_URL` straight from `app.config` and builds the engine with
  `create_async_engine` — deliberately **not** through `alembic.ini`/configparser, because a
  percent-encoded password (`%23` for `#`) collides with configparser's `%` interpolation.
- `target_metadata = None` for now; set it to `Base.metadata` when the first models land (Slice 3/4),
  which enables `--autogenerate`.
- Use the Supabase **Session pooler (5432)**, not the Transaction pooler (6543), which breaks
  asyncpg's prepared-statement cache.

## Env vars

`DATABASE_URL` (`postgresql+asyncpg://…@…pooler.supabase.com:5432/postgres`) · `SUPABASE_URL` ·
`SUPABASE_JWT_AUD` (default `authenticated`) · `CORS_ORIGINS` (comma-separated).

## Local quality gate (run from `api/`, also enforced by the pre-commit hook)

```
uv run ruff check . ; uv run ruff format --check . ; uv run mypy app ; uv run pytest -q
```

Run the server: `uv run uvicorn app.main:app --reload` → `/health`, `/health/db`, `/docs`.

## Deploy (Railway)

Root Directory = `api`; Nixpacks detects uv via `uv.lock`. Start command
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`; healthcheck `/health`. Set the **prod** Supabase
env vars on the service (and migrate that project to ES256 too). Run `alembic upgrade head` against
prod once. See `api/railway.json`.

_Cross-reference: `docs/architecture/frontend.md` (planned)._
