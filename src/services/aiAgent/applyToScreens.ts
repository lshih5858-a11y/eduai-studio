import { generateId } from '../../utils/id'
import type {
  CourseInfo,
  FeedbackSet,
  QuizSet,
  Rubric,
  TutorQuestion,
  WeekPlan,
} from '../../types'
import type { AgentProject } from '../../types/agent'

// AI 설계 에이전트 결과 → 기존 8개 메뉴가 쓰는 데이터 타입으로의 변환.
// 실제 반영(setter 호출)은 ApplyToScreensModal에서 사용자 최종 승인 후에만 수행한다.

export function toCourseInfo(project: AgentProject): CourseInfo {
  const { context } = project
  const analysis = project.steps.find((s) => s.key === 'courseAnalysis')?.result as
    | { courseNature: string }
    | undefined
  return {
    major: context.major,
    courseName: context.courseName,
    grade: context.grade,
    credit: context.credit,
    hoursPerWeek: context.hoursPerWeek,
    courseType: context.courseType,
    overview: analysis?.courseNature ?? context.goal,
    objectives: context.goal,
    evaluationMethod: context.evaluationStyle,
    textbooks: '',
    updatedAt: new Date().toISOString(),
  }
}

export function toWeekPlans(project: AgentProject): WeekPlan[] {
  const weekly = project.steps.find((s) => s.key === 'weeklyPlan')?.result as
    | { weeks: { week: number; topic: string; objectives: string; coreConcepts: string; teachingActivities: string; studentActivities: string; aiUsage: string; assignment: string; evaluation: string }[] }
    | undefined
  if (!weekly) return []
  return weekly.weeks.map((w) => ({
    week: w.week,
    topic: w.topic,
    objectives: w.objectives,
    keyConcepts: w.coreConcepts,
    teachingActivities: w.teachingActivities,
    studentActivities: w.studentActivities,
    aiUsage: w.aiUsage,
    assignment: w.assignment,
    evaluationMethod: w.evaluation,
  }))
}

export function toQuizSet(project: AgentProject): QuizSet | null {
  const quizzes = project.steps.find((s) => s.key === 'quizzes')?.result as
    | { items: { id: string; type: QuizSet['items'][number]['type']; difficulty: QuizSet['items'][number]['difficulty']; question: string; options?: string[]; answer: string; explanation: string }[] }
    | undefined
  if (!quizzes) return null
  return {
    id: generateId('set'),
    title: `${project.context.courseName} · AI 설계 에이전트 생성 퀴즈`,
    createdAt: new Date().toISOString(),
    items: quizzes.items.map((q) => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    })),
  }
}

export function toRubric(project: AgentProject): Rubric | null {
  const rubrics = project.steps.find((s) => s.key === 'rubrics')?.result as
    | { criteria: { id: string; area: string; weight: number; excellent: string; good: string; fair: string; poor: string }[] }
    | undefined
  if (!rubrics) return null
  return {
    id: generateId('rubric'),
    assignmentName: `${project.context.courseName} 종합 평가`,
    purpose: 'AI 설계 에이전트가 생성한 평가 루브릭',
    criteria: rubrics.criteria.map((c) => ({
      id: c.id,
      name: c.area,
      maxPoints: c.weight,
      levels: [
        { level: '우수', description: c.excellent, points: c.weight },
        { level: '양호', description: c.good, points: Math.round(c.weight * 0.8) },
        { level: '보통', description: c.fair, points: Math.round(c.weight * 0.6) },
        { level: '미흡', description: c.poor, points: Math.round(c.weight * 0.3) },
      ],
    })),
    updatedAt: new Date().toISOString(),
  }
}

export function toFeedbackSet(project: AgentProject): FeedbackSet | null {
  const projectStep = project.steps.find((s) => s.key === 'projectAssignment')?.result as
    | { name: string; evaluationCriteria: string }
    | undefined
  if (!projectStep) return null
  return {
    id: generateId('feedback'),
    assignmentTitle: projectStep.name,
    answers: [],
    overallComment: 'AI 설계 에이전트가 생성한 프로젝트 평가기준입니다. 실제 학생 제출물을 등록해 개별 피드백을 작성하세요.',
    instructorReview: projectStep.evaluationCriteria,
    updatedAt: new Date().toISOString(),
  }
}

export function toTutorQuestions(project: AgentProject): TutorQuestion[] {
  const studentMaterials = project.steps.find((s) => s.key === 'studentMaterials')?.result as
    | { weekly: { week: number; guide: string; conceptSummary: string; aiPrompts: string[]; reflectionQuestions: string[] }[] }
    | undefined
  if (!studentMaterials) return []
  return studentMaterials.weekly.slice(0, 6).map((w) => ({
    id: generateId('tutor'),
    major: project.context.major,
    question: w.reflectionQuestions[0] ?? `${w.conceptSummary}에 대해 더 알고 싶어요.`,
    sampleAnswer: w.guide,
    keyConcepts: w.conceptSummary.split(/[,、]/).map((c) => c.trim()).filter(Boolean),
    followUpQuestions: w.aiPrompts,
  }))
}
