import { generateId } from '../../../utils/id'
import type { CourseContext, LearningObjectivesResult, LearningOutcomesResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

export function runStep03LearningOutcomes(
  context: CourseContext,
  pack: DomainPack,
  objectivesResult: LearningObjectivesResult,
): LearningOutcomesResult {
  const objectives = objectivesResult.objectives
  const groups: (typeof objectives)[] = []
  for (let i = 0; i < objectives.length; i += 2) {
    groups.push(objectives.slice(i, i + 2))
  }

  const outcomes = groups.map((group, idx) => {
    const relatedConcept = pack.coreConcepts[idx % pack.coreConcepts.length]
    return {
      id: generateId('outcome'),
      statement: `${context.courseName} 수강 후 학습자는 ${relatedConcept}을(를) 실제 상황에 적용해 성과물을 산출할 수 있다.`,
      achievementCriteria: `${relatedConcept} 관련 과제·실습에서 ${context.studentLevel} 기준 80% 이상의 수행 정확도를 달성한다.`,
      evaluationMethod: context.evaluationStyle,
      relatedObjectiveIds: group.map((o) => o.id),
    }
  })

  return { outcomes }
}
