# U-AI Compass 학습분석 플랫폼

교육부 「대학 인공지능(AI) 기본교육과정 개발 지원사업」(2026~2028)을 위한 학습분석 운영 인프라입니다.

## 프로젝트 개요

- **목적**: AI 기초 교양 2과목 + 비공학계열 AI 활용 소단위 전공 2트랙 + 교수자 연수 + 교과 공유를 하나의 데이터 순환 구조로 연결
- **설계 원칙**: Privacy by Default, Human-in-the-loop, 설명가능 AI, 분리 동의
- **비목표**: 기존 LMS/SIS 대체 아님 — overlay 방식으로 연계

## 기술 스택

| 계층 | 기술 |
|------|------|
| 백엔드 | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic |
| 프론트엔드 | TypeScript, Next.js 14 (App Router), TailwindCSS, shadcn/ui, Recharts |
| 데이터 | PostgreSQL 16, ClickHouse 24, Redis 7 |
| 이벤트 | xAPI, Apache Kafka, LTI 1.3 |
| AI/ML | PyTorch, scikit-learn, SHAP, LangChain, pgvector |
| 인증 | OIDC/SAML SSO, JWT + Refresh Token |
| 인프라 | Docker Compose (개발), Kubernetes (운영), GitHub Actions (CI/CD) |
| 관측 | OpenTelemetry, Prometheus, Grafana |

## 디렉토리 구조

```
u-ai-compass/
├── backend/             # FastAPI 백엔드
│   ├── app/
│   │   ├── api/v1/      # REST API 엔드포인트
│   │   ├── core/        # 보안·감사·RBAC·가명화
│   │   ├── models/      # SQLAlchemy 2.0 ORM 모델
│   │   ├── schemas/     # Pydantic 입출력 스키마
│   │   └── services/    # 비즈니스 로직
│   ├── alembic/         # DB 마이그레이션
│   └── tests/           # pytest 단위 테스트
├── frontend/            # Next.js 14 프론트엔드
│   └── src/
│       ├── app/         # App Router 페이지
│       ├── components/  # 재사용 컴포넌트
│       ├── lib/         # API 클라이언트·타입
│       └── providers/   # React Context
├── docs/                # 설계 문서
│   ├── architecture.md  # 시스템 아키텍처
│   ├── data-privacy.md  # 개인정보 설계
│   └── api-guide.md     # API 빠른 참조
└── docker-compose.yml   # 개발 환경 전체 스택
```

## 개발 환경 시작

### 1. 사전 요구사항

- Docker & Docker Compose v2
- Python 3.11+ (백엔드 로컬 개발 시)
- Node.js 20+ (프론트엔드 로컬 개발 시)

### 2. 환경 변수 설정

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# .env 파일을 열고 SECRET_KEY 등 필수 값을 설정하세요
```

### 3. Docker Compose로 전체 스택 시작

```bash
docker compose up -d

# 서비스 확인
docker compose ps

# 백엔드 API 문서
open http://localhost:8000/docs

# 프론트엔드
open http://localhost:3000
```

### 4. DB 마이그레이션

```bash
docker compose exec backend alembic upgrade head
```

### 5. 로컬 백엔드 개발

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 6. 로컬 프론트엔드 개발

```bash
cd frontend
npm install
npm run dev
```

## 테스트

```bash
# 백엔드 단위 테스트 (커버리지 70% 목표)
cd backend
pytest tests/ --asyncio-mode=auto --cov=app --cov-report=term-missing

# 프론트엔드 타입 체크
cd frontend
npm run type-check
```

## 핵심 설계 원칙

### Privacy by Default

```
student_id (실명, pii 스키마)
    │
    └─▶ PseudonymizationService
            │
            └─▶ pseudo_student_id (가명, 모든 분석에 사용)
```

모든 분석·ML·로그는 `pseudo_student_id`만 사용합니다. 재식별은 RBAC 권한 + 감사 로그 기록 후에만 가능합니다.

### Human-in-the-loop

학습자에 영향이 큰 모든 개입은 `PENDING_APPROVAL` 상태로 생성됩니다. 교수 또는 관리자가 명시적으로 승인해야 실행됩니다. 자동 실행되는 개입은 없습니다.

### 설명가능 AI

```json
{
  "risk_score": 0.73,
  "risk_level": "HIGH",
  "reason_codes": [
    {"feature": "submission_delay_days", "shap_value": 0.31, "direction": "increases_risk"},
    {"feature": "forum_activity_count", "shap_value": -0.18, "direction": "decreases_risk"}
  ],
  "calibration_note": "Platt scaling 적용; 이 위험 구간에서 ±8% 정확도"
}
```

모든 위험 예측은 SHAP 기반 reason code와 calibration 정보를 함께 반환합니다.

## 라이선스

이 소프트웨어는 교육부 지원사업 산출물로, 주관대학 및 Edu AI Studio 연구소가 공동 보유합니다.
