# U-AI Compass 아키텍처 개요

## 시스템 구성도

```
┌─────────────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                                │
│           (학생 / 교수 / 조교 / 관리자 / 연구자)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Next.js 14 (App Router)                           │
│              TailwindCSS + shadcn/ui + Recharts                     │
│         역할 기반 대시보드 · 동의 관리 · 개입 승인 UI                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST/JSON + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   FastAPI (Python 3.11)                             │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │  인증·인가   │  │  동의 관리  │  │  분석·개입 워크플로우     │   │
│  │  OIDC/JWT    │  │  4종 분리   │  │  Human-in-the-loop       │   │
│  │  RBAC        │  │  consent    │  │  SHAP reason code        │   │
│  └──────────────┘  └─────────────┘  └──────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              감사 미들웨어 (AuditMiddleware)                    │ │
│  │     모든 PII 접근 · 관리자 행위 → audit_log (append-only)      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────┬──────────────┬───────────────┬──────────────┬──────────────┘
         │              │               │              │
         ▼              ▼               ▼              ▼
  ┌──────────┐   ┌────────────┐  ┌──────────┐  ┌──────────┐
  │PostgreSQL│   │ClickHouse  │  │  Redis   │  │  Kafka   │
  │운영 데이터│   │OLAP 분석   │  │캐시·세션  │  │xAPI 이벤트│
  │          │   │            │  │          │  │          │
  │  public  │   │analytics   │  │          │  │          │
  │  schema  │   │            │  │          │  │          │
  ├──────────┤   └────────────┘  └──────────┘  └──────────┘
  │  pii     │
  │  schema  │◄── 별도 네트워크 세그먼트
  │(분리 저장)│    접근 시 감사 필수
  └──────────┘
```

## 데이터 흐름

```
LMS(Canvas/Moodle) ──LTI 1.3──► Kafka (xAPI 이벤트)
                                      │
                                      ▼
                              Analytics Service
                              (ClickHouse 집계)
                                      │
                           Risk Model (PyTorch + SHAP)
                                      │
                              ┌───────────────┐
                              │ risk_predictions│
                              │ + reason_codes │
                              └───────┬───────┘
                                      │ (승인 대기)
                                      ▼
                              교수/관리자 검토 UI
                              (Human-in-the-loop)
                                      │ 승인
                                      ▼
                              개입 실행 (이메일·상담 등)
```

## 보안 아키텍처

| 계층 | 보안 통제 |
|------|-----------|
| 인증 | OIDC/SAML SSO + JWT (15분 만료) + Refresh 토큰 (7일) |
| 인가 | RBAC: STUDENT < ASSISTANT < PROFESSOR < ADMIN < RESEARCHER |
| 데이터 분리 | `public` 스키마(가명) / `pii` 스키마(실명) |
| 감사 | audit_log: append-only, 모든 PII 접근·관리 행위 기록 |
| 네트워크 | 모델 서빙 계층 ↔ 원자료 저장소: 분리된 네트워크 세그먼트 |
| 암호화 | 전송 중: TLS 1.3, 저장 중: AES-256 (PII 필드) |

## 컴포넌트별 책임

| 컴포넌트 | 책임 |
|----------|------|
| `core/security.py` | JWT 발행·검증, bcrypt 패스워드 해싱 |
| `core/privacy.py` | `student_id` ↔ `pseudo_student_id` 매핑 서비스 |
| `core/audit.py` | append-only 감사 로그 기록 데코레이터 |
| `core/rbac.py` | 권한 매트릭스, `require_permission` 데코레이터 |
| `core/resilience.py` | 재시도·타임아웃·서킷브레이커 (LMS/LLM 외부 호출) |
| `services/analytics_service.py` | 위험도 예측 + SHAP reason code 반환 |
| `services/intervention_service.py` | 개입 생성·승인·거부 (Human-in-the-loop) |
| `services/consent_service.py` | 4종 분리 동의 관리 + consent_registry |
