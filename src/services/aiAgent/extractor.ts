import type { CourseContext } from '../../types/agent'

// 자유 서술형 설계 요청 문장에서 과목 정보를 규칙 기반으로 추출한다.
// 완전한 자연어 이해가 아니라 정규식·키워드 매칭이며, 못 찾은 필드는
// missingFields에 담아 UI가 "최소 정보 확인 카드"를 띄우는 데 사용한다.

type Field = keyof Omit<CourseContext, 'missingFields' | 'desiredOutputs'>

function matchFirst(text: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = text.match(re)
    if (m && m[1]) return m[1].trim()
  }
  return null
}

function detectCourseType(text: string): string | null {
  const hasOnline = /온라인|비대면/.test(text)
  const hasBlended = /블렌디드|혼합/.test(text)
  const hasTheory = /이론/.test(text)
  const hasPractice = /실습|실기/.test(text)
  if (hasBlended) return '블렌디드'
  if (hasOnline) return '온라인'
  if (hasTheory && hasPractice) return '이론+실습'
  if (hasPractice) return '실습'
  if (hasTheory) return '이론'
  return null
}

function detectStudentLevel(text: string): string | null {
  if (/입문|초보|처음/.test(text)) return '입문 수준'
  if (/심화|고급/.test(text)) return '심화 수준'
  if (/우수|상위권/.test(text)) return '우수 학습자 중심'
  if (/기초/.test(text)) return '기초 수준'
  if (/보통\s*수준|중간\s*수준/.test(text)) return '보통 수준'
  return null
}

function detectAiUsageLevel(text: string): string | null {
  if (/적극적으로\s*ai|ai\s*중심|ai\s*집중/i.test(text)) return '적극 활용'
  if (/최소한의\s*ai|ai\s*지양|ai\s*제한/i.test(text)) return '최소 활용(보조 도구 수준)'
  if (/ai/i.test(text)) return '보통 수준 활용'
  return null
}

function detectEvaluationStyle(text: string): string | null {
  const found: string[] = []
  if (/지필/.test(text)) found.push('지필고사')
  if (/실습\s*평가|수행평가/.test(text)) found.push('실습·수행평가')
  if (/프로젝트\s*평가|프로젝트를?\s*통한/.test(text)) found.push('프로젝트 평가')
  if (/포트폴리오/.test(text)) found.push('포트폴리오 평가')
  if (/절대평가/.test(text)) found.push('절대평가')
  if (/상대평가/.test(text)) found.push('상대평가')
  return found.length > 0 ? found.join(', ') : null
}

function detectDesiredOutputs(text: string): string[] {
  const map: [RegExp, string][] = [
    [/강의계획서|수업설계|16주/, '16주 강의계획서'],
    [/퀴즈|문제은행|시험문항/, '퀴즈'],
    [/루브릭|평가기준표/, '평가 루브릭'],
    [/워크북|학습지/, '학생 워크북'],
    [/ppt|슬라이드/i, 'PPT 슬라이드 구성안'],
    [/프로젝트/, '프로젝트 안내서'],
  ]
  const found = map.filter(([re]) => re.test(text)).map(([, label]) => label)
  return found
}

export function extractCourseContext(request: string): CourseContext {
  const text = request.trim()

  const courseName =
    matchFirst(text, [
      /과목명은\s*['"]?([가-힣A-Za-z0-9 ]{2,25}?)['"]?(?:[,.\s]|이며|입니다|과목)/,
      /['"]([가-힣A-Za-z0-9 ]{2,25})['"]\s*(?:과목|수업)/,
      /([가-힣A-Za-z0-9]{2,20})\s*(?:과목을|수업을|과목의|과목은)/,
    ]) ?? matchFirst(text, [/([가-힣A-Za-z0-9]{2,20})\s*과목/])

  const major = matchFirst(text, [/([가-힣A-Za-z ]{2,15}?)\s*(?:전공|학과)/])

  const grade = matchFirst(text, [/(\d)\s*학년/])
  const credit = matchFirst(text, [/(\d)\s*학점/])
  const hoursPerWeek = matchFirst(text, [/주\s*당?\s*(\d+)\s*시간/])

  const courseType = detectCourseType(text)
  const studentLevel = detectStudentLevel(text)
  const aiUsageLevel = detectAiUsageLevel(text)
  const evaluationStyle = detectEvaluationStyle(text)
  const desiredOutputs = detectDesiredOutputs(text)

  const goal =
    matchFirst(text, [/목표는\s*(.+?)(?:\.|$)/, /목표:\s*(.+?)(?:\.|$)/]) ??
    (courseName ? `${courseName}의 핵심 개념과 실무 역량을 습득한다` : '')

  const keyContent =
    matchFirst(text, [/주요\s*내용은\s*(.+?)(?:\.|$)/, /학습\s*내용[:은]\s*(.+?)(?:\.|$)/, /다루는\s*내용은\s*(.+?)(?:\.|$)/]) ??
    text.slice(0, 200)

  const resolved: Record<Field, string> = {
    major: major ?? '',
    courseName: courseName ?? '',
    grade: grade ? `${grade}학년` : '',
    credit: credit ? `${credit}학점` : '',
    hoursPerWeek: hoursPerWeek ? `주 ${hoursPerWeek}시간` : '',
    courseType: courseType ?? '',
    goal,
    keyContent,
    studentLevel: studentLevel ?? '',
    aiUsageLevel: aiUsageLevel ?? '',
    evaluationStyle: evaluationStyle ?? '',
  }

  const defaults: Record<Field, string> = {
    major: '미지정 전공',
    courseName: '새 과목',
    grade: '2학년',
    credit: '3학점',
    hoursPerWeek: '주 3시간',
    courseType: '이론+실습',
    goal: resolved.goal || '핵심 개념과 실무 역량을 습득한다',
    keyContent: resolved.keyContent || text,
    studentLevel: '보통 수준',
    aiUsageLevel: '보통 수준 활용',
    evaluationStyle: '지필고사, 실습·수행평가',
  }

  const missingFields: Field[] = (Object.keys(resolved) as Field[]).filter((key) => !resolved[key])

  const context: CourseContext = {
    major: resolved.major || defaults.major,
    courseName: resolved.courseName || defaults.courseName,
    grade: resolved.grade || defaults.grade,
    credit: resolved.credit || defaults.credit,
    hoursPerWeek: resolved.hoursPerWeek || defaults.hoursPerWeek,
    courseType: resolved.courseType || defaults.courseType,
    goal: resolved.goal || defaults.goal,
    keyContent: resolved.keyContent || defaults.keyContent,
    studentLevel: resolved.studentLevel || defaults.studentLevel,
    aiUsageLevel: resolved.aiUsageLevel || defaults.aiUsageLevel,
    evaluationStyle: resolved.evaluationStyle || defaults.evaluationStyle,
    desiredOutputs: desiredOutputs.length > 0 ? desiredOutputs : ['16주 강의계획서', '퀴즈', '평가 루브릭'],
    missingFields,
  }

  return context
}

/** 사용자가 "직접 입력"을 선택했을 때 특정 필드를 덮어쓴다. */
export function applyContextOverrides(context: CourseContext, overrides: Partial<CourseContext>): CourseContext {
  return { ...context, ...overrides, missingFields: [] }
}
