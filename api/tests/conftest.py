from collections.abc import Iterator
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app.auth import get_jwk_client
from app.config import Settings, get_settings
from app.main import app

# A throwaway ES256 key pair, generated fresh for the test run. We sign tokens
# with the private half and verify with the public half — exactly what Supabase
# + JWKS do in production, but entirely local (no network).
_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())  # ES256 == ECDSA P-256
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
    # Swap the real JWKS client for our local key, and pin test settings so the
    # audience check has a known value. dependency_overrides is FastAPI's
    # built-in seam for exactly this.
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
    return jwt.encode(
        {"sub": "x", "aud": "authenticated", "exp": 9999999999}, other, algorithm="ES256"
    )
