import { generateId } from '../../../utils/id'
import type { CourseContext, PracticeActivitiesResult, WeeklyPlanResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { pick } from './helpers'

export function runStep06PracticeActivities(
  context: CourseContext,
  pack: DomainPack,
  weeklyPlan: WeeklyPlanResult,
): PracticeActivitiesResult {
  const practiceWeeks = weeklyPlan.weeks.filter((w) => !w.isExamWeek && w.week !== 1)

  const activities = practiceWeeks.map((w, idx) => ({
    id: generateId('practice'),
    week: w.week,
    name: `${w.week}주차 · ${pick(pack.practiceNamesPool, idx)}`,
    goal: w.objectives,
    materials: w.materials,
    procedure: [
      `1) ${w.teachingActivities}`,
      `2) ${w.studentActivities}`,
      `3) 결과물 상호 점검 및 교수자 피드백`,
    ],
    estimatedTime: context.hoursPerWeek,
    studentOutput: `${w.topic} 관련 실습 산출물(워크시트/체크리스트)`,
    aiUsageSteps: w.aiUsage,
    verificationActivity: `${context.evaluationStyle} 기준에 따른 동료·교수자 검증`,
    feedbackPoints: `${w.coreConcepts} 이해도, 절차 정확성, ${context.aiUsageLevel}에 맞는 AI 활용 적절성`,
  }))

  return { activities }
}
