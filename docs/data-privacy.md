# U-AI Compass 개인정보·프라이버시 설계 문서

> **Guard**: 이 문서는 「개인정보 보호법」(대한민국) 및 교육부 AI 윤리 지침을 준거로 합니다.
> 코드 변경이 여기에 기술된 설계 원칙에 영향을 미칠 경우, DPIA(데이터 보호 영향평가)를 재수행해야 합니다.

## 1. Privacy by Default 설계

### 1.1 식별자 분리 저장

| 저장소 | 스키마 | 보관 정보 | 접근 권한 |
|--------|--------|-----------|-----------|
| PostgreSQL `public` | 운영 데이터 | `pseudo_student_id`, 역할, 표시명 | 애플리케이션 계정 |
| PostgreSQL `pii` | PII 격리 | `student_id` ↔ `pseudo_student_id` 매핑 | `uai_pii_reader` 역할 + 감사 필수 |

```
실제 학번(PII)   ←──── user_identity_map (pii 스키마) ────►  가명 식별자
student_id                                                  pseudo_student_id
                                                                │
                                        모든 분석·ML·로그에서 이 값만 사용
```

### 1.2 PseudonymizationService

- `student_id` → `pseudo_student_id`: HMAC-SHA256 (institution_code + 글로벌 salt)
- salt는 HSM 또는 AWS KMS에 저장, 코드에 하드코딩 금지
- 역방향 매핑(재식별)은 `uai_pii_reader` 역할 + 감사 로그 기록 후에만 가능

## 2. 동의 관리 (Consent Registry)

### 2.1 4종 분리 동의

| 동의 유형 | 목적 | 철회 시 처리 |
|-----------|------|-------------|
| `SERVICE_USE` | 플랫폼 기본 이용 | 계정 비활성화 |
| `RESEARCH_PARTICIPATION` | IRB 승인 연구 | 연구 데이터셋에서 제외 |
| `THIRD_PARTY_SHARING` | 협력 기관 공동 연구 | 공유 중단 + 기공유본 파기 요청 |
| `AI_LOG_RESEARCH` | 생성형 AI 로그 연구 활용 | 로그 연구 데이터셋에서 제거 |

### 2.2 consent_records 테이블 설계 원칙

```python
# 동의 이력은 불변(immutable)으로 관리합니다.
# 철회 시 기존 레코드를 수정하지 않고, revoked_at을 채운 새 레코드를 추가합니다.
# 이를 통해 특정 시점의 동의 상태를 항상 재현할 수 있습니다.
```

## 3. 정보주체 권리 구현

| 권리 | API 엔드포인트 | 구현 방식 |
|------|---------------|-----------|
| 열람권 | `GET /api/v1/users/me/data-export` | 전체 데이터 JSON 다운로드 |
| 정정권 | `PATCH /api/v1/users/me` | 표시명 등 비PII 필드 |
| 삭제권(잊힐 권리) | `DELETE /api/v1/users/me` | 가명화 데이터 삭제 + PII 매핑 파기 |
| 처리정지권 | `POST /api/v1/consent/revoke` | 동의 철회 = 처리 중단 |
| 이동권 | `GET /api/v1/users/me/data-export` | 기계가독 형식(JSON) 제공 |

## 4. 감사 로그 설계

```python
# audit_log 테이블 원칙:
# - append-only: UPDATE/DELETE 금지 (DB 트리거로 강제)
# - 모든 PII 접근에 @audit_access 데코레이터 적용
# - 생성형 AI 호출, 관리자 행위, 동의 변경 자동 기록
# - 보존 기간: 5년 (법정 최소 기간)
```

## 5. 목적제한 원칙

```
운영 데이터        연구 데이터
(PostgreSQL)  →   (별도 연구 DB)
                  - 접근 주체 분리
                  - 보존 기간 분리 (연구 종료 후 3년)
                  - 목적 변경 시 DPIA 재수행 필수
```

## 6. 생성형 AI 사용 정책

- **탐지기 비채택**: 생성형 AI 탐지기를 핵심 평가 수단으로 사용하지 않습니다.
- **권장 대안**: 출처 표기 보고서, 중간 산출물 검토, 오프라인 평가, 인터뷰
- **AI 로그**: 학습 맥락이 포함된 AI 상호작용 로그는 `AI_LOG_RESEARCH` 동의 하에만 연구 활용

## 7. DPIA 체크리스트

- [ ] 신규 PII 필드 추가 시 DPIA 섹션 3 업데이트
- [ ] 제3자 데이터 연계 추가 시 DPIA 섹션 5 업데이트
- [ ] ML 모델 학습 데이터 변경 시 IRB 재검토
- [ ] consent_registry 스키마 변경 시 법무팀 검토
