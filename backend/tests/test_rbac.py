"""RBAC(역할 기반 접근 제어) 테스트.

각 역할별 엔드포인트 접근 권한을 테스트합니다.
"""
import pytest
from httpx import AsyncClient

from app.core.rbac import Permission, has_permission
from app.models.user import User, UserRole
from tests.conftest import make_auth_headers


class TestPermissionMatrix:
    """권한 매트릭스 단위 테스트."""

    def test_student_cannot_approve_intervention(self) -> None:
        """학생은 개입 승인 권한이 없어야 합니다."""
        assert not has_permission(UserRole.STUDENT, Permission.INTERVENTION_APPROVE)

    def test_professor_can_approve_intervention(self) -> None:
        """교수는 개입 승인 권한이 있어야 합니다."""
        assert has_permission(UserRole.PROFESSOR, Permission.INTERVENTION_APPROVE)

    def test_admin_has_all_permissions(self) -> None:
        """관리자는 모든 권한을 보유해야 합니다."""
        for permission in Permission:
            assert has_permission(UserRole.ADMIN, permission), (
                f"관리자가 {permission.value} 권한을 가져야 합니다."
            )

    def test_student_cannot_read_pii(self) -> None:
        """학생은 PII 매핑 조회 권한이 없어야 합니다."""
        assert not has_permission(UserRole.STUDENT, Permission.PII_MAP_READ)

    def test_researcher_can_read_all_analytics(self) -> None:
        """연구자는 전체 분석 데이터 조회 권한이 있어야 합니다."""
        assert has_permission(UserRole.RESEARCHER, Permission.ANALYTICS_READ_ALL)

    def test_researcher_cannot_approve_intervention(self) -> None:
        """연구자는 개입 승인 권한이 없어야 합니다."""
        assert not has_permission(UserRole.RESEARCHER, Permission.INTERVENTION_APPROVE)


class TestEndpointRBAC:
    """엔드포인트 수준 RBAC 통합 테스트."""

    @pytest.mark.asyncio
    async def test_student_cannot_access_user_list(
        self, client: AsyncClient, student_user: User
    ) -> None:
        """학생은 다른 사용자 정보에 접근할 수 없습니다."""
        headers = make_auth_headers(student_user)
        response = await client.get(f"/api/v1/users/{student_user.id}", headers=headers)
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_professor_can_access_user_detail(
        self, client: AsyncClient, professor_user: User, student_user: User
    ) -> None:
        """교수는 사용자 상세 정보를 조회할 수 있습니다."""
        headers = make_auth_headers(professor_user)
        response = await client.get(f"/api/v1/users/{student_user.id}", headers=headers)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_student_can_read_own_profile(
        self, client: AsyncClient, student_user: User
    ) -> None:
        """학생은 자신의 프로필을 조회할 수 있습니다."""
        headers = make_auth_headers(student_user)
        response = await client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["pseudo_student_id"] == student_user.pseudo_student_id

    @pytest.mark.asyncio
    async def test_unauthenticated_access_denied(self, client: AsyncClient) -> None:
        """인증 없이 보호된 엔드포인트 접근 시 거부됩니다."""
        response = await client.get("/api/v1/users/me")
        assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_student_cannot_approve_intervention_endpoint(
        self, client: AsyncClient, student_user: User
    ) -> None:
        """학생은 개입 승인 엔드포인트를 호출할 수 없습니다."""
        import uuid

        headers = make_auth_headers(student_user)
        fake_id = str(uuid.uuid4())
        response = await client.post(
            f"/api/v1/interventions/{fake_id}/approve",
            headers=headers,
            json={"note": "테스트"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_professor_can_approve_intervention_endpoint(
        self, client: AsyncClient, professor_user: User, student_user: User
    ) -> None:
        """교수는 개입 승인 엔드포인트를 호출할 수 있습니다 (개입이 없으면 404)."""
        import uuid

        headers = make_auth_headers(professor_user)
        fake_id = str(uuid.uuid4())
        response = await client.post(
            f"/api/v1/interventions/{fake_id}/approve",
            headers=headers,
            json={"note": "테스트 승인"},
        )
        # 교수는 접근 가능 (개입이 없으면 404, 권한 오류는 아님)
        assert response.status_code == 404
