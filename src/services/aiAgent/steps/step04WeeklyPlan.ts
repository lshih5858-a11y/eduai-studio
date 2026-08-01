import type { CourseContext, WeekPlanRow, WeeklyPlanResult } from '../../../types/agent'
import type { DomainPack } from '../domainPacks/types'
import { WEEK_STRUCTURE, domainWeekTopicForWeek, intensityPhrase } from './helpers'

export function runStep04WeeklyPlan(context: CourseContext, pack: DomainPack): WeeklyPlanResult {
  const weeks: WeekPlanRow[] = []

  weeks.push({
    week: WEEK_STRUCTURE.orientation,
    topic: `오리엔테이션 및 ${context.courseName} 개관`,
    objectives: `${context.courseName}의 학습 목표와 진행 방식을 이해한다.`,
    coreConcepts: `과목 개관, 평가 방식(${context.evaluationStyle}), 학습 로드맵`,
    teachingActivities: `강의 개요 안내, ${intensityPhrase(context)} 수업 운영방식 소개`,
    studentActivities: '수강계획 수립, 조 편성',
    aiUsage: 'AI 활용 규칙 및 시범 모드 안내(개인정보 입력 금지 포함)',
    practice: '없음',
    assignment: '수강 목표 작성 및 제출',
    evaluation: '참여도 관찰',
    materials: '강의계획서, 수업 운영 안내자료',
    isExamWeek: false,
  })

  for (const week of [...WEEK_STRUCTURE.coreModuleWeeks, ...WEEK_STRUCTURE.advancedModuleWeeks]) {
    const seed = domainWeekTopicForWeek(pack, week)
    if (!seed) continue
    weeks.push({
      week,
      topic: seed.title,
      objectives: `${seed.title}을(를) ${context.studentLevel} 수준에서 이해하고 적용할 수 있다.`,
      coreConcepts: seed.coreConcepts,
      teachingActivities: seed.teachingHint,
      studentActivities: seed.studentHint,
      aiUsage: seed.aiUsageHint,
      practice: seed.practiceHint,
      assignment: `${seed.title} 관련 정리 과제 제출`,
      evaluation: context.evaluationStyle,
      materials: `강의자료(${seed.title}), 실습 워크시트`,
      isExamWeek: false,
    })
  }

  weeks.push({
    week: WEEK_STRUCTURE.midtermReviewWeek,
    topic: '중간 정리 및 복습',
    objectives: '1~7주차 핵심 개념을 통합적으로 점검한다.',
    coreConcepts: '1~7주차 핵심 개념 통합',
    teachingActivities: '중간 범위 총정리 강의 및 질의응답',
    studentActivities: '핵심 개념 정리 및 질문 준비',
    aiUsage: 'AI로 중간고사 대비 개념 요약표 생성(교수자 검토 후 배포)',
    practice: '없음',
    assignment: '중간 범위 정리노트 제출',
    evaluation: '형성평가',
    materials: '중간고사 대비 요약자료',
    isExamWeek: true,
  })

  weeks.push({
    week: WEEK_STRUCTURE.midtermExamWeek,
    topic: '중간고사',
    objectives: '1~7주차 학습 내용의 성취도를 평가한다.',
    coreConcepts: '1~7주차 전체',
    teachingActivities: '중간고사 시행 및 시험 운영',
    studentActivities: '중간고사 응시',
    aiUsage: '시험 중 AI 활용 금지(부정행위 방지 안내)',
    practice: '없음',
    assignment: '중간고사 오답 정리',
    evaluation: '중간고사(지필/실기)',
    materials: '중간고사 문제지',
    isExamWeek: true,
  })

  weeks.push({
    week: WEEK_STRUCTURE.integrationWeek,
    topic: `${context.courseName} 종합 실습 및 프로젝트 준비`,
    objectives: '학기 전체 학습 내용을 프로젝트로 통합 적용한다.',
    coreConcepts: '전 범위 통합 적용',
    teachingActivities: '프로젝트 점검 및 최종 발표 준비 안내',
    studentActivities: '조별 최종 프로젝트 마무리 및 리허설',
    aiUsage: 'AI로 발표자료 구성 아이디어 브레인스토밍',
    practice: '프로젝트 리허설',
    assignment: '최종 프로젝트 제출 준비',
    evaluation: '프로젝트 중간 점검',
    materials: '프로젝트 가이드라인',
    isExamWeek: false,
  })

  weeks.push({
    week: WEEK_STRUCTURE.finalExamWeek,
    topic: '기말고사 및 종합 정리',
    objectives: '학기 전체 학습 내용을 통합하여 정리한다.',
    coreConcepts: '전체 단원 통합',
    teachingActivities: '기말고사 시행 및 학기 총평',
    studentActivities: '기말고사 응시 및 학기 성찰 작성',
    aiUsage: 'AI로 학습 성찰 정리 도우미(교수자 검토 후 활용)',
    practice: '없음',
    assignment: '학기 성찰 보고서 제출',
    evaluation: '기말고사(지필/실기)',
    materials: '기말고사 문제지',
    isExamWeek: true,
  })

  weeks.sort((a, b) => a.week - b.week)
  return { weeks }
}
