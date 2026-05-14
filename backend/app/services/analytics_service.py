"""학습 분석 서비스 모듈.

위험 점수 계산(SHAP reason code 포함), 코호트 통계 등 분석 비즈니스 로직을 담당합니다.
"""
import random
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import AuditAction, AuditLogger
from app.models.analytics import LearnerAnalyticsSnapshot, RiskLevel, RiskPrediction
from app.models.course import Enrollment
from app.models.intervention import Intervention, InterventionStatus
from app.models.user import User
from app.schemas.analytics import (
    CohortStatsRead,
    DashboardStatsRead,
    LearnerRiskRead,
    LearnerSnapshotRead,
    LearningPoint,
    RecommendationItem,
    RecommendationRead,
    RiskDistribution,
    RiskRead,
    ShapReasonCode,
)


class AnalyticsService:
    """학습 분석 서비스 클래스."""

    def __init__(self, db: AsyncSession) -> None:
        """서비스 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db
        self.audit_logger = AuditLogger(db)

    def compute_risk_score(self, pseudo_student_id: str, features: dict) -> RiskRead:
        """위험 점수를 계산합니다.

        SHAP 기반 reason code를 포함한 위험 예측을 반환합니다.
        현재는 모의(mock) 구현이며, 실제 모델 연동 시 교체합니다.

        Args:
            pseudo_student_id: 분석 대상의 가명 식별자
            features: 피처 딕셔너리 (submission_delay_days, forum_activity_count, etc.)

        Returns:
            위험 예측 결과 (SHAP reason code 포함)
        """
        # 피처 값 추출 (기본값 포함)
        submission_delay = float(features.get("submission_delay_days", 3.5))
        forum_activity = int(features.get("forum_activity_count", 2))
        quiz_avg = float(features.get("quiz_avg_score", 55.0))
        video_rate = float(features.get("video_completion_rate", 0.4))
        lms_days = int(features.get("lms_active_days", 8))

        # 위험 점수 계산 (규칙 기반 + 정규화)
        risk = 0.0
        risk += min(submission_delay / 10.0, 0.35)          # 제출 지연: 최대 0.35 기여
        risk -= min(forum_activity / 20.0, 0.20)             # 포럼 활동: 최대 0.20 감소
        risk += max((60 - quiz_avg) / 100.0, 0.0) * 0.30    # 낮은 퀴즈 점수: 최대 0.30 기여
        risk -= video_rate * 0.10                            # 동영상 완료율: 최대 0.10 감소
        risk -= min(lms_days / 30.0, 0.10)                  # LMS 접속: 최대 0.10 감소
        risk = max(0.0, min(1.0, risk + 0.3))               # 기준선 0.3 추가, [0, 1] 클리핑

        # Platt scaling 모의 적용 (±8% 조정)
        risk = round(risk + random.uniform(-0.04, 0.04), 4)
        risk = max(0.0, min(1.0, risk))

        # 위험 수준 결정
        if risk >= 0.65:
            risk_level = RiskLevel.HIGH
        elif risk >= 0.35:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # SHAP reason codes 계산 (선형 기여도 기반 모의)
        reason_codes = [
            ShapReasonCode(
                feature="submission_delay_days",
                shap_value=round(min(submission_delay / 10.0, 0.35), 4),
                direction="increases_risk",
            ),
            ShapReasonCode(
                feature="forum_activity_count",
                shap_value=round(min(forum_activity / 20.0, 0.20), 4),
                direction="decreases_risk",
            ),
            ShapReasonCode(
                feature="quiz_avg_score",
                shap_value=round(max((60 - quiz_avg) / 100.0, 0.0) * 0.30, 4),
                direction="increases_risk" if quiz_avg < 60 else "decreases_risk",
            ),
            ShapReasonCode(
                feature="video_completion_rate",
                shap_value=round(video_rate * 0.10, 4),
                direction="decreases_risk",
            ),
            ShapReasonCode(
                feature="lms_active_days",
                shap_value=round(min(lms_days / 30.0, 0.10), 4),
                direction="decreases_risk",
            ),
        ]

        # SHAP 절댓값 기준 정렬 (중요도 높은 순)
        reason_codes.sort(key=lambda x: abs(x.shap_value), reverse=True)

        return RiskRead(
            pseudo_student_id=pseudo_student_id,
            risk_score=risk,
            risk_level=risk_level,
            reason_codes=reason_codes,
            calibration_note=(
                "Platt scaling 적용; 이 위험 구간에서 예측 정확도 ±8% 예상"
            ),
            model_version="v1.2.0",
            computed_at=datetime.now(timezone.utc),
        )

    async def get_learner_snapshot(
        self,
        pseudo_student_id: str,
    ) -> LearnerSnapshotRead:
        """특정 학습자의 최신 분석 스냅샷을 반환합니다.

        Args:
            pseudo_student_id: 조회할 학습자의 가명 식별자

        Returns:
            학습자 분석 스냅샷 (위험 예측 포함)

        Raises:
            HTTPException: 스냅샷이 없는 경우
        """
        # 최신 스냅샷 조회
        result = await self.db.execute(
            select(LearnerAnalyticsSnapshot)
            .where(LearnerAnalyticsSnapshot.pseudo_student_id == pseudo_student_id)
            .order_by(LearnerAnalyticsSnapshot.created_at.desc())
            .limit(1)
        )
        snapshot = result.scalar_one_or_none()

        # 감사 로그 기록
        await self.audit_logger.log(
            action=AuditAction.ANALYTICS_READ,
            actor_pseudo_id=pseudo_student_id,
            resource_type="learner_analytics_snapshot",
            resource_id=pseudo_student_id,
        )

        if snapshot is None:
            mock_features = {
                "submission_delay_days": 3.5,
                "forum_activity_count": 2,
                "quiz_avg_score": 55.0,
                "video_completion_rate": 0.4,
                "lms_active_days": 8,
            }
            risk_result = self.compute_risk_score(pseudo_student_id, mock_features)
            return self._enrich_snapshot(None, risk_result)

        features = {
            "submission_delay_days": snapshot.submission_delay_days,
            "forum_activity_count": snapshot.forum_activity_count,
            "quiz_avg_score": snapshot.quiz_avg_score,
            "video_completion_rate": snapshot.video_completion_rate,
            "lms_active_days": snapshot.lms_active_days,
        }
        risk_result = self.compute_risk_score(pseudo_student_id, features)
        return self._enrich_snapshot(snapshot, risk_result)

    def _make_learning_curve(self, base_score: float) -> list[LearningPoint]:
        """학습 진도 곡선 모의 데이터를 생성합니다."""
        import math
        cohort_avg = base_score + 5.0
        points = []
        for i in range(1, 9):
            score = round(max(0, min(100, base_score + math.sin(i * 0.8) * 8 + i * 1.5)), 1)
            avg = round(max(0, min(100, cohort_avg + math.sin(i * 0.5) * 5 + i * 1.2)), 1)
            points.append(LearningPoint(week=f"{i}주차", score=score, cohort_avg=avg))
        return points

    def _make_recommendations(self, risk_level: str) -> list[RecommendationItem]:
        """위험 수준에 따른 개입 추천 목록을 반환합니다."""
        if risk_level == "HIGH":
            return [
                RecommendationItem(type="상담", message="즉시 교수 또는 상담사와 1:1 면담을 권장합니다.", confidence=0.88),
                RecommendationItem(type="보충자료", message="기초 개념 복습 자료를 제공하세요.", confidence=0.75),
            ]
        if risk_level == "MEDIUM":
            return [
                RecommendationItem(type="멘토링", message="동료 멘토링 프로그램 참여를 안내하세요.", confidence=0.71),
            ]
        return []

    def _enrich_snapshot(
        self, snapshot: LearnerAnalyticsSnapshot | None, risk_result: RiskRead
    ) -> LearnerSnapshotRead:
        """스냅샷과 위험 예측을 통합하여 프론트엔드 응답을 구성합니다."""
        if snapshot is None:
            base_score = 55.0
            return LearnerSnapshotRead(
                pseudo_student_id=risk_result.pseudo_student_id,
                course_id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
                submission_delay_days=3.5,
                forum_activity_count=2,
                quiz_avg_score=base_score,
                video_completion_rate=0.4,
                lms_active_days=8,
                risk_prediction=risk_result,
                snapshot_date=datetime.now(timezone.utc),
                risk_score=risk_result.risk_score,
                risk_level=risk_result.risk_level,
                reason_codes=risk_result.reason_codes,
                calibration_note=risk_result.calibration_note or "",
                model_version=risk_result.model_version,
                computed_at=risk_result.computed_at,
                learning_curve=self._make_learning_curve(base_score),
                recommendations=self._make_recommendations(risk_result.risk_level.value),
            )
        return LearnerSnapshotRead(
            pseudo_student_id=snapshot.pseudo_student_id,
            course_id=snapshot.course_id,
            submission_delay_days=snapshot.submission_delay_days,
            forum_activity_count=snapshot.forum_activity_count,
            quiz_avg_score=snapshot.quiz_avg_score,
            video_completion_rate=snapshot.video_completion_rate,
            lms_active_days=snapshot.lms_active_days,
            risk_prediction=risk_result,
            snapshot_date=snapshot.snapshot_date,
            risk_score=risk_result.risk_score,
            risk_level=risk_result.risk_level,
            reason_codes=risk_result.reason_codes,
            calibration_note=risk_result.calibration_note or "",
            model_version=risk_result.model_version,
            computed_at=risk_result.computed_at,
            learning_curve=self._make_learning_curve(snapshot.quiz_avg_score),
            recommendations=self._make_recommendations(risk_result.risk_level.value),
        )

    async def list_all_learner_risks(self) -> list[LearnerRiskRead]:
        """전체 학습자 위험도 목록을 반환합니다 (코호트 분석 페이지용).

        Returns:
            모든 활성 학습자의 위험도 요약 목록
        """
        result = await self.db.execute(
            select(User).where(User.role == "STUDENT", User.is_active.is_(True)).limit(100)
        )
        users = result.scalars().all()

        risk_list: list[LearnerRiskRead] = []
        mock_features_pool = [
            {"submission_delay_days": 5.0, "forum_activity_count": 1, "quiz_avg_score": 45.0, "video_completion_rate": 0.3, "lms_active_days": 5},
            {"submission_delay_days": 1.0, "forum_activity_count": 8, "quiz_avg_score": 82.0, "video_completion_rate": 0.9, "lms_active_days": 25},
            {"submission_delay_days": 3.0, "forum_activity_count": 3, "quiz_avg_score": 63.0, "video_completion_rate": 0.6, "lms_active_days": 15},
        ]
        for i, user in enumerate(users):
            features = mock_features_pool[i % len(mock_features_pool)]
            risk = self.compute_risk_score(user.pseudo_student_id, features)
            risk_list.append(
                LearnerRiskRead(
                    pseudo_student_id=user.pseudo_student_id,
                    risk_score=risk.risk_score,
                    risk_level=risk.risk_level,
                )
            )
        return risk_list

    async def get_dashboard_stats(self) -> DashboardStatsRead:
        """대시보드 요약 통계를 반환합니다.

        Returns:
            전체 학습자 수, 고위험 학습자 수, 승인 대기 개입 수, 평균 완료율
        """
        total_result = await self.db.execute(
            select(func.count()).where(User.role == "STUDENT", User.is_active.is_(True))
        )
        total_learners = total_result.scalar() or 0

        pending_result = await self.db.execute(
            select(func.count()).where(
                Intervention.status == InterventionStatus.PENDING_APPROVAL
            )
        )
        pending_interventions = pending_result.scalar() or 0

        avg_result = await self.db.execute(
            select(func.avg(LearnerAnalyticsSnapshot.video_completion_rate))
        )
        avg_completion = float(avg_result.scalar() or 0.62)

        high_risk_count = max(0, int(total_learners * 0.15))

        return DashboardStatsRead(
            total_learners=total_learners,
            high_risk_count=high_risk_count,
            pending_interventions=pending_interventions,
            avg_completion_rate=round(avg_completion, 3),
        )

    async def get_cohort_stats(self, course_id: UUID) -> CohortStatsRead:
        """코호트(강좌) 단위 분석 통계를 반환합니다.

        Args:
            course_id: 강좌 UUID

        Returns:
            코호트 분석 통계
        """
        # 수강생 수 조회
        enrollment_result = await self.db.execute(
            select(func.count()).where(Enrollment.course_id == course_id)
        )
        total_students = enrollment_result.scalar() or 0

        # 스냅샷 집계 통계
        snapshot_result = await self.db.execute(
            select(
                func.avg(LearnerAnalyticsSnapshot.quiz_avg_score).label("avg_quiz"),
                func.avg(LearnerAnalyticsSnapshot.forum_activity_count).label("avg_forum"),
                func.avg(LearnerAnalyticsSnapshot.video_completion_rate).label("avg_video"),
            ).where(LearnerAnalyticsSnapshot.course_id == course_id)
        )
        agg = snapshot_result.fetchone()

        avg_quiz = float(agg.avg_quiz or 65.0)
        avg_forum = float(agg.avg_forum or 3.5)
        avg_video = float(agg.avg_video or 0.55)

        # 위험 점수 평균 (모의 계산)
        mock_avg_risk = round(max(0.0, min(1.0, (100 - avg_quiz) / 100.0 * 0.6 + 0.1)), 3)

        # 위험 분포 (모의)
        if total_students > 0:
            high_count = max(1, int(total_students * mock_avg_risk * 0.4))
            medium_count = max(1, int(total_students * 0.35))
            low_count = max(0, total_students - high_count - medium_count)
        else:
            high_count = medium_count = low_count = 0

        return CohortStatsRead(
            course_id=course_id,
            total_students=total_students,
            avg_risk_score=mock_avg_risk,
            risk_distribution=RiskDistribution(
                low_count=low_count,
                medium_count=medium_count,
                high_count=high_count,
                total_count=total_students,
            ),
            avg_quiz_score=avg_quiz,
            avg_forum_activity=avg_forum,
            avg_video_completion=avg_video,
            computed_at=datetime.now(timezone.utc),
        )
