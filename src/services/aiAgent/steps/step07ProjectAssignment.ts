import type { CourseContext, ProjectAssignmentResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { pick } from './helpers'

export function runStep07ProjectAssignment(context: CourseContext, pack: DomainPack): ProjectAssignmentResult {
  const theme = pick(pack.projectThemePool, 0)
  const scenario = pick(pack.caseScenarioPool, 0)

  return {
    name: `${context.courseName} 종합 프로젝트: ${theme}`,
    problemStatement: `${scenario}을(를) 바탕으로, ${context.courseName}에서 학습한 개념을 적용해 실제적인 해결안을 제시한다.`,
    performanceGoals: `${pack.coreConcepts.slice(0, 3).join(', ')}를 통합적으로 적용해 실행 가능한 결과물을 산출한다.`,
    teamComposition: '3~4인 1조, 역할 분담(자료조사·설계·발표·문서화)',
    schedule: [
      { phase: '주제 확정 및 계획 수립', week: 10, description: '팀 구성, 주제 확정, 역할 분담' },
      { phase: '자료조사 및 분석', week: 11, description: '관련 사례·자료 조사 및 문제 정의' },
      { phase: '설계 및 초안 작성', week: 12, description: '해결안 설계 및 초안 작성, AI 활용 브레인스토밍' },
      { phase: '중간 점검', week: 13, description: '조별 중간 발표 및 동료 피드백 반영' },
      { phase: '결과물 완성', week: 14, description: '최종 결과물 완성 및 검토' },
      { phase: '최종 발표', week: 15, description: '전체 발표 및 상호 평가' },
    ],
    deliverables: ['프로젝트 계획서', '중간 발표 자료', '최종 결과 보고서', '발표 슬라이드'],
    aiUsageRules: [
      `AI는 자료조사·아이디어 브레인스토밍 보조 도구로 ${context.aiUsageLevel} 범위에서 사용한다.`,
      'AI가 생성한 내용을 그대로 제출하지 않고 팀원이 직접 검증·수정한 내용만 인정한다.',
      '실제 개인정보나 민감정보는 AI 도구에 입력하지 않는다.',
    ],
    ethicsGuidelines: [...pack.ethicsNotesPool, 'AI 활용 여부와 범위를 보고서에 명시한다(AI 활용 투명성 원칙).'],
    evaluationCriteria: `${context.evaluationStyle} 기준에 따라 문제 이해도, 해결안의 타당성, 팀 협업, AI 활용의 적절성을 종합 평가한다.`,
  }
}
