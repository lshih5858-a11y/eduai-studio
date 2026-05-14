# U-AI Compass API 빠른 참조

> Base URL: `http://localhost:8000/api/v1`  
> 모든 엔드포인트는 `Authorization: Bearer <access_token>` 헤더 필요  
> 개발 환경에서는 `http://localhost:8000/docs` (Swagger UI) 참조

---

## 인증 (`/auth`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| POST | `/auth/login` | 이메일·비밀번호 로그인 | 누구나 |
| POST | `/auth/refresh` | 액세스 토큰 갱신 | 누구나 |
| POST | `/auth/logout` | 로그아웃 (Refresh 토큰 무효화) | 인증됨 |

### 로그인 예시

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "prof@university.ac.kr", "password": "secret"}'
```

**응답:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

## 사용자 (`/users`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| GET | `/users/me` | 내 프로필 조회 | 인증됨 |
| PATCH | `/users/me` | 내 프로필 수정 | 인증됨 |
| GET | `/users/{pseudo_id}` | 특정 사용자 조회 | PROFESSOR, ADMIN |

---

## 동의 관리 (`/consent`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| GET | `/consent/types` | 동의 유형 목록 | 인증됨 |
| GET | `/consent/my` | 내 현재 동의 현황 | 인증됨 |
| POST | `/consent/grant` | 동의 부여 | 인증됨 |
| POST | `/consent/revoke` | 동의 철회 | 인증됨 |
| GET | `/consent/history` | 동의 이력 전체 | 인증됨 |

### 동의 부여 예시

```bash
curl -X POST http://localhost:8000/api/v1/consent/grant \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"consent_type": "RESEARCH_PARTICIPATION", "consent_version": "v1.0"}'
```

**동의 유형:**
- `SERVICE_USE` — 서비스 이용 (필수)
- `RESEARCH_PARTICIPATION` — 연구 참여
- `THIRD_PARTY_SHARING` — 제3자 제공
- `AI_LOG_RESEARCH` — AI 로그 연구활용

---

## 학습 분석 (`/analytics`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| GET | `/analytics/dashboard-stats` | 대시보드 요약 통계 | PROFESSOR, ADMIN, RESEARCHER |
| GET | `/analytics/cohort` | 전체 학습자 위험도 목록 | PROFESSOR, ADMIN, RESEARCHER |
| GET | `/analytics/learner/{pseudo_id}` | 개별 학습자 분석 (SHAP 포함) | PROFESSOR, ADMIN, RESEARCHER |
| GET | `/analytics/cohort/{course_id}` | 강좌별 코호트 통계 | PROFESSOR, ADMIN, RESEARCHER |

### 학습자 분석 응답 예시

```json
{
  "pseudo_student_id": "a1b2c3d4...",
  "risk_score": 0.73,
  "risk_level": "HIGH",
  "reason_codes": [
    {"feature": "submission_delay_days", "shap_value": 0.31, "direction": "increases_risk"},
    {"feature": "forum_activity_count", "shap_value": 0.18, "direction": "decreases_risk"},
    {"feature": "quiz_avg_score", "shap_value": 0.24, "direction": "increases_risk"}
  ],
  "calibration_note": "Platt scaling 적용; 이 위험 구간에서 예측 정확도 ±8% 예상",
  "model_version": "v1.2.0",
  "learning_curve": [
    {"week": "1주차", "score": 55.0, "cohort_avg": 60.0},
    {"week": "2주차", "score": 58.5, "cohort_avg": 62.0}
  ],
  "recommendations": [
    {"type": "상담", "message": "즉시 교수 또는 상담사와 1:1 면담을 권장합니다.", "confidence": 0.88}
  ]
}
```

> **Guard**: 이 엔드포인트는 `pseudo_student_id`만 반환합니다. 실명 재식별은 별도 PII 접근 권한 필요.

---

## 개입 관리 (`/interventions`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| GET | `/interventions` | 개입 목록 (`?status=PENDING_APPROVAL`) | 역할별 |
| POST | `/interventions` | 개입 생성 (`PENDING_APPROVAL` 상태) | PROFESSOR, ASSISTANT, ADMIN |
| POST | `/interventions/{id}/approve` | 개입 승인 | PROFESSOR, ADMIN |
| POST | `/interventions/{id}/reject` | 개입 거부 | PROFESSOR, ADMIN |

> **Human-in-the-loop**: 생성된 개입은 자동 실행되지 않습니다. 반드시 교수/관리자 승인 후 실행됩니다.

### 개입 생성 예시

```bash
curl -X POST http://localhost:8000/api/v1/interventions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "target_pseudo_student_id": "a1b2c3d4...",
    "intervention_type": "EMAIL_ALERT",
    "message": "이번 주 과제 제출 마감이 다가옵니다.",
    "urgency_level": "MEDIUM"
  }'
```

---

## 강좌 (`/courses`)

| Method | Path | 설명 | 필요 역할 |
|--------|------|------|-----------|
| GET | `/courses` | 강좌 목록 | 인증됨 |
| POST | `/courses` | 강좌 생성 | PROFESSOR, ADMIN |
| GET | `/courses/{id}` | 강좌 상세 | 인증됨 |
| GET | `/courses/{id}/enrollments` | 수강생 목록 | PROFESSOR, ADMIN |

---

## 오류 응답 형식

```json
{
  "detail": "오류 메시지 (한국어)",
  "status_code": 403
}
```

| 상태 코드 | 의미 |
|-----------|------|
| 400 | 잘못된 요청 |
| 401 | 인증 필요 (토큰 없음 또는 만료) |
| 403 | 권한 부족 |
| 404 | 리소스 없음 |
| 422 | 유효성 검사 실패 |
| 500 | 서버 내부 오류 |
