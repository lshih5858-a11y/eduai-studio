import type { CourseContext } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

export function pick<T>(arr: T[], idx: number): T {
  return arr[((idx % arr.length) + arr.length) % arr.length]
}

export function intensityPhrase(context: CourseContext): string {
  return `${context.credit} · ${context.hoursPerWeek} · ${context.courseType}`
}

/** 16주 구조: 1주 오리엔테이션, 2~7주 핵심모듈, 8주 정리/9주 중간고사, 10~14주 응용모듈, 15주 종합실습, 16주 기말고사 */
export const WEEK_STRUCTURE = {
  orientation: 1,
  coreModuleWeeks: [2, 3, 4, 5, 6, 7],
  midtermReviewWeek: 8,
  midtermExamWeek: 9,
  advancedModuleWeeks: [10, 11, 12, 13, 14],
  integrationWeek: 15,
  finalExamWeek: 16,
} as const

export function isExamOrReviewWeek(week: number): boolean {
  return (
    week === WEEK_STRUCTURE.midtermReviewWeek ||
    week === WEEK_STRUCTURE.midtermExamWeek ||
    week === WEEK_STRUCTURE.finalExamWeek
  )
}

export function domainWeekTopicForWeek(pack: DomainPack, week: number) {
  const idx = WEEK_STRUCTURE.coreModuleWeeks.includes(week as never)
    ? WEEK_STRUCTURE.coreModuleWeeks.indexOf(week as never)
    : WEEK_STRUCTURE.advancedModuleWeeks.includes(week as never)
      ? WEEK_STRUCTURE.coreModuleWeeks.length + WEEK_STRUCTURE.advancedModuleWeeks.indexOf(week as never)
      : -1
  if (idx < 0) return null
  return pick(pack.weekTopics, idx)
}
