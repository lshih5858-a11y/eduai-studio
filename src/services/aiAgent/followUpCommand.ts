import type {
  AgentQuizType,
  AnyStepResult,
  PracticeActivitiesResult,
  QuizzesResult,
  RubricsResult,
  StepKey,
  StudentMaterialsResult,
  TeacherMaterialsResult,
} from '../../types/agent'
import { generateId } from '../../utils/id'
import type { DomainPack } from './domainPacks/types'
import { pick } from './steps/helpers'

// 후속 지시 파서 — 자연어 전체 이해가 아니라, 스펙에 제시된 명령 유형(주차 지정 수정,
// 평가비중 변경, 난이도 조정, 문항 추가, 체크리스트 강화, 멘트 구체화)을 인식하는
// 키워드/정규식 규칙 기반 파서다. 매칭 실패 시 예시를 안내하고 빈 화면 없이 처리한다.

const TARGET_KEYWORD_MAP: [RegExp, StepKey[]][] = [
  [/퀴즈|문항|시험\s*문제/, ['quizzes']],
  [/루브릭|평가\s*기준|가중치|평가비중/, ['rubrics']],
  [/프로젝트/, ['projectAssignment']],
  [/교수자\s*(멘트|강의안|자료)/, ['teacherMaterials']],
  [/학생용|학생\s*자료|체크리스트/, ['studentMaterials']],
  [/실습/, ['practiceActivities']],
  [/16\s*주|수업설계|주차별\s*설계/, ['weeklyPlan']],
  [/학습목표/, ['learningObjectives']],
  [/학습성과/, ['learningOutcomes']],
  [/ai\s*도구/i, ['aiToolMapping']],
  [/품질검토|검토\s*결과/, ['qualityReview']],
  [/과목\s*분석/, ['courseAnalysis']],
  [/난이도/, ['learningObjectives', 'weeklyPlan', 'quizzes']],
]

const DEPENDENCY_NOTICES: Partial<Record<StepKey, StepKey[]>> = {
  learningObjectives: ['weeklyPlan', 'rubrics', 'quizzes'],
  weeklyPlan: ['practiceActivities', 'teacherMaterials', 'studentMaterials', 'aiToolMapping'],
  rubrics: ['qualityReview'],
}

export interface ParsedFollowUp {
  matched: boolean
  targetSteps: StepKey[]
  weekNumber: number | null
  descriptor: string | null
  percent: number | null
  count: number | null
  quizTypeHint: AgentQuizType | null
  studentLevelOverride: string | null
  wantsMoreDetail: boolean
  summary: string
  exampleGuide: string
}

const EXAMPLE_GUIDE =
  '예시: "5주차 실습만 팀 토론형으로 수정해 주세요", "프로젝트 평가비중을 35%로 변경해 주세요", "1학년 수준으로 전체 난이도를 낮춰 주세요", "퀴즈 중 사례형 문항을 5개 추가해 주세요"'

function detectQuizType(text: string): AgentQuizType | null {
  if (/사례형/.test(text)) return '사례형'
  if (/객관식/.test(text)) return '객관식'
  if (/단답형/.test(text)) return '단답형'
  if (/\bOX\b|ox형/i.test(text)) return 'OX'
  return null
}

export function parseFollowUpCommand(command: string): ParsedFollowUp {
  const text = command.trim()

  const targetSteps = Array.from(
    new Set(TARGET_KEYWORD_MAP.filter(([re]) => re.test(text)).flatMap(([, keys]) => keys)),
  )

  const weekMatch = text.match(/(\d+)\s*주차/)
  const percentMatch = text.match(/(\d+)\s*%/)
  const countMatch = text.match(/(\d+)\s*개/)
  const gradeMatch = text.match(/(\d)\s*학년/)

  let studentLevelOverride: string | null = null
  if (gradeMatch) studentLevelOverride = `${gradeMatch[1]}학년 눈높이(입문 수준)`
  else if (/낮춰|쉽게|완화/.test(text)) studentLevelOverride = '입문 수준(난이도 완화)'
  else if (/높여|심화|어렵게/.test(text)) studentLevelOverride = '심화 수준(난이도 상향)'

  const descriptorMatch = text.match(/(?:을|를)?\s*([가-힣A-Za-z0-9\s]{2,20}?)\s*(?:으로|로)\s*(?:수정|변경|바꿔|바꾸)/)

  const matched = targetSteps.length > 0
  const summary = matched
    ? `요청 대상: ${targetSteps.join(', ')}${weekMatch ? ` / ${weekMatch[1]}주차` : ''}${
        percentMatch ? ` / ${percentMatch[1]}%` : ''
      }${countMatch ? ` / ${countMatch[1]}개` : ''}`
    : '요청을 이해하지 못했습니다.'

  return {
    matched,
    targetSteps,
    weekNumber: weekMatch ? Number(weekMatch[1]) : null,
    descriptor: descriptorMatch ? descriptorMatch[1].trim() : null,
    percent: percentMatch ? Number(percentMatch[1]) : null,
    count: countMatch ? Number(countMatch[1]) : null,
    quizTypeHint: detectQuizType(text),
    studentLevelOverride,
    wantsMoreDetail: /구체적|자세히|더\s*강화|보강/.test(text),
    summary,
    exampleGuide: EXAMPLE_GUIDE,
  }
}

export function computeAffectedSteps(targetSteps: StepKey[]): StepKey[] {
  const affected = new Set<StepKey>()
  for (const key of targetSteps) {
    for (const dep of DEPENDENCY_NOTICES[key] ?? []) {
      if (!targetSteps.includes(dep)) affected.add(dep)
    }
  }
  return Array.from(affected)
}

/** 정규 재생성된 결과에 후속 지시의 세부 파라미터(주차 지정, 비중, 개수 등)를 반영한다. */
export function postProcessFollowUp(
  key: StepKey,
  result: AnyStepResult,
  parsed: ParsedFollowUp,
  pack: DomainPack,
): AnyStepResult {
  if (key === 'practiceActivities' && parsed.weekNumber && parsed.descriptor) {
    const r = result as PracticeActivitiesResult
    return {
      activities: r.activities.map((a) =>
        a.week === parsed.weekNumber
          ? {
              ...a,
              name: `${a.week}주차 · ${parsed.descriptor} 실습`,
              procedure: [`1) ${parsed.descriptor} 방식으로 진행: ${a.goal}`, ...a.procedure.slice(1)],
            }
          : a,
      ),
    }
  }

  if (key === 'rubrics' && parsed.percent !== null) {
    const r = result as RubricsResult
    const targetIdx = r.criteria.findIndex((c) => /적용|수행|프로젝트/.test(c.area))
    const idx = targetIdx >= 0 ? targetIdx : 0
    const others = r.criteria.filter((_, i) => i !== idx)
    const remaining = 100 - parsed.percent
    const otherSum = others.reduce((s, c) => s + c.weight, 0) || 1
    const criteria = r.criteria.map((c, i) =>
      i === idx ? { ...c, weight: parsed.percent as number } : { ...c, weight: Math.round((c.weight / otherSum) * remaining) },
    )
    const diff = 100 - criteria.reduce((s, c) => s + c.weight, 0)
    if (diff !== 0) criteria[criteria.length - 1].weight += diff
    return { criteria }
  }

  if (key === 'quizzes' && parsed.count) {
    const r = result as QuizzesResult
    const type = parsed.quizTypeHint ?? '사례형'
    const extra = Array.from({ length: parsed.count }, (_, i) => {
      const scenario = pick(pack.caseScenarioPool, r.items.length + i)
      return {
        id: generateId('q'),
        type,
        difficulty: '심화' as const,
        question:
          type === '사례형'
            ? `다음 사례를 읽고 대응 방안을 서술하시오.\n\n[사례] ${scenario}`
            : `(추가 문항) ${pick(pack.coreConcepts, i)} 관련 문제`,
        options: type === '객관식' ? ['정답 보기', '오답 보기 1', '오답 보기 2', '오답 보기 3'] : undefined,
        answer: type === '사례형' ? '교수자 채점 기준(루브릭)에 따른 서술형 채점' : pick(pack.coreConcepts, i),
        explanation: '후속 지시로 추가 생성된 문항입니다.',
        relatedObjectiveId: '',
      }
    })
    return { items: [...r.items, ...extra] }
  }

  if (key === 'studentMaterials' && parsed.wantsMoreDetail) {
    const r = result as StudentMaterialsResult
    return {
      weekly: r.weekly.map((w) => ({
        ...w,
        aiVerificationChecklist: [
          ...w.aiVerificationChecklist,
          'AI가 제시한 출처나 근거가 실제로 존재하는지 확인했는가?',
          '같은 질문을 다르게 표현해 다시 물어봐도 같은 결론이 나오는가?',
        ],
      })),
    }
  }

  if (key === 'teacherMaterials' && parsed.wantsMoreDetail) {
    const r = result as TeacherMaterialsResult
    return {
      ...r,
      weekly: r.weekly.map((w) => ({
        ...w,
        openingRemarks: `${w.openingRemarks} (예: 지난 시간 과제 중 인상 깊었던 사례를 1~2개 언급하며 시작)`,
        closingRemarks: `${w.closingRemarks} (다음 시간 예습 포인트를 구체적으로 짚어주세요)`,
      })),
    }
  }

  return result
}
