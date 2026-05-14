"""API v1 라우터 집계 모듈.

모든 v1 서브 라우터를 하나의 라우터에 등록합니다.
"""
from fastapi import APIRouter

from app.api.v1 import analytics, auth, consent, courses, interventions, users

api_v1_router = APIRouter()

# 인증 라우터
api_v1_router.include_router(auth.router, prefix="/auth", tags=["인증"])

# 사용자 라우터
api_v1_router.include_router(users.router, prefix="/users", tags=["사용자"])

# 강좌 라우터
api_v1_router.include_router(courses.router, prefix="/courses", tags=["강좌"])

# 동의 관리 라우터
api_v1_router.include_router(consent.router, prefix="/consent", tags=["동의 관리"])

# 분석 라우터
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["학습 분석"])

# 개입 라우터
api_v1_router.include_router(interventions.router, prefix="/interventions", tags=["개입 관리"])
