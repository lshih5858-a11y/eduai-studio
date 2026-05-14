/**
 * 백엔드 스키마와 매핑되는 공용 TypeScript 타입 정의
 */

// -----------------------------------------------
// 사용자 관련 타입
// -----------------------------------------------
export type UserRole = "STUDENT" | "PROFESSOR" | "ASSISTANT" | "ADMIN" | "RESEARCHER";

export interface UserProfile {
  id: string;
  pseudo_student_id: string;
  display_name: string;
  role: UserRole;
  institution_code: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

// -----------------------------------------------
// 인증 관련 타입
// -----------------------------------------------
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  pseudo_student_id: string;
  password: string;
}

// -----------------------------------------------
// 동의 관련 타입
// -----------------------------------------------
export type ConsentType =
  | "SERVICE_USE"
  | "RESEARCH_PARTICIPATION"
  | "THIRD_PARTY_SHARING"
  | "AI_LOG_RESEARCH";

export interface ConsentTypeInfo {
  id: string;
  type_code: ConsentType;
  title_ko: string;
  description_ko: string;
  is_required: boolean;
  current_version: string;
}

export interface ConsentHistoryRecord {
  id: string;
  pseudo_student_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  consent_version: string;
  created_at: string;
}

// -----------------------------------------------
// 분석 관련 타입
// -----------------------------------------------
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ShapReasonCode {
  feature: string;
  shap_value: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface RiskPrediction {
  pseudo_student_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  reason_codes: ShapReasonCode[];
  calibration_note: string | null;
  model_version: string;
  computed_at: string;
}

export interface LearnerSnapshot {
  pseudo_student_id: string;
  course_id: string;
  submission_delay_days: number;
  forum_activity_count: number;
  quiz_avg_score: number;
  video_completion_rate: number;
  lms_active_days: number;
  risk_prediction: RiskPrediction | null;
  snapshot_date: string;
}

export interface RiskDistribution {
  low_count: number;
  medium_count: number;
  high_count: number;
  total_count: number;
}

export interface CohortStats {
  course_id: string;
  total_students: number;
  avg_risk_score: number;
  risk_distribution: RiskDistribution;
  avg_quiz_score: number;
  avg_forum_activity: number;
  avg_video_completion: number;
  computed_at: string;
}

// -----------------------------------------------
// 개입 관련 타입
// -----------------------------------------------
export type InterventionType =
  | "EMAIL_ALERT"
  | "COUNSELING_REQUEST"
  | "PEER_SUPPORT"
  | "RESOURCE_SHARE"
  | "PROFESSOR_MEETING";

export type InterventionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "DELIVERED"
  | "CANCELLED";

export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface InterventionApproval {
  id: string;
  approver_pseudo_id: string;
  approved: boolean;
  note: string | null;
  decided_at: string;
}

export interface Intervention {
  id: string;
  target_pseudo_student_id: string;
  creator_pseudo_id: string;
  intervention_type: InterventionType;
  status: InterventionStatus;
  urgency_level: UrgencyLevel;
  message: string;
  risk_prediction_id: string | null;
  delivered_at: string | null;
  approval: InterventionApproval | null;
  created_at: string;
}

export interface InterventionCreateRequest {
  target_pseudo_student_id: string;
  intervention_type: InterventionType;
  message: string;
  urgency_level: UrgencyLevel;
  risk_prediction_id?: string;
}

// -----------------------------------------------
// 강좌 관련 타입
// -----------------------------------------------
export interface Course {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  institution_code: string;
  semester: string;
  professor_pseudo_id: string;
  max_students: number | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  pseudo_student_id: string;
  course_id: string;
  status: "ACTIVE" | "DROPPED" | "COMPLETED" | "WITHDRAWN";
  grade: string | null;
  created_at: string;
}

// -----------------------------------------------
// API 에러 타입
// -----------------------------------------------
export interface ApiError {
  detail: string;
  status_code?: number;
}

// -----------------------------------------------
// 페이지네이션 타입
// -----------------------------------------------
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// -----------------------------------------------
// 분석 페이지 전용 타입 (컴포넌트 별칭)
// -----------------------------------------------
export interface ReasonCode {
  feature: string;
  shap_value: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface LearnerRisk {
  pseudo_student_id: string;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface LearningPoint {
  week: string;
  score: number;
  cohort_avg: number;
}

export interface Recommendation {
  type: string;
  message: string;
  confidence: number;
}

export interface LearnerAnalytics {
  pseudo_student_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  reason_codes: ReasonCode[];
  calibration_note: string;
  model_version: string;
  computed_at: string;
  learning_curve: LearningPoint[];
  recommendations: Recommendation[];
}

// -----------------------------------------------
// 개입 생성 요청 타입 (컴포넌트 전용)
// -----------------------------------------------
export interface InterventionCreate {
  target_pseudo_student_id: string;
  intervention_type: string;
  message: string;
  urgency: "NORMAL" | "HIGH";
}

// -----------------------------------------------
// 동의 이력 레코드 타입 (컴포넌트 전용)
// -----------------------------------------------
export interface ConsentRecord {
  id: string;
  pseudo_student_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  consent_version: string;
}
