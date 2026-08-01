import { generateId } from '../../../utils/id'
import type { CourseContext, RubricsResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

interface CriterionSeed {
  area: string
  weight: number
}

export function runStep09Rubrics(context: CourseContext, pack: DomainPack): RubricsResult {
  const concept1 = pack.coreConcepts[0]
  const concept2 = pack.coreConcepts[1] ?? pack.coreConcepts[0]

  const seeds: CriterionSeed[] = [
    { area: `${concept1} 이해도`, weight: 25 },
    { area: `${concept2} 적용·수행 능력`, weight: 25 },
    { area: '협업 및 의사소통', weight: 15 },
    { area: `AI 활용의 적절성(${context.aiUsageLevel})`, weight: 15 },
    { area: '결과물 완성도 및 표현', weight: 20 },
  ]

  const totalWeight = seeds.reduce((sum, s) => sum + s.weight, 0)
  if (totalWeight !== 100) {
    // 방어적 정규화: 가중치 합이 항상 100이 되도록 마지막 항목에서 보정한다.
    seeds[seeds.length - 1].weight += 100 - totalWeight
  }

  const criteria = seeds.map((seed) => ({
    id: generateId('rubric'),
    area: seed.area,
    weight: seed.weight,
    excellent: `${seed.area} 측면에서 오류 없이 정확하고 창의적으로 수행함`,
    good: `${seed.area} 측면에서 대체로 정확하게 수행했으나 일부 보완이 필요함`,
    fair: `${seed.area} 측면에서 기본 요건은 충족했으나 깊이나 정확성이 부족함`,
    poor: `${seed.area} 측면에서 기본 요건을 충족하지 못함`,
    scoreRange: `${Math.round(seed.weight * 0.9)}~${seed.weight}점 / 우수, ${Math.round(seed.weight * 0.4)}점 미만 / 미흡`,
    feedbackPhrase: `${seed.area}를 더 발전시키려면 ${pack.instructorJudgmentPool[0] ?? '교수자 피드백'}을 참고하세요.`,
  }))

  return { criteria }
}
