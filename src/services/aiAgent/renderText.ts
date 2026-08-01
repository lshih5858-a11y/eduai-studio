import type {
  AiToolMappingResult,
  AnyStepResult,
  CourseAnalysisResult,
  CourseContext,
  LearningObjectivesResult,
  LearningOutcomesResult,
  PracticeActivitiesResult,
  ProjectAssignmentResult,
  QualityReviewResult,
  QuizzesResult,
  RubricsResult,
  StepKey,
  StudentMaterialsResult,
  TeacherMaterialsResult,
  WeeklyPlanResult,
} from '../../types/agent'

// 각 스텝의 구조화 데이터를 사람이 읽는 평문(복사/인쇄/Word에 공용 사용)으로 변환한다.

export function renderCourseAnalysis(r: CourseAnalysisResult): string {
  return [
    `■ 과목 성격\n${r.courseNature}`,
    `■ 대상 학생 특성\n${r.studentCharacteristics}`,
    `■ 선수학습\n${r.prerequisites}`,
    `■ 핵심개념\n${r.coreConcepts.map((c) => `- ${c}`).join('\n')}`,
    `■ 수업 난점\n${r.difficulties.map((d) => `- ${d}`).join('\n')}`,
    `■ AI 활용 가능성\n${r.aiApplicability}`,
    `■ 교수자 판단 필요사항\n${r.instructorJudgmentNeeded.map((d) => `- ${d}`).join('\n')}`,
  ].join('\n\n')
}

export function renderLearningObjectivesOnly(obj: LearningObjectivesResult): string {
  return obj.objectives.map((o, i) => `${i + 1}. [${o.bloomLevel}] ${o.text}`).join('\n')
}

export function renderLearningOutcomesOnly(outcomes: LearningOutcomesResult): string {
  return outcomes.outcomes
    .map(
      (o, i) =>
        `${i + 1}. ${o.statement}\n   달성기준: ${o.achievementCriteria}\n   평가방법: ${o.evaluationMethod}`,
    )
    .join('\n\n')
}

export function renderObjectivesAndOutcomes(obj: LearningObjectivesResult, outcomes: LearningOutcomesResult): string {
  const objText = obj.objectives.map((o, i) => `${i + 1}. [${o.bloomLevel}] ${o.text}`).join('\n')
  const outcomeText = outcomes.outcomes
    .map(
      (o, i) =>
        `${i + 1}. ${o.statement}\n   달성기준: ${o.achievementCriteria}\n   평가방법: ${o.evaluationMethod}`,
    )
    .join('\n\n')
  return `■ 학습목표\n${objText}\n\n■ 학습성과\n${outcomeText}`
}

export function renderWeeklyPlan(r: WeeklyPlanResult): string {
  return r.weeks
    .map(
      (w) =>
        `${w.week}주차 · ${w.topic}${w.isExamWeek ? ' [시험/정리 주차]' : ''}\n` +
        `  학습목표: ${w.objectives}\n  핵심개념: ${w.coreConcepts}\n  교수활동: ${w.teachingActivities}\n` +
        `  학생활동: ${w.studentActivities}\n  AI 활용: ${w.aiUsage}\n  실습: ${w.practice}\n  과제: ${w.assignment}\n` +
        `  평가: ${w.evaluation}\n  준비자료: ${w.materials}`,
    )
    .join('\n\n')
}

export function renderPracticeActivities(r: PracticeActivitiesResult): string {
  return r.activities
    .map(
      (a) =>
        `${a.week}주차 · ${a.name}\n  목표: ${a.goal}\n  준비물: ${a.materials}\n  절차:\n${a.procedure
          .map((p) => `    ${p}`)
          .join('\n')}\n  예상 소요시간: ${a.estimatedTime}\n  학생 산출물: ${a.studentOutput}\n  AI 활용 단계: ${a.aiUsageSteps}\n  검증 활동: ${a.verificationActivity}\n  교수자 피드백 포인트: ${a.feedbackPoints}`,
    )
    .join('\n\n')
}

export function renderAiToolMapping(r: AiToolMappingResult): string {
  return r.tools
    .map(
      (t) =>
        `■ ${t.name}\n  목적: ${t.purpose}\n  적용 주차: ${t.applicableWeeks.join(', ')}주\n  교수자 활용: ${t.instructorUse}\n  학생 활용: ${t.studentUse}\n  주의사항: ${t.cautions}\n  대체 도구: ${t.alternatives}`,
    )
    .join('\n\n')
}

export function renderProjectAssignment(r: ProjectAssignmentResult): string {
  return [
    `■ 프로젝트명\n${r.name}`,
    `■ 문제 상황\n${r.problemStatement}`,
    `■ 수행목표\n${r.performanceGoals}`,
    `■ 팀 구성\n${r.teamComposition}`,
    `■ 단계별 일정\n${r.schedule.map((s) => `- ${s.week}주차 [${s.phase}] ${s.description}`).join('\n')}`,
    `■ 제출물\n${r.deliverables.map((d) => `- ${d}`).join('\n')}`,
    `■ AI 활용 규칙\n${r.aiUsageRules.map((d) => `- ${d}`).join('\n')}`,
    `■ 표절 및 윤리 지침\n${r.ethicsGuidelines.map((d) => `- ${d}`).join('\n')}`,
    `■ 평가기준\n${r.evaluationCriteria}`,
  ].join('\n\n')
}

export function renderQuizzes(r: QuizzesResult): string {
  return r.items
    .map((q, i) => {
      const opts = q.options ? `\n  보기: ${q.options.join(' / ')}` : ''
      return `${i + 1}. [${q.type} · ${q.difficulty}] ${q.question}${opts}\n  정답: ${q.answer}\n  해설: ${q.explanation}`
    })
    .join('\n\n')
}

export function renderRubrics(r: RubricsResult): string {
  const totalWeight = r.criteria.reduce((s, c) => s + c.weight, 0)
  return (
    r.criteria
      .map(
        (c) =>
          `■ ${c.area} (${c.weight}%)\n  우수: ${c.excellent}\n  양호: ${c.good}\n  보통: ${c.fair}\n  미흡: ${c.poor}\n  점수기준: ${c.scoreRange}\n  피드백: ${c.feedbackPhrase}`,
      )
      .join('\n\n') + `\n\n가중치 합계: ${totalWeight}%`
  )
}

export function renderTeacherMaterials(r: TeacherMaterialsResult): string {
  return r.weekly
    .map(
      (w) =>
        `${w.week}주차\n  강의개요: ${w.lectureOutline}\n  진행 멘트(도입): ${w.openingRemarks}\n  질문 예시: ${w.sampleQuestions.join(' / ')}\n  토론 촉진 질문: ${w.discussionPrompts.join(' / ') || '해당 없음'}\n  실습 안내: ${w.practiceGuide}\n  피드백 예시: ${w.feedbackExamples}\n  마무리 멘트: ${w.closingRemarks}`,
    )
    .join('\n\n')
}

export function renderPptOutline(r: TeacherMaterialsResult): string {
  return r.pptOutline.map((p) => `${p.week}주차 슬라이드 구성\n${p.slides.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`).join('\n\n')
}

export function renderStudentMaterials(r: StudentMaterialsResult): string {
  return r.weekly
    .map(
      (w) =>
        `${w.week}주차\n  학습안내: ${w.guide}\n  핵심개념 요약: ${w.conceptSummary}\n  실습 워크시트: ${w.worksheet}\n  AI 활용 프롬프트: ${w.aiPrompts.join(' / ') || '해당 없음'}\n  자기점검표: ${w.selfCheck.join(' / ')}\n  과제 안내: ${w.assignmentGuide}\n  성찰 질문: ${w.reflectionQuestions.join(' / ')}\n  AI 답변 검증 체크리스트: ${w.aiVerificationChecklist.join(' / ')}`,
    )
    .join('\n\n')
}

export function renderQualityReview(r: QualityReviewResult): string {
  const checks = r.checks
    .map((c) => `[${c.status}] ${c.label}\n  ${c.note}${c.suggestion ? `\n  → 수정 제안: ${c.suggestion}` : ''}`)
    .join('\n\n')
  return `종합 판정: ${r.overallStatus}\n\n${checks}`
}

export function renderPromptBook(context: CourseContext, aiTools: AiToolMappingResult, teacher: TeacherMaterialsResult): string {
  const toolPrompts = aiTools.tools
    .map((t) => `■ ${t.name}\n  목적: ${t.purpose}\n  권장 프롬프트 예시: "${t.purpose}를 위한 자료를 만들어줘. 대상은 ${context.courseName} 수강생이며, ${context.studentLevel}에 맞게 작성해줘."\n  주의사항: ${t.cautions}`)
    .join('\n\n')
  const weeklyPrompts = teacher.weekly
    .slice(0, 3)
    .map((w) => `${w.week}주차 강의 준비 프롬프트 예시: "${w.lectureOutline}를 바탕으로 도입부 멘트를 3가지 버전으로 제안해줘."`)
    .join('\n')
  return `[교수자용 AI 프롬프트북]\n대상 과목: ${context.courseName}\nAI 활용 수준: ${context.aiUsageLevel}\n\n${toolPrompts}\n\n■ 주차별 프롬프트 예시\n${weeklyPrompts}\n\n※ 모든 AI 생성 결과는 교수자가 최종 검토 후 사용해야 합니다.`
}

export function renderStudentAiGuide(context: CourseContext, student: StudentMaterialsResult): string {
  const samplePrompts = student.weekly
    .flatMap((w) => w.aiPrompts)
    .slice(0, 6)
    .map((p) => `- ${p}`)
    .join('\n')
  const checklist = Array.from(new Set(student.weekly.flatMap((w) => w.aiVerificationChecklist)))
    .map((c) => `- ${c}`)
    .join('\n')
  return [
    `[학생용 AI 활용 지침]`,
    `과목: ${context.courseName} · AI 활용 수준: ${context.aiUsageLevel}`,
    `■ 사용 가능한 프롬프트 예시\n${samplePrompts}`,
    `■ AI 답변 검증 체크리스트\n${checklist}`,
    `■ 반드시 지켜야 할 원칙\n- 개인정보·민감정보를 AI에 입력하지 않는다.\n- AI 답변을 그대로 제출하지 않고 스스로 이해·검증한 뒤 활용한다.\n- AI 활용 여부와 범위를 과제에 명시한다.`,
  ].join('\n\n')
}

export function renderStepResultText(key: StepKey, r: AnyStepResult): string {
  switch (key) {
    case 'courseAnalysis':
      return renderCourseAnalysis(r as CourseAnalysisResult)
    case 'learningObjectives':
      return renderLearningObjectivesOnly(r as LearningObjectivesResult)
    case 'learningOutcomes':
      return renderLearningOutcomesOnly(r as LearningOutcomesResult)
    case 'weeklyPlan':
      return renderWeeklyPlan(r as WeeklyPlanResult)
    case 'aiToolMapping':
      return renderAiToolMapping(r as AiToolMappingResult)
    case 'practiceActivities':
      return renderPracticeActivities(r as PracticeActivitiesResult)
    case 'projectAssignment':
      return renderProjectAssignment(r as ProjectAssignmentResult)
    case 'quizzes':
      return renderQuizzes(r as QuizzesResult)
    case 'rubrics':
      return renderRubrics(r as RubricsResult)
    case 'teacherMaterials':
      return renderTeacherMaterials(r as TeacherMaterialsResult)
    case 'studentMaterials':
      return renderStudentMaterials(r as StudentMaterialsResult)
    case 'qualityReview':
      return renderQualityReview(r as QualityReviewResult)
    default:
      return JSON.stringify(r, null, 2)
  }
}

export function renderCustomGptInstructions(context: CourseContext, analysis: CourseAnalysisResult): string {
  return [
    `[Custom GPT 지침 초안 — ${context.courseName} 수업 도우미]`,
    `역할: 당신은 "${context.courseName}" 과목의 학습 보조 도우미입니다. 대상은 ${context.grade} ${context.studentLevel} 학생입니다.`,
    `과목 성격: ${analysis.courseNature}`,
    `핵심 개념: ${analysis.coreConcepts.join(', ')}`,
    `행동 지침:\n- 정답을 바로 제공하지 말고 학생이 스스로 사고하도록 유도 질문을 우선한다.\n- ${context.aiUsageLevel} 방침에 맞게 응답 범위를 조정한다.\n- 확실하지 않은 내용은 "확실하지 않으니 교수자에게 확인하라"고 안내한다.\n- 개인정보·민감정보 요청 시 정중히 거절한다.`,
    `평가 방식 안내: ${context.evaluationStyle}`,
    `※ 이 지침은 초안이며, 실제 Custom GPT/AI 어시스턴트 설정 전 교수자의 검토와 수정이 필요합니다.`,
  ].join('\n\n')
}
