import { generateId } from '../../../utils/id'
import type { AiToolMappingResult, CourseContext, WeeklyPlanResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

export function runStep05AiToolMapping(
  context: CourseContext,
  pack: DomainPack,
  weeklyPlan: WeeklyPlanResult,
): AiToolMappingResult {
  const nonExamWeeks = weeklyPlan.weeks.filter((w) => !w.isExamWeek).map((w) => w.week)
  const chunkSize = Math.max(1, Math.ceil(nonExamWeeks.length / Math.max(pack.aiTools.length, 1)))

  const tools = pack.aiTools.map((seed, idx) => ({
    id: generateId('tool'),
    name: seed.name,
    purpose: seed.purpose,
    applicableWeeks: nonExamWeeks.slice(idx * chunkSize, (idx + 1) * chunkSize),
    instructorUse: `${seed.instructorUse} (${context.aiUsageLevel} 방침에 따라 사용 범위 조정)`,
    studentUse: seed.studentUse,
    cautions: seed.caution,
    alternatives: seed.alternative,
  }))

  return { tools }
}
