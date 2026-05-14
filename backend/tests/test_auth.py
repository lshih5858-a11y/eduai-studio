"""인증 API 테스트.

로그인, 토큰 갱신, 로그아웃 기능을 테스트합니다.
"""
import pytest
from httpx import AsyncClient

from app.models.user import User, UserRole
from tests.conftest import make_auth_headers


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, student_user: User) -> None:
    """정상 로그인 테스트."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "pseudo_student_id": student_user.pseudo_student_id,
            "password": "test_password_123",
        },
    )
    # 비밀번호 해시가 없는 모의 환경에서는 200 반환
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient) -> None:
    """존재하지 않는 사용자 로그인 시도 테스트."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "pseudo_student_id": "nonexistent_pseudo_id",
            "password": "some_password_123",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, student_user: User) -> None:
    """토큰 갱신 테스트."""
    from app.core.security import create_refresh_token

    refresh_token = create_refresh_token(subject=student_user.pseudo_student_id)
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_with_invalid_token(client: AsyncClient) -> None:
    """유효하지 않은 리프레시 토큰으로 갱신 시도."""
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid.token.here"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, student_user: User) -> None:
    """로그아웃 테스트."""
    headers = make_auth_headers(student_user)
    response = await client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_logout_without_token(client: AsyncClient) -> None:
    """인증 없이 로그아웃 시도."""
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 403
