from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_session

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness check — does NOT touch the database."""
    return {"status": "ok"}


@router.get("/health/db")
async def health_db(session: Annotated[AsyncSession, Depends(get_session)]) -> dict[str, str]:
    """Readiness check — proves we can actually reach Postgres."""
    await session.execute(text("SELECT 1"))
    return {"status": "ok", "db": "ok"}


@router.get("/me")
async def me(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    """Echo back who the caller is, proving the JWT was verified."""
    return user
