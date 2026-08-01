import { generateId } from '../../../utils/id'
import type { BloomLevel, CourseContext, LearningObjectivesResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { pick } from './helpers'

const BLOOM_SEQUENCE: BloomLevel[] = ['인지', '적용', '분석', '평가', '창출', '인지', '적용']

const VERBS: Record<BloomLevel, string[]> = {
  인지: ['설명할', '정의할', '기술할'],
  적용: ['적용할', '수행할', '실행할'],
  분석: ['분석할', '비교·구분할'],
  평가: ['평가할', '비판적으로 판단할'],
  창출: ['설계할', '기획·제작할'],
}

export function runStep02LearningObjectives(
  context: CourseContext,
  pack: DomainPack,
): LearningObjectivesResult {
  const concepts = pack.coreConcepts
  const objectives = BLOOM_SEQUENCE.map((level, idx) => {
    const concept = pick(concepts, idx)
    const verb = pick(VERBS[level], idx)
    return {
      id: generateId('obj'),
      bloomLevel: level,
      text: `${context.courseName} 학습자는 ${concept}을(를) ${context.studentLevel}에 맞게 ${verb} 수 있다.`,
    }
  })

  return { objectives }
}
