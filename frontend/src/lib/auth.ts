/**
 * 클라이언트 사이드 인증 유틸리티 모듈
 */
import { UserProfile, UserRole } from "./types";

/**
 * 역할 한국어 표시 이름 매핑
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "학생",
  PROFESSOR: "교수",
  ASSISTANT: "조교",
  ADMIN: "관리자",
  RESEARCHER: "연구자",
};

/**
 * 역할별 접근 가능한 메뉴 항목 반환
 */
export function getMenuItemsForRole(role: UserRole): Array<{
  label: string;
  href: string;
  icon: string;
}> {
  const commonItems = [
    { label: "대시보드", href: "/dashboard", icon: "home" },
    { label: "동의 관리", href: "/consent", icon: "shield" },
  ];

  const roleSpecificItems: Record<UserRole, typeof commonItems> = {
    STUDENT: [{ label: "내 학습 현황", href: "/analytics/me", icon: "chart" }],
    PROFESSOR: [
      { label: "수강생 분석", href: "/analytics", icon: "chart" },
      { label: "개입 관리", href: "/interventions", icon: "bell" },
    ],
    ASSISTANT: [
      { label: "수강생 분석", href: "/analytics", icon: "chart" },
      { label: "개입 요청", href: "/interventions", icon: "bell" },
    ],
    ADMIN: [
      { label: "전체 분석", href: "/analytics", icon: "chart" },
      { label: "개입 관리", href: "/interventions", icon: "bell" },
    ],
    RESEARCHER: [
      { label: "코호트 분석", href: "/analytics", icon: "chart" },
    ],
  };

  return [...commonItems, ...(roleSpecificItems[role] ?? [])];
}

/**
 * 특정 기능 접근 권한 확인
 */
export function canAccessFeature(
  role: UserRole,
  feature: "analytics" | "interventions" | "approve" | "pii"
): boolean {
  const permissions: Record<UserRole, Set<string>> = {
    STUDENT: new Set(["analytics_self"]),
    PROFESSOR: new Set(["analytics", "interventions", "approve"]),
    ASSISTANT: new Set(["analytics", "interventions"]),
    ADMIN: new Set(["analytics", "interventions", "approve", "pii"]),
    RESEARCHER: new Set(["analytics"]),
  };

  return permissions[role]?.has(feature) ?? false;
}

/**
 * 위험 수준 색상 클래스 반환
 */
export function getRiskColorClass(riskLevel: string): string {
  switch (riskLevel) {
    case "HIGH":
      return "text-red-600 bg-red-50";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50";
    case "LOW":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

/**
 * 위험 수준 한국어 라벨 반환
 */
export function getRiskLevelLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "HIGH":
      return "고위험";
    case "MEDIUM":
      return "중위험";
    case "LOW":
      return "저위험";
    default:
      return "알 수 없음";
  }
}

/**
 * 동의 유형 한국어 라벨 매핑
 */
export const CONSENT_TYPE_LABELS: Record<string, string> = {
  SERVICE_USE: "서비스 이용",
  RESEARCH_PARTICIPATION: "연구 참여",
  THIRD_PARTY_SHARING: "제3자 제공",
  AI_LOG_RESEARCH: "AI 로그 연구",
};

/**
 * 개입 유형 한국어 라벨 매핑
 */
export const INTERVENTION_TYPE_LABELS: Record<string, string> = {
  EMAIL_ALERT: "이메일 알림",
  COUNSELING_REQUEST: "상담 요청",
  PEER_SUPPORT: "동료 지원",
  RESOURCE_SHARE: "학습 자료 제공",
  PROFESSOR_MEETING: "교수 면담",
};

/**
 * 개입 상태 한국어 라벨 매핑
 */
export const INTERVENTION_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "승인 대기",
  APPROVED: "승인됨",
  REJECTED: "거부됨",
  DELIVERED: "전달됨",
  CANCELLED: "취소됨",
};
