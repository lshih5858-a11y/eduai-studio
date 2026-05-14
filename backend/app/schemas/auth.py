"""인증 관련 Pydantic 스키마."""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """로그인 요청 스키마."""

    pseudo_student_id: str = Field(..., description="가명 학번 또는 사용자 ID")
    password: str = Field(..., min_length=8, description="비밀번호")


class TokenResponse(BaseModel):
    """토큰 응답 스키마."""

    access_token: str = Field(..., description="JWT 액세스 토큰")
    refresh_token: str = Field(..., description="JWT 리프레시 토큰")
    token_type: str = Field(default="bearer", description="토큰 유형")
    expires_in: int = Field(..., description="액세스 토큰 만료 시간 (초)")


class RefreshRequest(BaseModel):
    """토큰 갱신 요청 스키마."""

    refresh_token: str = Field(..., description="리프레시 토큰")
