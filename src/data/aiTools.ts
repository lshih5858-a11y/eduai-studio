export interface AiTool {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  role: string;
  features: string[];
  applicableWeeks: number[];
  examplePrompt: string;
  tips: string;
}

export const aiTools: AiTool[] = [
  {
    id: "gpt",
    name: "GPT",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "🤖",
    role: "개념 설명, 전략 비교표 작성, 과제 피드백, 발표문 작성, 고객불만 대응 시나리오 생성",
    features: [
      "주차별 핵심 개념 정리 및 요약",
      "서비스경영 전략 비교표 자동 생성",
      "학생 과제 피드백 초안 작성",
      "고객불만 대응 대화 시나리오 생성",
      "발표 스크립트 및 보고서 초안 작성",
    ],
    applicableWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    examplePrompt: "서비스 실패 사례를 분석하고 회복 전략을 3단계로 제안해줘.",
    tips: "구체적인 서비스 상황과 대상 고객층을 명시하면 더 정확한 결과를 얻을 수 있습니다.",
  },
  {
    id: "gamma",
    name: "Gamma",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "🎨",
    role: "주차별 발표자료, 팀 프로젝트 슬라이드, 기말 포트폴리오 시각화",
    features: [
      "주차별 강의 발표자료 자동 생성",
      "팀 프로젝트 슬라이드 템플릿 제공",
      "개인 포트폴리오 시각화",
      "인포그래픽 및 다이어그램 포함",
      "전문적인 디자인 자동 적용",
    ],
    applicableWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    examplePrompt: "서비스 품질관리와 SERVQUAL 모델을 대학생 발표용 슬라이드로 만들어줘.",
    tips: "슬라이드 수, 대상 청중, 발표 시간을 프롬프트에 명시하면 최적화된 결과를 얻습니다.",
  },
  {
    id: "napkin",
    name: "Napkin",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: "📊",
    role: "서비스 프로세스, 고객여정맵, 수익모델, ESG 구조도 시각화",
    features: [
      "서비스 프로세스 플로우차트 생성",
      "고객여정맵 다이어그램 시각화",
      "비즈니스 모델 캔버스 도식화",
      "ESG/CSR 구조도 및 인포그래픽",
      "서비스 블루프린트 자동 생성",
    ],
    applicableWeeks: [1, 4, 7, 10, 13],
    examplePrompt: "고객여정맵의 주요 단계를 흐름도로 시각화해줘.",
    tips: "텍스트 내용을 먼저 정리한 후 Napkin에 입력하면 더 정확한 시각화가 됩니다.",
  },
  {
    id: "felo",
    name: "Felo",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "🎭",
    role: "서비스 상황극, 고객응대 시뮬레이션, 발표 리허설, 고객 반응 예측",
    features: [
      "고객-직원 상황극 시뮬레이션",
      "대기시간 불만 대응 역할극",
      "발표 리허설 및 피드백",
      "다양한 고객 반응 시나리오 생성",
      "팀 토의 주제 및 진행 지원",
    ],
    applicableWeeks: [2, 5, 9, 15],
    examplePrompt: "고객이 대기시간 때문에 불만을 제기하는 상황극을 만들어줘.",
    tips: "역할(고객/직원/매니저)을 명확히 지정하고 상황 배경을 구체적으로 설명하세요.",
  },
  {
    id: "genspark",
    name: "Genspark",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    icon: "💡",
    role: "고객 인터뷰 생성, 직원 인터뷰 대본, 서비스 회복 대화 시뮬레이션, 사례 리서치",
    features: [
      "고객 인터뷰 질문 세트 생성",
      "직원 교육 대본 및 시나리오",
      "서비스 회복 대화 시뮬레이션",
      "산업별 서비스 사례 리서치",
      "혁신 아이디어 브레인스토밍 지원",
    ],
    applicableWeeks: [3, 6, 11, 14],
    examplePrompt: "카페 서비스 개선을 위한 고객 인터뷰 질문 10개를 만들어줘.",
    tips: "조사 목적과 대상 고객층(연령, 방문 빈도 등)을 구체적으로 제시하면 더 유용한 질문이 생성됩니다.",
  },
  {
    id: "geminiami",
    name: "Geminiami",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: "📝",
    role: "퀴즈 생성, 중간·기말 복습문항, 객관식·단답형·사례형 평가문항 작성",
    features: [
      "주차별 퀴즈 문항 자동 생성",
      "객관식, OX, 단답형, 사례형 다양한 유형",
      "중간·기말고사 예상 문제 생성",
      "난이도별 문제 분류 및 해설 제공",
      "글로벌 서비스 비교 분석 지원",
    ],
    applicableWeeks: [8, 12, 16],
    examplePrompt: "서비스경영 1~7주차 내용을 바탕으로 객관식 10문제를 만들어줘.",
    tips: "문제 수, 난이도, 문제 유형을 명시하면 더 체계적인 평가 문항이 생성됩니다.",
  },
];
