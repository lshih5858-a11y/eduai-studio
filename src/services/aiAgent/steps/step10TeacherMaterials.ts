import type { TeacherMaterialsResult, WeeklyPlanResult } from '../../../types/agent'

export function runStep10TeacherMaterials(weeklyPlan: WeeklyPlanResult): TeacherMaterialsResult {
  const weekly = weeklyPlan.weeks.map((w) => ({
    week: w.week,
    lectureOutline: `${w.topic} — ${w.coreConcepts}. 도입(10분) → 개념 설명(${w.teachingActivities}, 20~30분) → 실습/적용(${w.practice}, 나머지 시간)`,
    openingRemarks: w.isExamWeek
      ? `오늘은 ${w.topic}입니다. 그동안 준비한 내용을 차분히 정리해서 응시해봅시다.`
      : `오늘은 '${w.topic}'을(를) 다룹니다. 지난 시간 배운 내용과 어떻게 연결되는지 생각하며 시작해볼까요?`,
    sampleQuestions: w.isExamWeek
      ? [`${w.coreConcepts} 중 자신 없는 부분이 있나요?`]
      : [`${w.topic}에서 가장 중요한 개념은 무엇일까요?`, `이 개념을 실제 상황에 적용한다면 어떤 예가 있을까요?`],
    discussionPrompts: w.isExamWeek
      ? []
      : [`${w.topic}과(와) 관련된 경험이나 사례를 나눠봅시다.`, `AI를 활용한다면 이 주제에서 어떤 도움을 받을 수 있을까요?`],
    practiceGuide: w.practice,
    feedbackExamples: `잘한 점: ${w.coreConcepts} 이해가 명확합니다. 보완할 점: ${w.assignment}을(를) 조금 더 구체화해보세요.`,
    closingRemarks: w.isExamWeek
      ? '수고 많았습니다. 다음 시간에는 결과를 함께 확인하겠습니다.'
      : `오늘 배운 ${w.coreConcepts}를 복습하고, 다음 시간 주제도 미리 살펴봐주세요.`,
  }))

  const pptOutline = weeklyPlan.weeks.map((w) => ({
    week: w.week,
    slides: [
      `${w.week}주차: ${w.topic}`,
      '학습목표',
      `핵심개념: ${w.coreConcepts}`,
      `수업활동: ${w.teachingActivities}`,
      `실습/적용: ${w.practice}`,
      `AI 활용: ${w.aiUsage}`,
      '정리 및 다음 주 예고',
    ],
  }))

  return { weekly, pptOutline }
}
