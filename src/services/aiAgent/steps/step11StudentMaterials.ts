import type { StudentMaterialsResult, WeeklyPlanResult } from '../../../types/agent'

export function runStep11StudentMaterials(weeklyPlan: WeeklyPlanResult): StudentMaterialsResult {
  const weekly = weeklyPlan.weeks.map((w) => ({
    week: w.week,
    guide: `이번 주차는 '${w.topic}'을(를) 배웁니다. 학습목표: ${w.objectives}`,
    conceptSummary: w.coreConcepts,
    worksheet: w.isExamWeek ? '해당 없음(시험 주차)' : `${w.topic} 관련 실습 워크시트: ${w.practice}`,
    aiPrompts: w.isExamWeek
      ? []
      : [`"${w.topic}의 핵심 개념을 초보자도 이해할 수 있게 설명해줘"`, `"${w.coreConcepts}와 관련된 예시를 3가지 들어줘"`],
    selfCheck: [`${w.topic}의 핵심 개념을 나만의 언어로 설명할 수 있는가?`, '이번 주 과제 제출 전 체크리스트를 확인했는가?'],
    assignmentGuide: w.assignment,
    reflectionQuestions: w.isExamWeek
      ? ['이번 시험을 준비하며 가장 어려웠던 부분은 무엇이었는가?']
      : [`${w.topic}을(를) 배우기 전과 후, 내 생각은 어떻게 달라졌는가?`],
    aiVerificationChecklist: [
      'AI 답변에 사실과 다르거나 근거가 불명확한 부분은 없는가?',
      '개인정보나 민감정보를 AI에 입력하지 않았는가?',
      'AI 답변을 그대로 제출하지 않고 스스로 이해·수정했는가?',
    ],
  }))

  return { weekly }
}
