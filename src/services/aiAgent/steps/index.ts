import type { AnyStepResult, CourseContext, StepKey, StepResultMap } from '../../../types/agent'
import { STEP_KEYS, STEP_TITLES } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { runStep01CourseAnalysis } from './step01CourseAnalysis'
import { runStep02LearningObjectives } from './step02LearningObjectives'
import { runStep03LearningOutcomes } from './step03LearningOutcomes'
import { runStep04WeeklyPlan } from './step04WeeklyPlan'
import { runStep05AiToolMapping } from './step05AiToolMapping'
import { runStep06PracticeActivities } from './step06PracticeActivities'
import { runStep07ProjectAssignment } from './step07ProjectAssignment'
import { runStep08Quizzes } from './step08Quizzes'
import { runStep09Rubrics } from './step09Rubrics'
import { runStep10TeacherMaterials } from './step10TeacherMaterials'
import { runStep11StudentMaterials } from './step11StudentMaterials'
import { runStep12QualityReview } from './step12QualityReview'

export interface StepDefinition {
  id: number
  key: StepKey
  title: string
}

export const STEP_DEFINITIONS: StepDefinition[] = STEP_KEYS.map((key, idx) => ({
  id: idx + 1,
  key,
  title: STEP_TITLES[key],
}))

export class StepGenerationError extends Error {}

/** 시작 전 필수 컨텍스트 검증. 부족하면 오류를 던져 워크플로가 '오류' 상태로 전환되도록 한다(섹션13). */
export function validateContextForRun(context: CourseContext): void {
  if (!context.courseName || context.courseName.trim().length === 0) {
    throw new StepGenerationError('필수 과목정보(과목명)가 없어 설계를 시작할 수 없습니다.')
  }
}

type PartialResults = Partial<StepResultMap>

/** 특정 스텝을 실행한다. 이전 단계 결과(prior)가 필요한 스텝인데 없으면 오류를 던진다. */
export function runStep(key: StepKey, context: CourseContext, pack: DomainPack, prior: PartialResults): AnyStepResult {
  switch (key) {
    case 'courseAnalysis':
      return runStep01CourseAnalysis(context, pack)
    case 'learningObjectives':
      return runStep02LearningObjectives(context, pack)
    case 'learningOutcomes': {
      const objectives = prior.learningObjectives
      if (!objectives) throw new StepGenerationError('학습목표 결과가 없어 학습성과를 생성할 수 없습니다.')
      return runStep03LearningOutcomes(context, pack, objectives)
    }
    case 'weeklyPlan':
      return runStep04WeeklyPlan(context, pack)
    case 'aiToolMapping': {
      const weeklyPlan = prior.weeklyPlan
      if (!weeklyPlan) throw new StepGenerationError('16주 수업설계 결과가 없어 AI 도구를 추천할 수 없습니다.')
      return runStep05AiToolMapping(context, pack, weeklyPlan)
    }
    case 'practiceActivities': {
      const weeklyPlan = prior.weeklyPlan
      if (!weeklyPlan) throw new StepGenerationError('16주 수업설계 결과가 없어 실습을 설계할 수 없습니다.')
      return runStep06PracticeActivities(context, pack, weeklyPlan)
    }
    case 'projectAssignment':
      return runStep07ProjectAssignment(context, pack)
    case 'quizzes': {
      const objectives = prior.learningObjectives
      if (!objectives) throw new StepGenerationError('학습목표 결과가 없어 퀴즈를 생성할 수 없습니다.')
      return runStep08Quizzes(context, pack, objectives)
    }
    case 'rubrics':
      return runStep09Rubrics(context, pack)
    case 'teacherMaterials': {
      const weeklyPlan = prior.weeklyPlan
      if (!weeklyPlan) throw new StepGenerationError('16주 수업설계 결과가 없어 교수자 자료를 생성할 수 없습니다.')
      return runStep10TeacherMaterials(weeklyPlan)
    }
    case 'studentMaterials': {
      const weeklyPlan = prior.weeklyPlan
      if (!weeklyPlan) throw new StepGenerationError('16주 수업설계 결과가 없어 학생 자료를 생성할 수 없습니다.')
      return runStep11StudentMaterials(weeklyPlan)
    }
    case 'qualityReview': {
      const weeklyPlan = prior.weeklyPlan
      const practiceActivities = prior.practiceActivities
      const rubrics = prior.rubrics
      if (!weeklyPlan || !practiceActivities || !rubrics) {
        throw new StepGenerationError('이전 단계 결과가 부족해 품질검토를 수행할 수 없습니다.')
      }
      return runStep12QualityReview(pack, weeklyPlan, practiceActivities, rubrics)
    }
    default:
      throw new StepGenerationError(`알 수 없는 스텝입니다: ${key}`)
  }
}
