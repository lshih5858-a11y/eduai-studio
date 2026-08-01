// 메뉴 키 (사이드바 내비게이션에서 사용)
export type MenuKey =
  | 'home'
  | 'courseSetup'
  | 'weeklyPlan'
  | 'quiz'
  | 'rubric'
  | 'feedback'
  | 'aiTutor'
  | 'designAgent'
  | 'settings'

// 수업 형태
export type CourseFormat = '이론' | '실습' | '이론+실습' | '온라인' | '블렌디드'

// 과목 설정
export interface CourseInfo {
  major: string
  courseName: string
  grade: string
  credit: string
  hoursPerWeek: string
  courseType: CourseFormat | string
  overview: string
  objectives: string
  evaluationMethod: string
  textbooks: string
  updatedAt: string
}

// 16주 수업설계 - 한 주차
export interface WeekPlan {
  week: number
  topic: string
  objectives: string
  keyConcepts: string
  teachingActivities: string
  studentActivities: string
  aiUsage: string
  assignment: string
  evaluationMethod: string
}

// 퀴즈
export type QuizType = 'OX' | '객관식' | '단답형' | '사례형'
export type QuizDifficulty = '기초' | '보통' | '심화'

export interface QuizItem {
  id: string
  type: QuizType
  difficulty: QuizDifficulty
  question: string
  options?: string[]
  answer: string
  explanation: string
}

export interface QuizSet {
  id: string
  title: string
  createdAt: string
  items: QuizItem[]
}

// 루브릭
export interface RubricLevel {
  level: string // 예: 우수, 양호, 보통, 미흡
  description: string
  points: number
}

export interface RubricCriterion {
  id: string
  name: string
  maxPoints: number
  levels: RubricLevel[]
}

export interface Rubric {
  id: string
  assignmentName: string
  purpose: string
  criteria: RubricCriterion[]
  updatedAt: string
}

// 과제 피드백
export interface StudentAnswer {
  id: string
  studentLabel: string
  answerText: string
  strengths: string
  improvements: string
  suggestions: string
}

export interface FeedbackSet {
  id: string
  assignmentTitle: string
  answers: StudentAnswer[]
  overallComment: string
  instructorReview: string
  updatedAt: string
}

// AI 튜터
export interface TutorQuestion {
  id: string
  major: string
  question: string
  sampleAnswer: string
  keyConcepts: string[]
  followUpQuestions: string[]
}

// 예시 과목 전체 패키지 (홈에서 불러오기용)
export interface ExampleCoursePackage {
  id: string
  label: string
  courseInfo: CourseInfo
  weeklyPlan: WeekPlan[]
  quizSets: QuizSet[]
  rubrics: Rubric[]
  feedbackSets: FeedbackSet[]
  tutorQuestions: TutorQuestion[]
}

// localStorage에 저장되는 전체 프로젝트 데이터
export interface ProjectData {
  courseInfo: CourseInfo | null
  weeklyPlan: WeekPlan[]
  quizSets: QuizSet[]
  rubrics: Rubric[]
  feedbackSets: FeedbackSet[]
  tutorQuestions: TutorQuestion[]
  lastLoadedExample?: string
  updatedAt: string
}

export interface SaveStatus {
  message: string
  visible: boolean
}
