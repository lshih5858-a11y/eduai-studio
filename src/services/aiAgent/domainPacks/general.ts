import type { CourseContext } from '../../../types/agent'
import type { DomainPack, WeekTopicSeed } from './types'

// 6개 수공 도메인 팩 중 어디에도 매칭되지 않는 과목을 위한 동적 폴백.
// 고정 문구 대신 사용자가 입력한 과목명·전공·핵심학습내용의 실제 단어를 재료로 삼는다.
// → 완전히 낯선 과목이 들어와도 "과목명만 바뀐 동일 문구"가 되지 않는다.

function splitKeywords(text: string): string[] {
  return text
    .split(/[,\n·、;/]+| 및 | 그리고 /)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
}

function ensureMinLength(list: string[], fallbackSeed: string, min: number): string[] {
  const result = [...list]
  let i = 1
  while (result.length < min) {
    result.push(`${fallbackSeed} 심화 주제 ${i}`)
    i += 1
  }
  return result
}

export function buildGeneralPack(context: CourseContext): DomainPack {
  const courseName = context.courseName || '이 과목'
  const major = context.major || '해당 전공'
  const rawKeywords = splitKeywords(context.keyContent || '')
  const keywords = ensureMinLength(rawKeywords, courseName, 6)

  const coreConcepts = ensureMinLength(
    keywords.slice(0, 8),
    `${courseName} 핵심 개념`,
    6,
  )

  const weekTopics: WeekTopicSeed[] = Array.from({ length: 11 }, (_, idx) => {
    const kw = keywords[idx % keywords.length]
    return {
      title: `${kw}`,
      coreConcepts: `${kw}의 정의와 ${major} 분야에서의 의미, 관련 핵심 용어`,
      teachingHint: `${kw}에 대한 개념 강의 및 ${major} 분야 사례 제시`,
      studentHint: `조별로 ${kw} 관련 사례를 조사하고 발표`,
      practiceHint: `${kw}를 ${courseName} 맥락에 적용해보는 실습`,
      aiUsageHint: `AI로 ${kw} 관련 자료를 요약·정리(교수자 검토 후 활용)`,
    }
  })

  return {
    id: 'general',
    label: `${major} 맞춤(자동 구성)`,
    matchKeywords: [],
    courseNatureTemplate: `${major} 분야의 ${courseName} 과목으로, 입력하신 "${context.keyContent || context.goal || courseName}" 내용을 중심으로 이론과 적용을 함께 다루는 과목이다.`,
    studentCharacteristics: `${context.studentLevel || '다양한 배경의'} 학생을 대상으로 하며, ${courseName}의 핵심 내용을 실제 사례에 적용해보는 과정에서 이해도가 높아진다.`,
    prerequisitesPool: [`${major} 기초 개념`, `${courseName} 관련 선수 지식`, '기초적인 자료 조사·정리 능력'],
    coreConcepts,
    difficultiesPool: [
      `${keywords[0]} 같은 핵심 개념을 실제 사례에 적용하는 데 어려움을 느낄 수 있음`,
      '이론과 실습 간 균형을 맞추기 어려움',
      `${major} 분야의 최신 동향을 따라가기 어려움`,
    ],
    aiApplicability: `AI는 ${courseName} 관련 자료 요약, 예시 생성, 정리표 작성에 보조적으로 활용할 수 있다. 다만 ${major} 분야의 전문적 판단과 최신성 검증은 반드시 교수자가 담당한다.`,
    instructorJudgmentPool: [
      `AI가 생성한 ${courseName} 관련 자료의 정확성 검토`,
      '학생 수준에 맞는 난이도 조정',
      `${major} 분야 최신 동향 반영 여부 확인`,
    ],
    weekTopics,
    aiTools: [
      {
        name: 'AI 자료 요약 도우미(범용 LLM 챗봇)',
        purpose: `${courseName} 관련 자료 요약 및 정리표 초안 생성`,
        instructorUse: '생성된 자료의 정확성을 검토한 뒤 강의 자료로 활용',
        studentUse: '예습·복습용 요약 자료로 참고(최종 확인은 교재 기준)',
        caution: '민감한 개인정보나 저작권이 있는 원문 전체를 입력하지 않는다',
        alternative: `${major} 관련 교재 및 공식 자료`,
      },
    ],
    practiceNamesPool: keywords.slice(0, 4).map((k) => `${k} 적용 실습`),
    caseScenarioPool: keywords.slice(0, 4).map((k) => `${k}와 관련된 실제 상황 사례`),
    projectThemePool: keywords.slice(0, 3).map((k) => `${k}를 주제로 한 프로젝트 기획`),
    ethicsNotesPool: [
      '실제 개인정보나 민감정보를 사례·과제에 포함하지 않는다',
      `AI가 생성한 ${courseName} 관련 내용은 교수자가 최종 검증한다`,
    ],
    vocabulary: keywords,
  }
}
