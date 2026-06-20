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
