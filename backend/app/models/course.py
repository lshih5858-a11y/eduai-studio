"""강좌 및 수강 등록 모델 정의."""
import enum
import uuid
from typing import List, Optional

from sqlalchemy import Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class EnrollmentStatus(str, enum.Enum):
    """수강 상태 열거형."""

    ACTIVE = "ACTIVE"
    DROPPED = "DROPPED"
    COMPLETED = "COMPLETED"
    WITHDRAWN = "WITHDRAWN"


class Course(TimestampMixin, Base):
    """강좌 테이블."""

    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    course_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        comment="강좌 코드 (예: CS101)",
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(2000),
        nullable=True,
    )
    institution_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    semester: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="학기 (예: 2026-1)",
    )
    professor_pseudo_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="담당 교수의 가명 식별자",
    )
    max_students: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    # 관계 정의
    sections: Mapped[List["CourseSection"]] = relationship(
        "CourseSection",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Course code={self.course_code} title={self.title}>"


class CourseSection(TimestampMixin, Base):
    """강좌 섹션(주차/모듈) 테이블."""

    __tablename__ = "course_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="섹션 순서",
    )

    # 관계 정의
    course: Mapped["Course"] = relationship("Course", back_populates="sections")

    def __repr__(self) -> str:
        return f"<CourseSection course_id={self.course_id} title={self.title}>"


class Enrollment(TimestampMixin, Base):
    """수강 등록 테이블."""

    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("pseudo_student_id", "course_id", name="uq_enrollment"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus),
        nullable=False,
        default=EnrollmentStatus.ACTIVE,
    )
    grade: Mapped[Optional[str]] = mapped_column(
        String(5),
        nullable=True,
        comment="최종 성적",
    )

    # 관계 정의
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[pseudo_student_id],
        primaryjoin="Enrollment.pseudo_student_id == User.pseudo_student_id",
        back_populates="enrollments",
    )
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")

    def __repr__(self) -> str:
        return f"<Enrollment pseudo_id={self.pseudo_student_id} course_id={self.course_id}>"
