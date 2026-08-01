// 도메인 팩: 과목 성격에 따라 12단계 생성 엔진이 사용하는 어휘·주제 풀.
// 실제 LLM 없이도 "과목이 바뀌면 결과가 달라지도록" 하는 핵심 장치다.

export interface WeekTopicSeed {
  title: string
  coreConcepts: string
  teachingHint: string
  studentHint: string
  practiceHint: string
  aiUsageHint: string
}

export interface AiToolSeed {
  name: string
  purpose: string
  instructorUse: string
  studentUse: string
  caution: string
  alternative: string
}

export interface DomainPack {
  id: string
  label: string
  /** 매칭에 사용하는 키워드(과목명·전공·핵심학습내용 텍스트에서 검색) */
  matchKeywords: string[]
  courseNatureTemplate: string
  studentCharacteristics: string
  prerequisitesPool: string[]
  coreConcepts: string[]
  difficultiesPool: string[]
  aiApplicability: string
  instructorJudgmentPool: string[]
  /** 2~7주차, 10~14주차에 순서대로 배치되는 주제 풀 (최소 11개) */
  weekTopics: WeekTopicSeed[]
  aiTools: AiToolSeed[]
  practiceNamesPool: string[]
  caseScenarioPool: string[]
  projectThemePool: string[]
  ethicsNotesPool: string[]
  vocabulary: string[]
}
