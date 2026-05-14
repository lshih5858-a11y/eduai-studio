-- PII 분리 스키마 초기화
-- Privacy-by-default: 개인식별정보는 별도 스키마에 격리합니다.
-- 이 스크립트는 PostgreSQL 컨테이너 최초 기동 시 실행됩니다.

CREATE SCHEMA IF NOT EXISTS pii;

-- pii 스키마 접근 권한은 전용 역할에만 부여합니다.
-- 애플리케이션 계정(uai_user)은 기본적으로 pii 스키마에 접근하지 못합니다.
-- 재식별이 필요한 경우 uai_pii_reader 역할을 통해 감사 로그와 함께 접근합니다.

CREATE ROLE uai_pii_reader NOLOGIN;
GRANT USAGE ON SCHEMA pii TO uai_pii_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA pii TO uai_pii_reader;

-- 애플리케이션 계정에는 public 스키마만 허용
GRANT ALL PRIVILEGES ON SCHEMA public TO uai_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO uai_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO uai_user;

-- Alembic이 pii 스키마 테이블을 생성할 수 있도록 CREATE 권한 부여
-- (운영 환경에서는 마이그레이션 전용 계정을 분리할 것을 권장)
GRANT ALL PRIVILEGES ON SCHEMA pii TO uai_user;
