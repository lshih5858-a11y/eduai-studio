// 프롬프트 템플릿 유틸리티
// 향후 API 연동 가능 구조로 설계됨

export const generateLecturePrompt = ({ subject, week, topic, level, caseType }) => ({
  gpt: `나는 경영학 교수입니다. ${subject} 수업 ${week}주차에서 "${topic}"을 설명하려고 합니다. ${level} 수준에 맞게 핵심 개념, ${caseType} 실제 기업 사례, 토론 질문 5개, 30분 실습 활동을 포함한 강의안을 작성해 주세요. 강의안은 서론(5분), 이론 설명(15분), 사례 분석(20분), 토론(15분), 정리(5분) 구조로 작성해 주세요.`,

  gemini: `${topic} 관련 ${caseType} 최신 경영 사례를 2020년 이후 자료 기준으로 5개 찾아주세요. 각 사례에 대해 기업명, 핵심 전략, 성과 지표, 경영학적 시사점을 정리해 주세요. 출처 URL도 포함해 주세요.`,

  perplexity: `"${topic}" 관련 국내외 최신 경영학 연구와 기업 사례를 검증해 주세요. 특히 ${caseType} 기업 중 성공 사례와 실패 사례를 비교 분석하고, 신뢰할 수 있는 출처와 함께 정리해 주세요.`,

  discussion: [
    `${topic}이 현재 기업 경영에서 왜 중요한가? 실제 사례를 들어 설명하시오.`,
    `${topic}을 도입할 때 발생할 수 있는 조직 내 저항 요인과 극복 방안은 무엇인가?`,
    `${topic}과 관련하여 국내 기업과 글로벌 기업의 접근 방식 차이를 비교하시오.`,
    `미래의 경영 환경에서 ${topic}은 어떻게 변화할 것으로 예상하는가?`,
    `만약 당신이 CEO라면 ${topic}을 어떻게 전략적으로 활용하겠는가?`,
  ],

  activities: [
    `팀별로 ${caseType} 기업 1곳을 선정하여 ${topic} 관련 전략을 분석하고 5분 발표 준비`,
    `GPT를 활용하여 ${topic} 관련 비즈니스 시나리오를 작성하고 팀 내 토론`,
    `${topic}을 주제로 한 마인드맵 작성 후 Gamma로 1페이지 요약 슬라이드 제작`,
  ],
})

export const generateProjectPrompt = ({ industry, problem, customer, teamSize, duration, aiTool }) => ({
  ideaGeneration: `우리 팀은 ${industry} 분야에서 "${problem}" 문제를 해결하는 경영학 프로젝트를 수행하려고 합니다. 대상 고객은 ${customer}이며, 팀원 ${teamSize}명이 ${duration} 동안 진행합니다. 고객 페르소나 2개, 문제 정의문, 서비스 아이디어 5개, 수익모델 후보, 조사 방법, 발표 목차를 포함하여 프로젝트 기획안을 작성해 주세요.`,

  roleAssignment: `${industry} 분야 프로젝트를 진행하는 ${teamSize}명 팀의 역할을 분담해 주세요. 프로젝트 기간은 ${duration}이며, 주요 과제는 시장 조사, 아이디어 개발, 데이터 분석, 발표자료 제작입니다. 각 역할별 주요 책임과 사용할 ${aiTool} 도구를 포함해 주세요.`,

  businessCanvas: `${industry} 분야에서 "${problem}"을 해결하는 비즈니스 모델 캔버스를 작성해 주세요. 9개 블록(고객 세그먼트, 가치 제안, 채널, 고객 관계, 수익원, 핵심 자원, 핵심 활동, 핵심 파트너십, 비용 구조)을 ${customer}을 대상으로 구체적으로 채워주세요.`,
})

export const generateDataPrompt = ({ dataType, goal, tool, method }) => ({
  cleaning: `다음 ${dataType} 데이터를 분석 전 정리해 주세요. 결측치 처리 방법, 이상치 탐지, 데이터 형식 표준화, 변수명 정리를 포함한 데이터 전처리 가이드를 작성해 주세요. 분석 목표: ${goal}`,

  excel: `${dataType} 데이터를 Excel로 분석하려고 합니다. ${method}을 수행하기 위한 단계별 Excel 함수와 피벗 테이블 설정 방법을 초보자도 따라할 수 있도록 설명해 주세요. 분석 목표: ${goal}`,

  python: `다음 CSV 데이터는 ${dataType} 조사 결과입니다. ${tool}을 사용하여 결측치 확인, 기술통계, ${method}, 시각화 그래프를 생성하는 코드를 작성해 주세요. 코드에는 초보자도 이해할 수 있는 한국어 주석을 포함해 주세요. 분석 목표: ${goal}`,

  interpretation: `${dataType} 분석 결과를 경영학적 관점에서 해석해 주세요. 주요 발견점, 통계적 유의성, 실무적 시사점, 한계점을 포함하여 보고서 형식으로 작성해 주세요. 분석 방법: ${method}, 목표: ${goal}`,

  report: `${dataType} 분석 결과를 경영학 보고서의 '분석 결과' 섹션으로 변환해 주세요. 수치는 구체적으로 제시하고, 그래프 캡션, 표 설명, 핵심 해석 문장을 포함해 주세요.`,
})

export const generatePitchPrompt = ({ title, problem, solution, customer, market, competitor, revenue, impact, duration }) => ({
  gamma: `다음 내용을 바탕으로 대학 경영학 팀 프로젝트 발표용 피치덱을 만들어 주세요.\n\n프로젝트명: ${title}\n문제: ${problem}\n해결책: ${solution}\n고객: ${customer}\n시장: ${market}\n경쟁자: ${competitor}\n수익모델: ${revenue}\n기대효과: ${impact}\n발표시간: ${duration}\n\n슬라이드는 10장으로 구성하고, 문제 제기, 고객 분석, 해결 아이디어, 비즈니스 모델, 경쟁 분석, 실행 전략, 기대효과, 결론을 포함해 주세요. 디자인은 깔끔한 비즈니스 컨설팅 스타일로 해 주세요.`,

  outline: `다음 팀 프로젝트 정보를 바탕으로 경영학 보고서 목차를 자동 생성해 주세요.\n프로젝트: ${title} | 문제: ${problem} | 해결책: ${solution}\n\n목차는 서론, 문제 정의, 이론적 배경, 현황 분석, 해결 방안, 비즈니스 모델, 기대효과, 한계점, 결론 순서로 각 섹션의 핵심 내용을 포함해 주세요.`,

  script: `다음 피치덱 내용을 바탕으로 ${duration} 발표 대본을 작성해 주세요.\n프로젝트: ${title}\n\n각 슬라이드별 발표 멘트(약 ${Math.round(parseInt(duration) * 60 / 10)}초씩), 강조 포인트, 청중 참여 질문을 포함해 주세요.`,

  summary: `다음 프로젝트 내용을 A4 1페이지 분량의 요약 보고서로 작성해 주세요.\n제목: ${title} | 문제: ${problem} | 해결책: ${solution} | 시장: ${market} | 수익모델: ${revenue} | 기대효과: ${impact}\n\n형식: 요약문(3줄), 핵심 지표 표, 실행 로드맵, 투자 포인트`,

  report: `다음 팀 프로젝트 내용을 바탕으로 경영학 보고서 형식으로 재구성해 주세요.\n${title}: ${problem} → ${solution}\n\n서론, 문제 정의, 이론적 배경, 사례 분석, 해결 방안, 기대효과, 한계점, 결론 순서로 작성해 주세요. 각 섹션은 300자 이상으로 작성해 주세요.`,
})

export const generateCoachingPrompt = ({ stage, difficulty, roles, deadline, feedbackType }) => ({
  coaching: `우리 팀은 현재 경영학 프로젝트의 "${stage}" 단계에 있습니다. 어려운 점은 "${difficulty}"입니다. 팀원 역할: ${roles}. 제출 마감: ${deadline}.\n\n경영학 교수자의 관점에서 우리 프로젝트의 ${feedbackType} 측면에서 피드백을 제공하고, 다음 실행 과제 5개와 각 과제를 완료하는 데 필요한 AI 도구를 제안해 주세요.`,

  meetingQuestions: `프로젝트 "${stage}" 단계 팀 회의를 위한 핵심 질문 7개를 만들어 주세요. 질문은 현재 진행 상황 점검, 문제 해결 방향, 역할 조정, 다음 단계 계획에 관한 것이어야 합니다. 어려운 점: ${difficulty}`,

  nextTasks: `경영학 팀 프로젝트에서 "${stage}" 단계 완료 후 다음 단계로 넘어가기 위한 실행 과제 목록을 만들어 주세요. 마감일: ${deadline}. 각 과제에는 담당자 역할, 예상 소요 시간, 활용 AI 도구를 포함해 주세요.`,

  checklist: `팀 프로젝트 최종 발표 전 점검표를 만들어 주세요. 내용 완성도, 논리 구조, 데이터 신뢰성, 발표 준비, AI 활용 윤리, 팀원 역할 분담 관점에서 각 5개씩 총 30개 체크 항목을 작성해 주세요.`,

  professorFeedback: `경영학 팀 프로젝트에 대해 교수님께 중간 피드백을 요청하는 이메일을 작성해 주세요. 현재 단계: ${stage}, 주요 내용: ${difficulty}, 구체적 피드백 요청 사항: ${feedbackType}. 정중하고 구체적인 질문이 포함되어야 합니다.`,
})

export const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  return Promise.resolve()
}
