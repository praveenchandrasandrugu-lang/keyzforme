from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from pydantic import BaseModel

from app.config import Settings, get_settings

# auto_error=False so we can return our own 401 message when the header is absent.
_bearer = HTTPBearer(auto_error=False)


@lru_cache
def _client_for(url: str) -> PyJWKClient:
    # Cached per JWKS URL so we reuse one client (and its key cache) across requests.
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
    return CurrentUser(
        id=sub,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
    )
