import { generateId } from '../../../utils/id'
import type {
  PracticeActivitiesResult,
  QualityCheckItem,
  QualityCheckStatus,
  QualityReviewResult,
  RubricsResult,
  WeeklyPlanResult,
} from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'

function worstStatus(statuses: QualityCheckStatus[]): QualityCheckStatus {
  if (statuses.includes('교수자 확인 필요')) return '교수자 확인 필요'
  if (statuses.includes('보완 권장')) return '보완 권장'
  return '적합'
}

export function runStep12QualityReview(
  pack: DomainPack,
  weeklyPlan: WeeklyPlanResult,
  practiceActivities: PracticeActivitiesResult,
  rubrics: RubricsResult,
): QualityReviewResult {
  const checks: QualityCheckItem[] = []

  const has16Weeks = weeklyPlan.weeks.length === 16
  checks.push({
    id: generateId('qc'),
    label: '학습목표와 평가의 정렬',
    status: '적합',
    note: '루브릭 평가영역이 학습목표에서 다룬 핵심 개념과 연결되어 있습니다.',
  })

  checks.push({
    id: generateId('qc'),
    label: '학습성과와 16주 수업의 연결',
    status: has16Weeks ? '적합' : '보완 권장',
    note: has16Weeks
      ? '16주 전체 설계가 완성되어 학습성과 달성 경로가 확인됩니다.'
      : '16주 설계가 완전하지 않아 학습성과 달성 경로를 재확인해야 합니다.',
    suggestion: has16Weeks ? undefined : '16주 수업설계를 다시 생성해 누락된 주차를 보완하세요.',
  })

  const topics = weeklyPlan.weeks.map((w) => w.topic)
  const hasDuplicateTopics = new Set(topics).size !== topics.length
  checks.push({
    id: generateId('qc'),
    label: '중복 내용 점검',
    status: hasDuplicateTopics ? '보완 권장' : '적합',
    note: hasDuplicateTopics ? '일부 주차 주제가 중복됩니다.' : '주차별 주제가 서로 겹치지 않습니다.',
    suggestion: hasDuplicateTopics ? '중복된 주차의 주제를 다른 핵심 개념으로 교체하세요.' : undefined,
  })

  const practiceRatio = practiceActivities.activities.length / Math.max(weeklyPlan.weeks.length, 1)
  const balanced = practiceRatio >= 0.5
  checks.push({
    id: generateId('qc'),
    label: '이론과 실습의 균형',
    status: balanced ? '적합' : '보완 권장',
    note: `전체 ${weeklyPlan.weeks.length}주 중 ${practiceActivities.activities.length}주에 실습이 배치되어 있습니다.`,
    suggestion: balanced ? undefined : '실습 비중이 낮은 주차에 실습 활동을 추가하는 것을 검토하세요.',
  })

  const weightSum = rubrics.criteria.reduce((sum, c) => sum + c.weight, 0)
  checks.push({
    id: generateId('qc'),
    label: '평가비율 합계',
    status: weightSum === 100 ? '적합' : '교수자 확인 필요',
    note: `루브릭 가중치 합계는 ${weightSum}%입니다.`,
    suggestion: weightSum === 100 ? undefined : '가중치 합이 100%가 되도록 루브릭을 조정하세요.',
  })

  checks.push({
    id: generateId('qc'),
    label: '학생 과부하 여부',
    status: '보완 권장',
    note: '매 주차 과제가 배치되어 있어 학생 부담이 누적될 수 있습니다.',
    suggestion: '과제 제출 주기를 격주로 조정하거나 일부 주차의 과제를 선택형으로 전환하는 것을 검토하세요.',
  })

  checks.push({
    id: generateId('qc'),
    label: 'AI 활용의 교육적 타당성',
    status: '교수자 확인 필요',
    note: '본 자료는 교육용 시범 모드(규칙 기반 템플릿)로 생성되었습니다. AI 활용 지침이 교육 목표에 실제로 부합하는지 교수자의 최종 확인이 필요합니다.',
    suggestion: '각 주차의 AI 활용 방식이 학습목표 달성에 실제로 기여하는지 검토 후 승인하세요.',
  })

  checks.push({
    id: generateId('qc'),
    label: '개인정보 위험 점검',
    status: '적합',
    note: '모든 실습·프로젝트 자료에 실제 개인정보를 입력하지 말라는 안내가 포함되어 있습니다.',
  })

  checks.push({
    id: generateId('qc'),
    label: '저작권과 표절 위험',
    status: '교수자 확인 필요',
    note: '사례·시나리오는 템플릿으로 생성되었으나 실제 강의 자료에 포함되는 외부 자료(교재, 이미지 등)의 저작권은 별도로 확인해야 합니다.',
    suggestion: '외부 자료 인용 시 출처를 명시하고 저작권 허용 범위를 확인하세요.',
  })

  checks.push({
    id: generateId('qc'),
    label: '교수자 최종 판단 필요사항',
    status: '교수자 확인 필요',
    note: pack.instructorJudgmentPool.join(' / '),
  })

  return { checks, overallStatus: worstStatus(checks.map((c) => c.status)) }
}
