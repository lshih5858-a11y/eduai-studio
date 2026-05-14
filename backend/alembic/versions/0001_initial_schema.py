"""초기 스키마 생성.

Revision ID: 0001
Revises:
Create Date: 2026-05-14 00:00:00.000000

모든 테이블을 생성합니다:
- pii 스키마: user_identity_map
- public 스키마: users, consent_types, consent_records, courses, course_sections,
  enrollments, audit_logs, learner_analytics_snapshots, risk_predictions,
  recommendations, interventions, intervention_approvals
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """모든 테이블을 생성합니다."""

    # PII 스키마 생성
    op.execute("CREATE SCHEMA IF NOT EXISTS pii")

    # --------------------------------------------------------
    # users 테이블 (PII 없음)
    # --------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "pseudo_student_id",
            sa.String(64),
            nullable=False,
            comment="실제 학번을 해시한 가명 식별자",
        ),
        sa.Column(
            "role",
            sa.Enum(
                "STUDENT", "PROFESSOR", "ASSISTANT", "ADMIN", "RESEARCHER",
                name="userrole",
            ),
            nullable=False,
        ),
        sa.Column("display_name", sa.String(100), nullable=False, comment="표시용 이름 (실명 아님)"),
        sa.Column("institution_code", sa.String(20), nullable=False, comment="소속 대학 코드"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("hashed_password", sa.String(200), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pseudo_student_id", name="uq_users_pseudo_id"),
    )
    op.create_index("ix_users_pseudo_id", "users", ["pseudo_student_id"])

    # --------------------------------------------------------
    # pii.user_identity_map 테이블 (PII 저장)
    # --------------------------------------------------------
    op.create_table(
        "user_identity_map",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", sa.String(50), nullable=False, comment="실제 학번 (PII) - 접근 시 감사 필요"),
        sa.Column("pseudo_student_id", sa.String(64), nullable=False, comment="분석용 가명 식별자"),
        sa.Column("created_by", sa.String(64), nullable=False, comment="매핑 생성한 관리자의 pseudo_student_id"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", name="uq_student_id"),
        sa.UniqueConstraint("pseudo_student_id", name="uq_pseudo_student_id_pii"),
        schema="pii",
        comment="PII 분리 저장 테이블 - 접근 시 반드시 감사 로그 기록",
    )
    op.create_index(
        "ix_pii_identity_map_pseudo_id",
        "user_identity_map",
        ["pseudo_student_id"],
        schema="pii",
    )

    # --------------------------------------------------------
    # consent_types 테이블
    # --------------------------------------------------------
    op.create_table(
        "consent_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "type_code",
            sa.Enum(
                "SERVICE_USE",
                "RESEARCH_PARTICIPATION",
                "THIRD_PARTY_SHARING",
                "AI_LOG_RESEARCH",
                name="consenttypeenum",
            ),
            nullable=False,
        ),
        sa.Column("title_ko", sa.String(200), nullable=False, comment="동의 유형 한국어 제목"),
        sa.Column("description_ko", sa.String(2000), nullable=False, comment="동의 내용 설명 (한국어)"),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("current_version", sa.String(20), nullable=False, server_default="1.0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("type_code"),
    )

    # --------------------------------------------------------
    # consent_records 테이블 (append-only)
    # --------------------------------------------------------
    op.create_table(
        "consent_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "pseudo_student_id",
            sa.String(64),
            nullable=False,
            comment="가명 식별자 (실제 학번 아님)",
        ),
        sa.Column(
            "consent_type",
            sa.Enum(
                "SERVICE_USE",
                "RESEARCH_PARTICIPATION",
                "THIRD_PARTY_SHARING",
                "AI_LOG_RESEARCH",
                name="consenttypeenum",
            ),
            nullable=False,
        ),
        sa.Column("granted", sa.Boolean(), nullable=False, comment="동의(True) 또는 철회(False)"),
        sa.Column("granted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True, comment="IP 주소 SHA-256 해시"),
        sa.Column("consent_version", sa.String(20), nullable=False, server_default="1.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["consent_type"], ["consent_types.type_code"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_consent_records_pseudo_id", "consent_records", ["pseudo_student_id"])

    # --------------------------------------------------------
    # courses 테이블
    # --------------------------------------------------------
    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_code", sa.String(20), nullable=False, comment="강좌 코드"),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.String(2000), nullable=True),
        sa.Column("institution_code", sa.String(20), nullable=False),
        sa.Column("semester", sa.String(20), nullable=False, comment="학기 (예: 2026-1)"),
        sa.Column("professor_pseudo_id", sa.String(64), nullable=False),
        sa.Column("max_students", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("course_code"),
    )

    # --------------------------------------------------------
    # course_sections 테이블
    # --------------------------------------------------------
    op.create_table(
        "course_sections",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # --------------------------------------------------------
    # enrollments 테이블
    # --------------------------------------------------------
    op.create_table(
        "enrollments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pseudo_student_id", sa.String(64), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE", "DROPPED", "COMPLETED", "WITHDRAWN",
                name="enrollmentstatus",
            ),
            nullable=False,
        ),
        sa.Column("grade", sa.String(5), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pseudo_student_id", "course_id", name="uq_enrollment"),
    )

    # --------------------------------------------------------
    # audit_logs 테이블 (append-only)
    # --------------------------------------------------------
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_pseudo_id", sa.String(64), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(200), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("user_agent_hash", sa.String(64), nullable=True),
        sa.Column("extra_data", postgresql.JSONB(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        comment="append-only 감사 로그 - UPDATE/DELETE 금지",
    )
    op.create_index("ix_audit_actor_occurred", "audit_logs", ["actor_pseudo_id", "occurred_at"])
    op.create_index("ix_audit_resource", "audit_logs", ["resource_type", "resource_id"])

    # --------------------------------------------------------
    # learner_analytics_snapshots 테이블
    # --------------------------------------------------------
    op.create_table(
        "learner_analytics_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pseudo_student_id", sa.String(64), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("submission_delay_days", sa.Float(), nullable=False, server_default="0"),
        sa.Column("forum_activity_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("quiz_avg_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("video_completion_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("lms_active_days", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("snapshot_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_snapshot_pseudo_id_created",
        "learner_analytics_snapshots",
        ["pseudo_student_id", "created_at"],
    )

    # --------------------------------------------------------
    # risk_predictions 테이블
    # --------------------------------------------------------
    op.create_table(
        "risk_predictions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pseudo_student_id", sa.String(64), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column(
            "risk_level",
            sa.Enum("LOW", "MEDIUM", "HIGH", name="risklevel"),
            nullable=False,
        ),
        sa.Column("reason_codes", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("calibration_note", sa.String(500), nullable=True),
        sa.Column("model_version", sa.String(20), nullable=False, server_default="v1.0.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_risk_pseudo_id_created",
        "risk_predictions",
        ["pseudo_student_id", "created_at"],
    )

    # --------------------------------------------------------
    # recommendations 테이블
    # --------------------------------------------------------
    op.create_table(
        "recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pseudo_student_id", sa.String(64), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("recommendation_type", sa.String(50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("shap_reason_codes", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("is_delivered", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # --------------------------------------------------------
    # interventions 테이블
    # --------------------------------------------------------
    op.create_table(
        "interventions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "target_pseudo_student_id",
            sa.String(64),
            nullable=False,
            comment="개입 대상 학습자의 가명 식별자",
        ),
        sa.Column("creator_pseudo_id", sa.String(64), nullable=False),
        sa.Column(
            "intervention_type",
            sa.Enum(
                "EMAIL_ALERT",
                "COUNSELING_REQUEST",
                "PEER_SUPPORT",
                "RESOURCE_SHARE",
                "PROFESSOR_MEETING",
                name="interventiontype",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "PENDING_APPROVAL",
                "APPROVED",
                "REJECTED",
                "DELIVERED",
                "CANCELLED",
                name="interventionstatus",
            ),
            nullable=False,
            server_default="PENDING_APPROVAL",
            comment="Human-in-the-loop: 기본값 PENDING_APPROVAL",
        ),
        sa.Column(
            "urgency_level",
            sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="urgencylevel"),
            nullable=False,
            server_default="MEDIUM",
        ),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("risk_prediction_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["target_pseudo_student_id"], ["users.pseudo_student_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["risk_prediction_id"], ["risk_predictions.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_interventions_target",
        "interventions",
        ["target_pseudo_student_id"],
    )

    # --------------------------------------------------------
    # intervention_approvals 테이블
    # --------------------------------------------------------
    op.create_table(
        "intervention_approvals",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("intervention_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("approver_pseudo_id", sa.String(64), nullable=False),
        sa.Column("approved", sa.Boolean(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["intervention_id"], ["interventions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("intervention_id"),
    )

    # --------------------------------------------------------
    # 초기 동의 유형 데이터 삽입
    # --------------------------------------------------------
    op.execute("""
        INSERT INTO consent_types (id, type_code, title_ko, description_ko, is_required, current_version)
        VALUES
            (gen_random_uuid(), 'SERVICE_USE', '서비스 이용 동의',
             'U-AI Compass 플랫폼 서비스 이용을 위한 기본 동의입니다. 학습 분석 데이터를 플랫폼 운영 목적으로 활용합니다.',
             true, '1.0'),
            (gen_random_uuid(), 'RESEARCH_PARTICIPATION', '연구 참여 동의',
             '학습 데이터를 교육 연구 목적으로 활용하는 것에 동의합니다. 모든 데이터는 익명화됩니다.',
             false, '1.0'),
            (gen_random_uuid(), 'THIRD_PARTY_SHARING', '제3자 제공 동의',
             '소속 대학 외 제3자 기관에 학습 데이터를 제공하는 것에 동의합니다. 데이터는 가명화되어 제공됩니다.',
             false, '1.0'),
            (gen_random_uuid(), 'AI_LOG_RESEARCH', 'AI 학습 로그 연구 활용 동의',
             'AI 모델 개선을 위해 학습 활동 로그를 연구에 활용하는 것에 동의합니다.',
             false, '1.0')
    """)


def downgrade() -> None:
    """모든 테이블을 삭제합니다."""
    # 의존성 역순으로 삭제
    op.drop_table("intervention_approvals")
    op.drop_table("interventions")
    op.drop_table("recommendations")
    op.drop_table("risk_predictions")
    op.drop_table("learner_analytics_snapshots")
    op.drop_table("audit_logs")
    op.drop_table("enrollments")
    op.drop_table("course_sections")
    op.drop_table("courses")
    op.drop_table("consent_records")
    op.drop_table("consent_types")
    op.drop_table("user_identity_map", schema="pii")
    op.drop_table("users")

    # Enum 타입 삭제
    sa.Enum(name="urgencylevel").drop(op.get_bind())
    sa.Enum(name="interventionstatus").drop(op.get_bind())
    sa.Enum(name="interventiontype").drop(op.get_bind())
    sa.Enum(name="risklevel").drop(op.get_bind())
    sa.Enum(name="enrollmentstatus").drop(op.get_bind())
    sa.Enum(name="consenttypeenum").drop(op.get_bind())
    sa.Enum(name="userrole").drop(op.get_bind())

    op.execute("DROP SCHEMA IF EXISTS pii CASCADE")
