// AI 설계 에이전트 전용 타입 정의
// 기존 src/types/index.ts(ProjectData 등)와는 완전히 분리된 별도 도메인이다.

export type StepStatus =
  | '대기'
  | '실행 중'
  | '생성 완료'
  | '검토 필요'
  | '승인 완료'
  | '수정 완료'
  | '오류'
  | '재시도 중'

export type RunMode = 'auto' | 'stepApproval'
export type RunState = 'idle' | 'running' | 'paused' | 'stopped' | 'completed' | 'error'

export type StepKey =
  | 'courseAnalysis'
  | 'learningObjectives'
  | 'learningOutcomes'
  | 'weeklyPlan'
  | 'aiToolMapping'
  | 'practiceActivities'
  | 'projectAssignment'
  | 'quizzes'
  | 'rubrics'
  | 'teacherMaterials'
  | 'studentMaterials'
  | 'qualityReview'

export const STEP_KEYS: StepKey[] = [
  'courseAnalysis',
  'learningObjectives',
  'learningOutcomes',
  'weeklyPlan',
  'aiToolMapping',
  'practiceActivities',
  'projectAssignment',
  'quizzes',
  'rubrics',
  'teacherMaterials',
  'studentMaterials',
  'qualityReview',
]

export const STEP_TITLES: Record<StepKey, string> = {
  courseAnalysis: '과목 분석',
  learningObjectives: '학습목표 생성',
  learningOutcomes: '학습성과 생성',
  weeklyPlan: '16주 수업설계',
  aiToolMapping: 'AI 도구 추천',
  practiceActivities: '주차별 실습설계',
  projectAssignment: '프로젝트 생성',
  quizzes: '퀴즈 생성',
  rubrics: '루브릭 생성',
  teacherMaterials: '교수자 자료 생성',
  studentMaterials: '학생 자료 생성',
  qualityReview: '최종 품질검토',
}

// ── 최소 정보 확인용 과목 컨텍스트 ─────────────────────────
export interface CourseContext {
  major: string
  courseName: string
  grade: string
  credit: string
  hoursPerWeek: string
  courseType: string
  goal: string
  keyContent: string
  studentLevel: string
  aiUsageLevel: string
  evaluationStyle: string
  desiredOutputs: string[]
  /** 원문에서 추출하지 못해 기본값을 채운 필드 목록 */
  missingFields: (keyof Omit<CourseContext, 'missingFields' | 'desiredOutputs'>)[]
}

// ── STEP 1: 과목 분석 ─────────────────────────
export interface CourseAnalysisResult {
  courseNature: string
  studentCharacteristics: string
  prerequisites: string
  coreConcepts: string[]
  difficulties: string[]
  aiApplicability: string
  instructorJudgmentNeeded: string[]
}

// ── STEP 2: 학습목표 ─────────────────────────
export type BloomLevel = '인지' | '적용' | '분석' | '평가' | '창출'
export interface LearningObjective {
  id: string
  text: string
  bloomLevel: BloomLevel
}
export interface LearningObjectivesResult {
  objectives: LearningObjective[]
}

// ── STEP 3: 학습성과 ─────────────────────────
export interface LearningOutcome {
  id: string
  statement: string
  achievementCriteria: string
  evaluationMethod: string
  relatedObjectiveIds: string[]
}
export interface LearningOutcomesResult {
  outcomes: LearningOutcome[]
}

// ── STEP 4: 16주 수업설계 ─────────────────────────
export interface WeekPlanRow {
  week: number
  topic: string
  objectives: string
  coreConcepts: string
  teachingActivities: string
  studentActivities: string
  aiUsage: string
  practice: string
  assignment: string
  evaluation: string
  materials: string
  isExamWeek: boolean
}
export interface WeeklyPlanResult {
  weeks: WeekPlanRow[]
}

// ── STEP 5: AI 도구 추천 ─────────────────────────
export interface AiToolRecommendation {
  id: string
  name: string
  purpose: string
  applicableWeeks: number[]
  instructorUse: string
  studentUse: string
  cautions: string
  alternatives: string
}
export interface AiToolMappingResult {
  tools: AiToolRecommendation[]
}

// ── STEP 6: 주차별 실습설계 ─────────────────────────
export interface PracticeActivity {
  id: string
  week: number
  name: string
  goal: string
  materials: string
  procedure: string[]
  estimatedTime: string
  studentOutput: string
  aiUsageSteps: string
  verificationActivity: string
  feedbackPoints: string
}
export interface PracticeActivitiesResult {
  activities: PracticeActivity[]
}

// ── STEP 7: 프로젝트 생성 ─────────────────────────
export interface ProjectSchedulePhase {
  phase: string
  week: number
  description: string
}
export interface ProjectAssignmentResult {
  name: string
  problemStatement: string
  performanceGoals: string
  teamComposition: string
  schedule: ProjectSchedulePhase[]
  deliverables: string[]
  aiUsageRules: string[]
  ethicsGuidelines: string[]
  evaluationCriteria: string
}

// ── STEP 8: 퀴즈 생성 ─────────────────────────
export type AgentQuizType = 'OX' | '객관식' | '단답형' | '사례형'
export type AgentQuizDifficulty = '기초' | '보통' | '심화'
export interface AgentQuizItem {
  id: string
  type: AgentQuizType
  difficulty: AgentQuizDifficulty
  question: string
  options?: string[]
  answer: string
  explanation: string
  relatedObjectiveId: string
}
export interface QuizzesResult {
  items: AgentQuizItem[]
}

// ── STEP 9: 루브릭 생성 ─────────────────────────
export interface AgentRubricCriterion {
  id: string
  area: string
  weight: number
  excellent: string
  good: string
  fair: string
  poor: string
  scoreRange: string
  feedbackPhrase: string
}
export interface RubricsResult {
  criteria: AgentRubricCriterion[]
}

// ── STEP 10: 교수자 자료 ─────────────────────────
export interface TeacherWeeklyMaterial {
  week: number
  lectureOutline: string
  openingRemarks: string
  sampleQuestions: string[]
  discussionPrompts: string[]
  practiceGuide: string
  feedbackExamples: string
  closingRemarks: string
}
export interface PptSlidePlan {
  week: number
  slides: string[]
}
export interface TeacherMaterialsResult {
  weekly: TeacherWeeklyMaterial[]
  pptOutline: PptSlidePlan[]
}

// ── STEP 11: 학생 자료 ─────────────────────────
export interface StudentWeeklyMaterial {
  week: number
  guide: string
  conceptSummary: string
  worksheet: string
  aiPrompts: string[]
  selfCheck: string[]
  assignmentGuide: string
  reflectionQuestions: string[]
  aiVerificationChecklist: string[]
}
export interface StudentMaterialsResult {
  weekly: StudentWeeklyMaterial[]
}

// ── STEP 12: 최종 품질검토 ─────────────────────────
export type QualityCheckStatus = '적합' | '보완 권장' | '교수자 확인 필요'
export interface QualityCheckItem {
  id: string
  label: string
  status: QualityCheckStatus
  note: string
  suggestion?: string
}
export interface QualityReviewResult {
  checks: QualityCheckItem[]
  overallStatus: QualityCheckStatus
}

export interface StepResultMap {
  courseAnalysis: CourseAnalysisResult
  learningObjectives: LearningObjectivesResult
  learningOutcomes: LearningOutcomesResult
  weeklyPlan: WeeklyPlanResult
  aiToolMapping: AiToolMappingResult
  practiceActivities: PracticeActivitiesResult
  projectAssignment: ProjectAssignmentResult
  quizzes: QuizzesResult
  rubrics: RubricsResult
  teacherMaterials: TeacherMaterialsResult
  studentMaterials: StudentMaterialsResult
  qualityReview: QualityReviewResult
}

export type AnyStepResult = StepResultMap[StepKey]

// ── 워크플로 상태 ─────────────────────────
export interface AgentStepState<K extends StepKey = StepKey> {
  id: number
  key: K
  title: string
  status: StepStatus
  result: StepResultMap[K] | null
  error?: string
  retryCount: number
  history: { label: string; at: string }[]
  /** '직접 수정'으로 자유 편집한 텍스트가 있으면 렌더링/최종 패키지에서 이 값을 우선 사용한다 */
  manualOverrideText?: string
}

export interface FollowUpLogEntry {
  id: string
  command: string
  targetSteps: StepKey[]
  summary: string
  matched: boolean
  at: string
}

export interface FinalPackageCard {
  id: string
  order: number
  title: string
  sourceStepKeys: StepKey[]
  content: string
  wordSupported: boolean
  kind: 'document' | 'slideOutline'
}

export interface AgentProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  initialRequest: string
  context: CourseContext
  mode: RunMode
  steps: AgentStepState[]
  currentStepIndex: number
  runState: RunState
  followUpLog: FollowUpLogEntry[]
  finalPackage: FinalPackageCard[] | null
}

export interface AiConnectionStatus {
  connected: boolean
  label: string
}
