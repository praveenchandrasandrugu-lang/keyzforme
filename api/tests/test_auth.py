from fastapi.testclient import TestClient

from tests.conftest import expired_token, mint_token, wrong_key_token


def test_me_accepts_valid_token(client: TestClient) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {mint_token()}"})
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "user-123"
    assert body["role"] == "authenticated"


def test_me_rejects_missing_token(client: TestClient) -> None:
    assert client.get("/me").status_code == 401


def test_me_rejects_expired_token(client: TestClient) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {expired_token()}"})
    assert r.status_code == 401


def test_me_rejects_wrong_key(client: TestClient) -> None:
    r = client.get("/me", headers={"Authorization": f"Bearer {wrong_key_token()}"})
    assert r.status_code == 401
