import type { CourseContext } from '../../../types/agent'
import type { DomainPack } from './types'
import { nursingPack } from './nursing'
import { aviationPack } from './aviation'
import { businessServicePack } from './businessService'
import { christianEducationPack } from './christianEducation'
import { computingPack } from './computing'
import { educationPack } from './education'
import { buildGeneralPack } from './general'

const HAND_AUTHORED_PACKS: DomainPack[] = [
  nursingPack,
  aviationPack,
  businessServicePack,
  christianEducationPack,
  computingPack,
  educationPack,
]

/** 과목명·전공·핵심학습내용 텍스트를 보고 가장 잘 맞는 도메인 팩을 고른다. 없으면 general로 동적 폴백. */
export function resolveDomainPack(context: CourseContext): DomainPack {
  const haystack = `${context.major} ${context.courseName} ${context.keyContent} ${context.goal}`.toLowerCase()

  let best: { pack: DomainPack; score: number } | null = null
  for (const pack of HAND_AUTHORED_PACKS) {
    const score = pack.matchKeywords.reduce((acc, kw) => (haystack.includes(kw.toLowerCase()) ? acc + 1 : acc), 0)
    if (score > 0 && (!best || score > best.score)) {
      best = { pack, score }
    }
  }

  return best ? best.pack : buildGeneralPack(context)
}

export { HAND_AUTHORED_PACKS }
export type { DomainPack }
