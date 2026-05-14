"""학습 분석 API 테스트.

위험 점수 계산, SHAP reason code, 코호트 통계를 테스트합니다.
"""
import pytest
from httpx import AsyncClient

from app.models.user import User, UserRole
from app.services.analytics_service import AnalyticsService
from tests.conftest import make_auth_headers


@pytest.mark.asyncio
async def test_risk_score_structure(db_session) -> None:
    """위험 점수 반환 구조 테스트.

    SHAP reason code, risk_level, calibration_note를 포함하는지 확인합니다.
    """
    service = AnalyticsService(db_session)
    features = {
        "submission_delay_days": 5.0,
        "forum_activity_count": 1,
        "quiz_avg_score": 45.0,
        "video_completion_rate": 0.3,
        "lms_active_days": 5,
    }
    result = service.compute_risk_score("test_pseudo_abc", features)

    assert result.pseudo_student_id == "test_pseudo_abc"
    assert 0.0 <= result.risk_score <= 1.0
    assert result.risk_level in ["LOW", "MEDIUM", "HIGH"]
    assert len(result.reason_codes) == 5
    assert result.calibration_note is not None
    assert result.model_version == "v1.2.0"
    assert result.computed_at is not None


@pytest.mark.asyncio
async def test_shap_reason_code_directions(db_session) -> None:
    """SHAP reason code 방향 테스트.

    increases_risk / decreases_risk 방향이 올바른지 확인합니다.
    """
    service = AnalyticsService(db_session)
    # 고위험 피처 조합
    result = service.compute_risk_score(
        "test_pseudo_high_risk",
        {
            "submission_delay_days": 10.0,  # 높은 지연 -> increases_risk
            "forum_activity_count": 0,
            "quiz_avg_score": 30.0,         # 낮은 점수 -> increases_risk
            "video_completion_rate": 0.1,
            "lms_active_days": 2,
        },
    )
    directions = {rc.feature: rc.direction for rc in result.reason_codes}
    assert directions["submission_delay_days"] == "increases_risk"
    assert directions["quiz_avg_score"] == "increases_risk"


@pytest.mark.asyncio
async def test_low_risk_score(db_session) -> None:
    """저위험 피처 조합의 위험 점수 테스트."""
    service = AnalyticsService(db_session)
    result = service.compute_risk_score(
        "test_pseudo_low_risk",
        {
            "submission_delay_days": 0.0,
            "forum_activity_count": 20,
            "quiz_avg_score": 95.0,
            "video_completion_rate": 1.0,
            "lms_active_days": 28,
        },
    )
    assert result.risk_level in ["LOW", "MEDIUM"]


@pytest.mark.asyncio
async def test_learner_analytics_api_requires_auth(client: AsyncClient) -> None:
    """인증 없이 분석 API 접근 시 401 반환 테스트."""
    response = await client.get("/api/v1/analytics/learner/some_pseudo_id")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_learner_analytics_student_forbidden(
    client: AsyncClient, student_user: User
) -> None:
    """학생 역할은 개별 학습자 분석에 접근 불가 테스트."""
    headers = make_auth_headers(student_user)
    response = await client.get(
        f"/api/v1/analytics/learner/{student_user.pseudo_student_id}",
        headers=headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_learner_analytics_professor_allowed(
    client: AsyncClient, professor_user: User, student_user: User
) -> None:
    """교수 역할은 개별 학습자 분석에 접근 가능 테스트."""
    headers = make_auth_headers(professor_user)
    response = await client.get(
        f"/api/v1/analytics/learner/{student_user.pseudo_student_id}",
        headers=headers,
    )
    # 스냅샷이 없어도 모의 데이터 반환
    assert response.status_code == 200
    data = response.json()
    assert "risk_prediction" in data
    assert "reason_codes" in data["risk_prediction"]
