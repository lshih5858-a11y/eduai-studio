"""동의 관리 API 테스트.

동의 부여, 철회, 이력 조회 기능을 테스트합니다.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consent import ConsentTypeEnum
from app.models.user import User
from tests.conftest import make_auth_headers


@pytest.mark.asyncio
async def test_list_consent_types(client: AsyncClient, student_user: User) -> None:
    """동의 유형 목록 조회 테스트."""
    headers = make_auth_headers(student_user)
    response = await client.get("/api/v1/consent/types", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4  # 4종 동의 유형


@pytest.mark.asyncio
async def test_grant_consent(client: AsyncClient, student_user: User) -> None:
    """동의 부여 테스트."""
    headers = make_auth_headers(student_user)
    response = await client.post(
        "/api/v1/consent/grant",
        headers=headers,
        json={
            "consent_type": ConsentTypeEnum.RESEARCH_PARTICIPATION.value,
            "consent_version": "1.0",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["granted"] is True
    assert data["consent_type"] == ConsentTypeEnum.RESEARCH_PARTICIPATION.value
    assert data["pseudo_student_id"] == student_user.pseudo_student_id


@pytest.mark.asyncio
async def test_revoke_consent(client: AsyncClient, student_user: User) -> None:
    """동의 철회 테스트."""
    headers = make_auth_headers(student_user)

    # 먼저 동의
    await client.post(
        "/api/v1/consent/grant",
        headers=headers,
        json={
            "consent_type": ConsentTypeEnum.THIRD_PARTY_SHARING.value,
            "consent_version": "1.0",
        },
    )

    # 철회
    response = await client.post(
        "/api/v1/consent/revoke",
        headers=headers,
        json={
            "consent_type": ConsentTypeEnum.THIRD_PARTY_SHARING.value,
            "consent_version": "1.0",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["granted"] is False
    assert data["revoked_at"] is not None


@pytest.mark.asyncio
async def test_consent_history(client: AsyncClient, student_user: User) -> None:
    """동의 이력 조회 테스트."""
    headers = make_auth_headers(student_user)

    # 동의 생성
    await client.post(
        "/api/v1/consent/grant",
        headers=headers,
        json={
            "consent_type": ConsentTypeEnum.AI_LOG_RESEARCH.value,
            "consent_version": "1.0",
        },
    )

    # 이력 조회
    response = await client.get("/api/v1/consent/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_consent_append_only(client: AsyncClient, student_user: User) -> None:
    """동의 기록 append-only 확인 테스트.

    동의 → 철회 → 재동의 시 각각 별도 레코드가 생성됩니다.
    """
    headers = make_auth_headers(student_user)
    consent_type = ConsentTypeEnum.AI_LOG_RESEARCH.value

    # 동의
    await client.post(
        "/api/v1/consent/grant",
        headers=headers,
        json={"consent_type": consent_type, "consent_version": "1.0"},
    )
    # 철회
    await client.post(
        "/api/v1/consent/revoke",
        headers=headers,
        json={"consent_type": consent_type, "consent_version": "1.0"},
    )
    # 재동의
    await client.post(
        "/api/v1/consent/grant",
        headers=headers,
        json={"consent_type": consent_type, "consent_version": "1.0"},
    )

    # 이력 조회 - 3개 이상의 레코드가 있어야 함
    response = await client.get("/api/v1/consent/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    ai_log_records = [r for r in data if r["consent_type"] == consent_type]
    assert len(ai_log_records) >= 3
