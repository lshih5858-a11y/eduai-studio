import { generateId } from '../../utils/id'
import type { AgentStepState, CourseContext, FinalPackageCard, StepKey, StepResultMap } from '../../types/agent'
import {
  renderAiToolMapping,
  renderCourseAnalysis,
  renderCustomGptInstructions,
  renderObjectivesAndOutcomes,
  renderPptOutline,
  renderPracticeActivities,
  renderProjectAssignment,
  renderPromptBook,
  renderQualityReview,
  renderQuizzes,
  renderRubrics,
  renderStudentAiGuide,
  renderStudentMaterials,
  renderTeacherMaterials,
  renderWeeklyPlan,
} from './renderText'

function result<K extends StepKey>(steps: AgentStepState[], key: K): StepResultMap[K] {
  const step = steps.find((s) => s.key === key)
  if (!step || !step.result) {
    throw new Error(`${key} 단계 결과가 없어 최종 패키지를 만들 수 없습니다.`)
  }
  return step.result as StepResultMap[K]
}

/** 12개 스텝 결과를 스펙 9번의 15개 최종 결과 카드로 조립한다. */
export function buildFinalPackage(context: CourseContext, steps: AgentStepState[]): FinalPackageCard[] {
  const courseAnalysis = result(steps, 'courseAnalysis')
  const learningObjectives = result(steps, 'learningObjectives')
  const learningOutcomes = result(steps, 'learningOutcomes')
  const weeklyPlan = result(steps, 'weeklyPlan')
  const aiToolMapping = result(steps, 'aiToolMapping')
  const practiceActivities = result(steps, 'practiceActivities')
  const projectAssignment = result(steps, 'projectAssignment')
  const quizzes = result(steps, 'quizzes')
  const rubrics = result(steps, 'rubrics')
  const teacherMaterials = result(steps, 'teacherMaterials')
  const studentMaterials = result(steps, 'studentMaterials')
  const qualityReview = result(steps, 'qualityReview')

  const cards: FinalPackageCard[] = [
    {
      id: generateId('card'),
      order: 1,
      title: '과목 분석 보고서',
      sourceStepKeys: ['courseAnalysis'],
      content: renderCourseAnalysis(courseAnalysis),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 2,
      title: '학습목표 및 학습성과',
      sourceStepKeys: ['learningObjectives', 'learningOutcomes'],
      content: renderObjectivesAndOutcomes(learningObjectives, learningOutcomes),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 3,
      title: '16주 강의계획서',
      sourceStepKeys: ['weeklyPlan'],
      content: renderWeeklyPlan(weeklyPlan),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 4,
      title: '주차별 실습계획',
      sourceStepKeys: ['practiceActivities'],
      content: renderPracticeActivities(practiceActivities),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 5,
      title: 'AI 도구 활용계획',
      sourceStepKeys: ['aiToolMapping'],
      content: renderAiToolMapping(aiToolMapping),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 6,
      title: '프로젝트 안내서',
      sourceStepKeys: ['projectAssignment'],
      content: renderProjectAssignment(projectAssignment),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 7,
      title: '퀴즈 및 정답지',
      sourceStepKeys: ['quizzes'],
      content: renderQuizzes(quizzes),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 8,
      title: '평가 루브릭',
      sourceStepKeys: ['rubrics'],
      content: renderRubrics(rubrics),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 9,
      title: '교수자 강의안',
      sourceStepKeys: ['teacherMaterials'],
      content: renderTeacherMaterials(teacherMaterials),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 10,
      title: 'PPT 슬라이드 구성안',
      sourceStepKeys: ['teacherMaterials'],
      content: renderPptOutline(teacherMaterials),
      wordSupported: false,
      kind: 'slideOutline',
    },
    {
      id: generateId('card'),
      order: 11,
      title: '학생용 워크북',
      sourceStepKeys: ['studentMaterials'],
      content: renderStudentMaterials(studentMaterials),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 12,
      title: '품질검사 보고서',
      sourceStepKeys: ['qualityReview'],
      content: renderQualityReview(qualityReview),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 13,
      title: '교수자용 프롬프트북',
      sourceStepKeys: ['aiToolMapping', 'teacherMaterials'],
      content: renderPromptBook(context, aiToolMapping, teacherMaterials),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 14,
      title: '학생용 AI 활용지침',
      sourceStepKeys: ['studentMaterials'],
      content: renderStudentAiGuide(context, studentMaterials),
      wordSupported: true,
      kind: 'document',
    },
    {
      id: generateId('card'),
      order: 15,
      title: 'Custom GPT 지침 초안',
      sourceStepKeys: ['courseAnalysis'],
      content: renderCustomGptInstructions(context, courseAnalysis),
      wordSupported: true,
      kind: 'document',
    },
  ]

  return cards
}
