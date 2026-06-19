# Slice 0 — Backend Foundation (FastAPI `api/`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Keyz backend as a separate **FastAPI** service in `api/` — config, async Postgres access (SQLAlchemy 2.0 + Alembic), a Supabase-JWT auth dependency, health endpoints, a real test suite — deployed to **Railway** from the `api/` subdir; then wire **repo-wide pre-commit hooks** (husky + lint-staged) that gate BOTH stacks.

**Architecture:** Monorepo (`web/` Next.js + `api/` FastAPI), boundary locked 2026-06-19 (PRD §7, memory `architecture-stack`). **FastAPI owns ALL data access and business logic.** Next.js uses Supabase **only for auth** (obtains a JWT), then calls FastAPI with `Authorization: Bearer <jwt>`. FastAPI verifies the JWT against Supabase's **JWKS endpoint** using **asymmetric signing keys (ES256/RS256)** — no shared secret — then authorizes and queries Postgres. **Alembic owns the app-table schema**; Supabase owns the `auth` schema. No app tables are created in this slice (PRD says tables arrive Slice 3/4) — we wire the full pipeline and prove it with `SELECT 1`.

**Tech Stack:** Python 3.12, **uv** (project + venv + lockfile), FastAPI, **uvicorn[standard]**, Pydantic v2 + **pydantic-settings**, **SQLAlchemy 2.0** (async, `asyncpg`), **Alembic** (async template), **PyJWT[crypto]** (ES256/RS256 verification), **httpx**, **pytest** + **pytest-asyncio**, **ruff**, **mypy**. Hosts on **Railway** (Root Directory = `api`). Pre-commit: **husky + lint-staged** at the repo root.

> **Verify at execution time (CLAUDE.md rule 6):** before running the scaffold/deps/Alembic/Railway commands, re-confirm current usage via Context7 (`mcp__context7__resolve-library-id` → `query-docs`) for `uv`, `FastAPI`, `SQLAlchemy`, `Alembic`, and `PyJWT`, and via the Supabase docs MCP for JWKS/signing-keys. The commands below were checked 2026-06-19 but pin/flag anything that has drifted.

**Branch:** work on `dev` (already current). Commit after each task. Push only when Praveen approves.

**Prerequisite — Praveen actions (do FIRST, they gate the auth + DB tasks):**
1. **Enable asymmetric JWT signing keys** in BOTH Supabase projects (dev + prod): Dashboard → Project Settings → **JWT Keys / Signing Keys** → migrate from the default **HS256** to an **asymmetric** key (**ES256** recommended — smaller tokens). Without this, the JWKS-based verification in Task B4 cannot work. (Supabase docs: "third-party clients can validate JWTs using the public key from your JWKS endpoint without needing access to your JWT secret.")
2. Have the **dev** Supabase **connection string** ready (Dashboard → Connect → **Session pooler**, URI form) and the **Project URL** (`https://<ref>.supabase.co`).

---

## File Structure (created across this plan)

```
# repo root (monorepo tooling)
package.json                 # root, private — husky + lint-staged only          (B7)
.husky/pre-commit            # the git hook → npx lint-staged                     (B7)
.lintstagedrc.mjs            # glob → command routing for web/ and api/           (B7)
scripts/check-tokens.mjs     # token-consistency gate (QUALITY-GATES §1)          (B7)

# api/  (the FastAPI service — Railway Root Directory = api)
api/pyproject.toml           # uv project, deps, ruff + mypy + pytest config      (B1)
api/uv.lock                  # lockfile                                           (B1)
api/.python-version          # 3.12                                               (B1)
api/.env.example             # documented env NAMES (committed)                   (B2)
api/.env                      # real secrets (git-ignored)                        (B2)
api/railway.json             # Railway build/start config                         (B6)
api/app/__init__.py
api/app/config.py            # pydantic-settings Settings + jwks_url              (B2)
api/app/db.py                # async engine + AsyncSession dependency             (B3)
api/app/auth.py              # Supabase JWT verify dependency (PyJWKClient)       (B4)
api/app/routers/__init__.py
api/app/routers/health.py    # /health, /health/db, /me                          (B5)
api/app/main.py              # FastAPI app + lifespan + CORS + routers            (B5)
api/alembic.ini                                                                   (B3)
api/migrations/env.py        # async Alembic env                                  (B3)
api/migrations/versions/     # initial empty baseline revision                    (B3)
api/tests/__init__.py
api/tests/conftest.py        # ES256 keypair + JWKS override + token minter       (B4)
api/tests/test_config.py                                                          (B2)
api/tests/test_auth.py                                                            (B4)
api/tests/test_health.py                                                          (B5)
docs/architecture/backend.md # backend reference                                 (B8)
```

---

# SLICE 0 — BACKEND (continues issue #1; tasks numbered B1–B8 / 0.8–0.15)

## Task B1 (0.8): Scaffold the `api/` uv project + toolchain

**Files:** Create `api/pyproject.toml`, `api/uv.lock`, `api/.python-version`, `api/app/__init__.py`, `api/tests/__init__.py`, `api/tests/test_smoke.py`.

- [ ] **Step 1 (Context7):** Confirm current `uv init` / `uv add` usage for an application project.

- [ ] **Step 2:** Initialize the project (run from repo root):

```powershell
uv init api --package --python 3.12
```
This creates `api/pyproject.toml`, `api/.python-version`, and an `api/src/...` layout. We use a flat `api/app/` package instead — delete any generated `api/src/` and the sample module; keep `pyproject.toml` + `.python-version`.

- [ ] **Step 3:** Add runtime + dev dependencies (run from inside `api/`):

```powershell
uv add fastapi "uvicorn[standard]" pydantic-settings "sqlalchemy[asyncio]>=2.0" asyncpg alembic "pyjwt[crypto]" httpx
uv add --dev pytest pytest-asyncio ruff mypy
```

- [ ] **Step 4:** Append tool config to `api/pyproject.toml` (ruff, mypy strict, pytest async auto-mode):

```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "ASYNC"]

[tool.mypy]
python_version = "3.12"
strict = true
plugins = ["pydantic.mypy"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 5:** Create the package + a smoke test proving the toolchain runs.

`api/app/__init__.py`:
```python
__all__: list[str] = []
```

`api/tests/__init__.py`: (empty file)

`api/tests/test_smoke.py`:
```python
def test_toolchain_runs() -> None:
    assert 1 + 1 == 2
```

- [ ] **Step 6 (verify):** From inside `api/`, the full local gate must pass clean:

```powershell
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest -q
```
Expected: ruff clean, format clean, mypy "Success: no issues", pytest `1 passed`.

- [ ] **Step 7 (commit):**

```powershell
git add api/pyproject.toml api/uv.lock api/.python-version api/app api/tests
git commit -m "feat(api): scaffold FastAPI service with uv + ruff/mypy/pytest"
```

## Task B2 (0.9): Settings via pydantic-settings (TDD)

**Files:** Create `api/app/config.py`, `api/.env.example`, `api/.env` (git-ignored), `api/tests/test_config.py`.

- [ ] **Step 1 (write the failing test):** `api/tests/test_config.py`:

```python
from app.config import Settings


def test_settings_load_and_build_jwks_url() -> None:
    s = Settings(
        database_url="postgresql+asyncpg://u:p@host:5432/db",
        supabase_url="https://abc.supabase.co",
        cors_origins="http://localhost:3000",
    )
    assert s.supabase_jwt_aud == "authenticated"  # default
    assert s.jwks_url == "https://abc.supabase.co/auth/v1/.well-known/jwks.json"
    assert s.cors_origins_list == ["http://localhost:3000"]
```

- [ ] **Step 2 (run, expect fail):**

```powershell
uv run pytest tests/test_config.py -q
```
Expected: FAIL — `ModuleNotFoundError: No module named 'app.config'`.

- [ ] **Step 3 (implement):** `api/app/config.py`:

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    supabase_url: str
    supabase_jwt_aud: str = "authenticated"
    cors_origins: str = ""  # comma-separated list of allowed browser origins

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from env/.env
```

- [ ] **Step 4 (run, expect pass):**

```powershell
uv run pytest tests/test_config.py -q
```
Expected: PASS.

- [ ] **Step 5:** Create `api/.env.example` (committed, NO secrets):

```
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/postgres
SUPABASE_URL=https://YOUR-REF.supabase.co
SUPABASE_JWT_AUD=authenticated
CORS_ORIGINS=http://localhost:3000
```

- [ ] **Step 6:** Create `api/.env` (NEVER commit) with the **real dev** values. Convert the Supabase Session-pooler URI scheme from `postgresql://` to **`postgresql+asyncpg://`**. Confirm `.env` is git-ignored (root `.gitignore` already ignores `.env*` non-anchored).

- [ ] **Step 7 (verify):** `git status` must NOT list `api/.env`. Re-run `uv run pytest -q` — all pass.

- [ ] **Step 8 (commit):**

```powershell
git add api/app/config.py api/.env.example api/tests/test_config.py
git commit -m "feat(api): settings via pydantic-settings + jwks/cors helpers"
```

## Task B3 (0.10): Database layer (SQLAlchemy 2.0 async) + Alembic baseline

**Files:** Create `api/app/db.py`, `api/alembic.ini`, `api/migrations/env.py`, `api/migrations/versions/<rev>_baseline.py`.

> **Gotcha (zero-debt):** Use the Supabase **Session pooler** (port 5432) for both the app and migrations. The **Transaction pooler** (6543) breaks `asyncpg`'s prepared-statement cache. If you must use it, set `connect_args={"statement_cache_size": 0}` — but prefer the session pooler and avoid the issue.

- [ ] **Step 1 (Context7):** Confirm current `create_async_engine` / `async_sessionmaker` and Alembic async-template usage.

- [ ] **Step 2:** Create `api/app/db.py`:

```python
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings

_settings = get_settings()
engine = create_async_engine(_settings.database_url, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
```

- [ ] **Step 3:** Initialize Alembic with the async template (run from inside `api/`):

```powershell
uv run alembic init -t async migrations
```
This creates `alembic.ini` + `migrations/` (env.py, script.py.mako, versions/).

- [ ] **Step 4:** Point Alembic at our settings — edit `api/migrations/env.py` so it reads the URL from `app.config` (don't hardcode it in `alembic.ini`). Replace the URL/`run_migrations_online` wiring with:

```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool

from app.config import get_settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", get_settings().database_url)

target_metadata = None  # no models yet — Slice 3/4 will set this to Base.metadata


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_offline() -> None:
    context.configure(url=get_settings().database_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())
```

- [ ] **Step 5:** Create an **empty baseline revision** (proves the pipeline; no tables yet):

```powershell
uv run alembic revision -m "baseline (no app tables yet)"
```
Leave the generated `upgrade()`/`downgrade()` bodies as `pass`.

- [ ] **Step 6 (verify — real DB round-trip):** Apply migrations against the dev DB and confirm head:

```powershell
uv run alembic upgrade head
uv run alembic current
```
Expected: upgrade runs with no error; `current` prints the baseline revision id. (This proves `DATABASE_URL`, async driver, SSL, and Alembic all work end-to-end.)

- [ ] **Step 7 (verify gate):** `uv run ruff check . ; uv run mypy app ; uv run pytest -q` — all pass.

- [ ] **Step 8 (commit):**

```powershell
git add api/app/db.py api/alembic.ini api/migrations
git commit -m "feat(api): async SQLAlchemy engine + Alembic baseline pipeline"
```

## Task B4 (0.11): Supabase JWT auth dependency (TDD — the lynchpin)

**Files:** Create `api/app/auth.py`, `api/tests/conftest.py`, `api/tests/test_auth.py`.

The dependency verifies the Bearer JWT against Supabase's JWKS using the token's `kid` → public key → `jwt.decode(..., algorithms=["ES256","RS256"], audience=...)`. The JWKS client is itself a dependency so tests can override it with a local keypair (no network).

- [ ] **Step 1 (write conftest — test keypair, fake JWKS client, token minter):** `api/tests/conftest.py`:

```python
from collections.abc import Iterator
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app.auth import get_jwk_client
from app.config import Settings, get_settings
from app.main import app

_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())  # ES256
_PUBLIC_KEY = _PRIVATE_KEY.public_key()


class _FakeSigningKey:
    key = _PUBLIC_KEY


class _FakeJWKClient:
    def get_signing_key_from_jwt(self, token: str) -> _FakeSigningKey:
        return _FakeSigningKey()


def mint_token(**overrides: Any) -> str:
    payload: dict[str, Any] = {
        "sub": "user-123",
        "email": "buyer@example.com",
        "role": "authenticated",
        "aud": "authenticated",
        "exp": 9999999999,
    }
    payload.update(overrides)
    return jwt.encode(payload, _PRIVATE_KEY, algorithm="ES256")


@pytest.fixture
def client() -> Iterator[TestClient]:
    app.dependency_overrides[get_jwk_client] = lambda: _FakeJWKClient()
    app.dependency_overrides[get_settings] = lambda: Settings(
        database_url="postgresql+asyncpg://u:p@h:5432/db",
        supabase_url="https://test.supabase.co",
    )
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def expired_token() -> str:
    return mint_token(exp=1)  # 1970 → expired


def wrong_key_token() -> str:
    other = ec.generate_private_key(ec.SECP256R1())
    return jwt.encode({"sub": "x", "aud": "authenticated", "exp": 9999999999}, other, algorithm="ES256")
```

- [ ] **Step 2 (write the failing tests):** `api/tests/test_auth.py`:

```python
from tests.conftest import expired_token, mint_token, wrong_key_token


def test_me_accepts_valid_token(client) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {mint_token()}"})
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "user-123"
    assert body["role"] == "authenticated"


def test_me_rejects_missing_token(client) -> None:
    assert client.get("/me").status_code == 401


def test_me_rejects_expired_token(client) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {expired_token()}"})
    assert r.status_code == 401


def test_me_rejects_wrong_key(client) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {wrong_key_token()}"})
    assert r.status_code == 401
```

- [ ] **Step 3 (run, expect fail):** `uv run pytest tests/test_auth.py -q` — FAIL (no `app.auth`, no `/me`). (The `/me` route is added in Task B5; if running B4 before B5, expect import/route errors — that's the failing state.)

- [ ] **Step 4 (implement):** `api/app/auth.py`:

```python
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from pydantic import BaseModel

from app.config import Settings, get_settings

_bearer = HTTPBearer(auto_error=False)


@lru_cache
def _client_for(url: str) -> PyJWKClient:
    return PyJWKClient(url, cache_keys=True)


def get_jwk_client(settings: Annotated[Settings, Depends(get_settings)]) -> PyJWKClient:
    return _client_for(settings.jwks_url)


class CurrentUser(BaseModel):
    id: str
    email: str | None = None
    role: str


def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    settings: Annotated[Settings, Depends(get_settings)],
    jwk_client: Annotated[PyJWKClient, Depends(get_jwk_client)],
) -> CurrentUser:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(creds.credentials)
        payload = jwt.decode(
            creds.credentials,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience=settings.supabase_jwt_aud,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing sub claim")
    return CurrentUser(id=sub, email=payload.get("email"), role=payload.get("role", "authenticated"))
```

- [ ] **Step 5 (run after B5 wires `/me`, expect pass):** `uv run pytest tests/test_auth.py -q` — all 4 PASS.

- [ ] **Step 6 (commit):**

```powershell
git add api/app/auth.py api/tests/conftest.py api/tests/test_auth.py
git commit -m "feat(api): Supabase JWT auth dependency (JWKS/ES256) + tests"
```

## Task B5 (0.12): App assembly — main.py + health/me routers + CORS (TDD + local verify)

**Files:** Create `api/app/routers/__init__.py`, `api/app/routers/health.py`, `api/app/main.py`, `api/tests/test_health.py`.

- [ ] **Step 1 (write failing health test):** `api/tests/test_health.py`:

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_ok() -> None:
    with TestClient(app) as c:
        r = c.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Step 2 (run, expect fail):** `uv run pytest tests/test_health.py -q` — FAIL (no `app.main`).

- [ ] **Step 3 (implement routers):** `api/app/routers/__init__.py` (empty). `api/app/routers/health.py`:

```python
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_session

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/db")
async def health_db(session: Annotated[AsyncSession, Depends(get_session)]) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"status": "ok", "db": "ok"}


@router.get("/me")
async def me(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    return user
```

- [ ] **Step 4 (implement app):** `api/app/main.py`:

```python
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import engine
from app.routers import health


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await engine.dispose()


app = FastAPI(title="Keyz API", lifespan=lifespan)

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
```

- [ ] **Step 5 (run, expect pass):** `uv run pytest -q` — ALL tests pass (smoke, config, auth ×4, health). The auth tests from B4 now resolve `/me`.

- [ ] **Step 6 (verify locally — real server):** Start the API and hit it:

```powershell
uv run uvicorn app.main:app --reload --port 8000
```
- `GET http://localhost:8000/health` → `{"status":"ok"}`
- `GET http://localhost:8000/health/db` → `{"status":"ok","db":"ok"}` (proves the real dev DB connection)
- `GET http://localhost:8000/docs` → Swagger UI loads.
Stop the server.

- [ ] **Step 7 (verify gate):** `uv run ruff check . ; uv run ruff format --check . ; uv run mypy app ; uv run pytest -q` — all clean.

- [ ] **Step 8 (commit):**

```powershell
git add api/app/main.py api/app/routers api/tests/test_health.py
git commit -m "feat(api): app assembly — health/db/me routers + CORS"
```

## Task B6 (0.13): Deploy `api/` to Railway

Needs interactive login — Praveen runs the auth step (suggest the `!` prefix, e.g. `! railway login`).

- [ ] **Step 1:** Create `api/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```
Nixpacks detects the uv project via `uv.lock` and runs `uv sync`. (Verify current Railway + Nixpacks uv detection via WebSearch/Context7 at execution time; if detection misses, add a `Procfile`/`nixpacks.toml` pinning Python 3.12 + `uv sync`.)

- [ ] **Step 2:** Push `dev` so Railway can import (Praveen approves the push first): `git push origin dev`.

- [ ] **Step 3 (Praveen, interactive):** `railway login`, then from inside `api/`: `railway init` (or link to an existing project) and set the service **Root Directory = `api`** so Railway builds only the backend subdir.

- [ ] **Step 4:** Set env vars on the Railway service (BEFORE first deploy) — the **prod** Supabase values: `DATABASE_URL` (prod session-pooler, `postgresql+asyncpg://…`), `SUPABASE_URL`, `SUPABASE_JWT_AUD=authenticated`, `CORS_ORIGINS=https://<your-app>.vercel.app,http://localhost:3000`.

- [ ] **Step 5:** Deploy: `railway up` (from inside `api/`).

- [ ] **Step 6 (verify):** Open the Railway-provided URL; `GET /health` → `{"status":"ok"}`, `GET /health/db` → `{"status":"ok","db":"ok"}` against prod DB. (Run prod migrations once: `DATABASE_URL=<prod> uv run alembic upgrade head`, or via a Railway one-off command.)

- [ ] **Step 7:** Record the live API URL on issue #1 (foundation). Set Vercel env `NEXT_PUBLIC_API_URL=<railway-url>` for `web/` (consumed when Next.js starts calling the API in Slice 3+).

## Task B7 (0.14): Repo-wide pre-commit hooks (husky + lint-staged, BOTH stacks)

Implements the zero-tech-debt gate from `docs/QUALITY-GATES.md` §1 and memory `architecture-stack`: every commit lints/typechecks staged `web/` files and ruff/mypy-checks staged `api/` files, and fails on raw hex / raw `navy`|`sage` outside `web/src/components/site/**`.

**Files:** Create root `package.json`, `.husky/pre-commit`, `.lintstagedrc.mjs`, `scripts/check-tokens.mjs`.

- [ ] **Step 1:** Create a **private root `package.json`** that owns the monorepo git hooks (run from repo root):

```powershell
npm init -y
npm pkg set name="keyzforme-monorepo" private=true
npm pkg delete version description main keywords author license
npm install -D husky lint-staged
npm pkg set scripts.prepare="husky"
npx husky init
```
`husky init` creates `.husky/pre-commit` (default content `npm test`) — replace it in Step 2.

- [ ] **Step 2:** Set `.husky/pre-commit` to exactly:

```sh
npx lint-staged
```

- [ ] **Step 3:** Create `.lintstagedrc.mjs` (per-project commands; whole-project lint/typecheck since `tsc`/`mypy` are not single-file tools):

```js
export default {
  "web/**/*.{ts,tsx,js,jsx,css}": () => [
    "npm --prefix web run lint",
    "npm --prefix web run typecheck",
    "node scripts/check-tokens.mjs",
  ],
  "api/**/*.py": () => [
    "uv --directory api run ruff check .",
    "uv --directory api run ruff format --check .",
    "uv --directory api run mypy app",
  ],
};
```

- [ ] **Step 4:** Create `scripts/check-tokens.mjs` — fails commit if raw hex or bare `navy`/`sage` appear in `web/src` outside the marketing-only dir:

```js
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const ALLOW_DIR = "web/src/components/site/";
const files = globSync("web/src/**/*.{ts,tsx,css}");
const hex = /#[0-9a-fA-F]{3,8}\b/;
const brand = /\b(navy|sage)\b/;
const violations = [];

for (const f of files) {
  if (f.replaceAll("\\", "/").startsWith(ALLOW_DIR)) continue; // marketing components may use brand primitives
  const text = readFileSync(f, "utf8");
  text.split("\n").forEach((line, i) => {
    if (hex.test(line) || brand.test(line)) {
      violations.push(`${f}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (violations.length) {
  console.error("✖ token-consistency: raw hex / raw navy|sage outside web/src/components/site:");
  for (const v of violations) console.error("  " + v);
  console.error("Use semantic shadcn tokens (bg-primary, text-foreground, …) instead.");
  process.exit(1);
}
console.log("✓ token-consistency");
```
> If `globSync` from `node:fs` is unavailable in the installed Node, swap to the `glob` npm package (`npm install -D glob` at root) and `import { globSync } from "glob"`. Verify Node's `fs.globSync` availability at execution time.

- [ ] **Step 5 (verify — the hook actually blocks):**
  1. Add a raw hex to a non-marketing web file (e.g. `web/src/app/page.tsx`: `color: "#123456"`), `git add` it, attempt `git commit` → **commit is BLOCKED** by check-tokens. Revert the change.
  2. Introduce a ruff error in an `api/` file, `git add`, `git commit` → **blocked** by ruff. Revert.
  3. A clean change to both `web/` and `api/` → commit **succeeds** after both gates pass.

- [ ] **Step 6:** Update `docs/QUALITY-GATES.md` §1 status from "wireable" to "wired" with the actual file list.

- [ ] **Step 7 (commit):**

```powershell
git add package.json package-lock.json .husky .lintstagedrc.mjs scripts/check-tokens.mjs docs/QUALITY-GATES.md
git commit -m "chore: repo-wide pre-commit hooks (husky+lint-staged, web/ + api/ gates)"
```

## Task B8 (0.15): Write `docs/architecture/backend.md`

**Files:** Create `docs/architecture/backend.md`.

- [ ] **Step 1:** Write a concise (<110 line) reference covering: the `api/` layout (`app/`, `routers/`, `migrations/`, `tests/`); the **auth boundary** (Next.js → Supabase JWT → `Authorization: Bearer` → FastAPI verifies via JWKS/ES256 → role authz → Postgres); **Alembic owns app tables**, Supabase owns `auth`; the Session-pooler + asyncpg gotcha; the local gate (`ruff`/`mypy`/`pytest`); env var names; and the Railway deploy (Root Directory = `api`, start command). Note `target_metadata` becomes `Base.metadata` in Slice 3/4 when the first models land. Cross-reference `docs/architecture/frontend.md`.

- [ ] **Step 2 (commit):**

```powershell
git add docs/architecture/backend.md
git commit -m "docs: add backend architecture reference"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** PRD §7 two-service stack → B1–B6. "FastAPI owns all data; Next uses Supabase only for auth" → B4 auth boundary + B5 `/me`. "Alembic owns app-table schema" → B3. Railway deploy → B6. Memory `architecture-stack` "pre-commit hooks for BOTH stacks (husky+lint-staged + token check; ruff/mypy)" → B7. `docs/architecture/backend.md` (promised in the frontend plan's Task 0.6) → B8. ✅
- **Decision fidelity:** All three confirmed boundary decisions (monorepo, data boundary, Alembic) are encoded; no app tables created (respects PRD "tables Slice 3/4") while still proving the DB+migration pipeline via baseline + `SELECT 1`. ✅
- **Placeholder scan:** Every code step has complete, runnable code; commands have expected output; the token-check script and Alembic env.py are written in full, not described. The one deferred item (`target_metadata=None`) is intentional and documented (models arrive in a later slice), not a TODO. ✅
- **Type/name consistency:** `get_settings`, `get_jwk_client`, `get_current_user`, `CurrentUser(id/email/role)`, `Settings(database_url/supabase_url/jwks_url/cors_origins_list)`, `get_session`, `engine` are named identically across `config.py`, `auth.py`, `db.py`, `main.py`, `routers/health.py`, and the tests/conftest. The test overrides (`get_jwk_client`, `get_settings`) match the dependency callables exactly. ✅
- **Verification model:** Real TDD where logic exists (config, auth, health) with failing-test-first steps; integration verification (real DB round-trip, live server, hook-blocks-commit) where unit tests don't fit — stated explicitly so the executor doesn't fake tests. ✅
- **Prerequisite risk:** The asymmetric-signing-keys requirement is called out as a Praveen prerequisite up front, because the whole JWKS verification path (B4) depends on it. ✅
```
