export type QuizType = "OX" | "객관식" | "단답형" | "사례형";

export interface QuizOption {
  number: number;
  text: string;
}

export interface Quiz {
  id: string;
  week: number;
  type: QuizType;
  question: string;
  options?: QuizOption[];
  answer: string;
  explanation: string;
}

export const quizzes: Quiz[] = [
  // 1주차
  {
    id: "q1-1",
    week: 1,
    type: "OX",
    question: "서비스는 제품과 달리 생산과 소비가 동시에 이루어지는 특성을 가진다.",
    answer: "O",
    explanation: "서비스의 동시성(비분리성)은 서비스 생산과 소비가 분리될 수 없다는 특성으로, 제품과 가장 큰 차이점 중 하나입니다.",
  },
  {
    id: "q1-2",
    week: 1,
    type: "객관식",
    question: "서비스의 4대 특성에 해당하지 않는 것은?",
    options: [
      { number: 1, text: "무형성" },
      { number: 2, text: "이질성" },
      { number: 3, text: "소멸성" },
      { number: 4, text: "대량생산성" },
    ],
    answer: "4",
    explanation: "서비스의 4대 특성은 무형성, 이질성(이변성), 소멸성, 동시성(비분리성)입니다. 대량생산성은 제품의 특성입니다.",
  },
  {
    id: "q1-3",
    week: 1,
    type: "단답형",
    question: "서비스가 재고로 저장될 수 없으며 생산된 즉시 소멸되는 특성을 무엇이라 하는가?",
    answer: "소멸성 (또는 재고불가능성)",
    explanation: "소멸성(Perishability)은 서비스를 미리 생산해서 저장하거나 재고로 보관할 수 없는 특성을 말합니다. 항공좌석, 호텔객실이 대표적 예입니다.",
  },
  // 2주차
  {
    id: "q2-1",
    week: 2,
    type: "객관식",
    question: "SERVQUAL의 5가지 차원에 해당하지 않는 것은?",
    options: [
      { number: 1, text: "유형성" },
      { number: 2, text: "신뢰성" },
      { number: 3, text: "응답성" },
      { number: 4, text: "생산성" },
    ],
    answer: "4",
    explanation: "SERVQUAL의 5가지 차원은 유형성(Tangibles), 신뢰성(Reliability), 응답성(Responsiveness), 확신성(Assurance), 공감성(Empathy)입니다.",
  },
  {
    id: "q2-2",
    week: 2,
    type: "OX",
    question: "SERVQUAL 모델에서 갭(Gap)이 작을수록 고객 만족도가 높다.",
    answer: "O",
    explanation: "갭은 고객이 기대하는 서비스 수준과 실제로 인식한 서비스 수준의 차이입니다. 갭이 작을수록(또는 음수일수록) 고객 만족도가 높아집니다.",
  },
  {
    id: "q2-3",
    week: 2,
    type: "사례형",
    question: "한 병원 환자가 '의사 선생님이 내 이야기를 잘 들어주지 않는 것 같아 불만이다'라고 했습니다. 이는 SERVQUAL의 어느 차원이 낮게 평가된 것인가? 이유도 설명하시오.",
    answer: "공감성(Empathy) - 의료진이 환자의 감정과 요구를 개별적으로 이해하고 배려하는 수준이 낮음을 의미합니다.",
    explanation: "공감성(Empathy)은 서비스 제공자가 고객의 입장에서 개인적 관심과 배려를 보여주는 것을 말합니다. 경청과 개인화된 응대가 핵심입니다.",
  },
  // 3주차
  {
    id: "q3-1",
    week: 3,
    type: "객관식",
    question: "고객여정맵에서 고객이 브랜드 또는 서비스와 상호작용하는 모든 접점을 무엇이라 하는가?",
    options: [
      { number: 1, text: "페인포인트" },
      { number: 2, text: "터치포인트" },
      { number: 3, text: "채널포인트" },
      { number: 4, text: "서비스포인트" },
    ],
    answer: "2",
    explanation: "터치포인트(Touchpoint)는 고객이 기업, 제품, 서비스와 직접 상호작용하는 모든 접점을 의미합니다. 온라인/오프라인 모두 포함됩니다.",
  },
  {
    id: "q3-2",
    week: 3,
    type: "OX",
    question: "페인포인트(Pain Point)는 고객이 서비스 이용 과정에서 느끼는 불편함이나 불만 지점을 말한다.",
    answer: "O",
    explanation: "페인포인트는 고객이 서비스를 이용하는 여정 중에 겪는 어려움, 불편함, 불만족 요소입니다. 서비스 개선 기회를 발견하는 데 핵심 지표가 됩니다.",
  },
  // 4주차
  {
    id: "q4-1",
    week: 4,
    type: "객관식",
    question: "서비스 블루프린트에서 고객에게 직접 보이는 직원 활동 영역은?",
    options: [
      { number: 1, text: "후방 활동" },
      { number: 2, text: "지원 프로세스" },
      { number: 3, text: "전면 활동" },
      { number: 4, text: "내부 프로세스" },
    ],
    answer: "3",
    explanation: "전면 활동(Front-Stage Activities)은 고객에게 보이는 서비스 접점에서의 직원 활동입니다. 후방 활동은 고객에게 보이지 않는 영역입니다.",
  },
  {
    id: "q4-2",
    week: 4,
    type: "단답형",
    question: "디자인씽킹의 5단계를 순서대로 나열하시오.",
    answer: "공감(Empathize) - 문제 정의(Define) - 아이디어화(Ideate) - 프로토타입(Prototype) - 테스트(Test)",
    explanation: "디자인씽킹은 인간 중심 문제해결 방법론으로, 공감에서 시작하여 반복적인 프로토타이핑과 테스트를 통해 혁신적 해결책을 도출합니다.",
  },
  // 5주차
  {
    id: "q5-1",
    week: 5,
    type: "객관식",
    question: "서비스 운영에서 수요가 공급 능력을 초과하는 상황에서 가장 적합한 전략은?",
    options: [
      { number: 1, text: "직원 수 즉시 감소" },
      { number: 2, text: "예약 시스템 도입" },
      { number: 3, text: "가격 인상 금지" },
      { number: 4, text: "서비스 중단" },
    ],
    answer: "2",
    explanation: "수요 초과 시 예약 시스템을 도입하면 수요를 분산시키고, 고객 대기를 관리하며, 서비스 품질을 유지할 수 있습니다.",
  },
  {
    id: "q5-2",
    week: 5,
    type: "OX",
    question: "대기행렬 이론에서 평균 대기시간은 서비스 이용률이 높아질수록 증가한다.",
    answer: "O",
    explanation: "서비스 이용률(서버 사용률)이 높아질수록 대기행렬이 길어지고 평균 대기시간도 크게 증가합니다. 이를 통해 피크타임 관리의 중요성을 알 수 있습니다.",
  },
  // 6주차
  {
    id: "q6-1",
    week: 6,
    type: "객관식",
    question: "내부마케팅(Internal Marketing)의 주요 목적은?",
    options: [
      { number: 1, text: "내부 직원을 대상으로 회사 제품 판매" },
      { number: 2, text: "직원을 내부 고객으로 보고 만족도를 높여 서비스 품질 향상" },
      { number: 3, text: "마케팅 비용 절감" },
      { number: 4, text: "외부 광고 효율 극대화" },
    ],
    answer: "2",
    explanation: "내부마케팅은 직원을 '내부 고객'으로 바라보고 그들의 만족도를 높임으로써, 결과적으로 외부 고객 서비스 품질이 향상된다는 개념입니다.",
  },
  {
    id: "q6-2",
    week: 6,
    type: "사례형",
    question: "콜센터 상담원이 매일 불만 고객 응대로 극도의 피로감과 스트레스를 호소합니다. 이 상황을 서비스경영 관점에서 분석하고 기업이 취해야 할 조치를 3가지 제안하시오.",
    answer: "감정노동 관리 필요. 제안: ①정기적 심리상담 프로그램 제공 ②응대 건수 조정 및 충분한 휴식 보장 ③불합리한 고객 응대 거부권 부여 및 에스컬레이션 프로세스 구축",
    explanation: "감정노동은 직업상 필요한 감정을 표현하도록 요구받을 때 발생하는 심리적 부담입니다. 기업은 직원 보호 정책과 지원 시스템을 마련해야 합니다.",
  },
  // 7주차
  {
    id: "q7-1",
    week: 7,
    type: "객관식",
    question: "서비스 마케팅 믹스 7P에서 제품(Product), 가격(Price), 유통(Place), 촉진(Promotion) 외 서비스에만 추가된 3P가 아닌 것은?",
    options: [
      { number: 1, text: "People(사람)" },
      { number: 2, text: "Process(프로세스)" },
      { number: 3, text: "Physical Evidence(물리적 증거)" },
      { number: 4, text: "Partnership(파트너십)" },
    ],
    answer: "4",
    explanation: "서비스 마케팅에 추가된 3P는 People(사람), Process(프로세스), Physical Evidence(물리적 증거)입니다.",
  },
  {
    id: "q7-2",
    week: 7,
    type: "OX",
    question: "서비스의 Physical Evidence(물리적 증거)는 서비스 품질에 대한 고객의 인식에 영향을 미친다.",
    answer: "O",
    explanation: "무형적인 서비스를 평가할 때 고객은 물리적 환경(인테리어, 직원 복장, 장비, 청결도 등)을 품질 판단의 단서로 활용합니다.",
  },
  // 8주차
  {
    id: "q8-1",
    week: 8,
    type: "객관식",
    question: "다음 중 서비스 품질 갭 모델에서 '고객의 기대'와 '경영진의 고객 기대 인식' 사이의 차이를 나타내는 갭은?",
    options: [
      { number: 1, text: "갭 1 (지식 갭)" },
      { number: 2, text: "갭 2 (표준 갭)" },
      { number: 3, text: "갭 3 (전달 갭)" },
      { number: 4, text: "갭 5 (인식 갭)" },
    ],
    answer: "1",
    explanation: "갭 1(지식 갭)은 경영진이 고객의 기대를 정확히 이해하지 못할 때 발생하는 갭으로, 시장조사와 고객 피드백 수집으로 줄일 수 있습니다.",
  },
  // 9주차
  {
    id: "q9-1",
    week: 9,
    type: "객관식",
    question: "기업이 온라인과 오프라인 채널을 통합하여 일관된 고객 경험을 제공하는 전략은?",
    options: [
      { number: 1, text: "멀티채널 전략" },
      { number: 2, text: "옴니채널 전략" },
      { number: 3, text: "크로스채널 전략" },
      { number: 4, text: "단일채널 전략" },
    ],
    answer: "2",
    explanation: "옴니채널(Omnichannel) 전략은 온/오프라인 모든 채널에서 일관되고 통합된 고객 경험을 제공하는 것으로, 멀티채널보다 더 통합적입니다.",
  },
  {
    id: "q9-2",
    week: 9,
    type: "OX",
    question: "AI 챗봇의 도입은 24시간 고객 서비스 제공을 가능하게 하여 서비스 접근성을 높인다.",
    answer: "O",
    explanation: "AI 챗봇은 인건비 절감, 24시간 서비스 제공, 빠른 응답 시간이라는 장점이 있지만, 복잡한 문제 해결에는 한계가 있어 인간 상담원과의 연계가 필요합니다.",
  },
  // 10주차
  {
    id: "q10-1",
    week: 10,
    type: "객관식",
    question: "고객이 서비스를 처음 이용한 시점부터 관계가 끝날 때까지 발생하는 총 수익의 현재가치를 나타내는 개념은?",
    options: [
      { number: 1, text: "CAC (고객획득비용)" },
      { number: 2, text: "LTV (고객생애가치)" },
      { number: 3, text: "NPS (순추천지수)" },
      { number: 4, text: "ARPU (사용자당 평균 매출)" },
    ],
    answer: "2",
    explanation: "LTV(Lifetime Value, 고객생애가치)는 한 고객이 기업과의 관계에서 전체 기간 동안 가져다주는 순수익의 현재가치입니다.",
  },
  // 11주차
  {
    id: "q11-1",
    week: 11,
    type: "사례형",
    question: "고객이 서비스 실패로 강하게 항의할 때 가장 먼저 해야 할 대응은? 그 이유와 함께 설명하시오.",
    answer: "고객 감정 인정과 진정성 있는 사과가 먼저 이루어져야 함. 이유: 서비스 회복의 첫 단계는 고객의 불만과 감정을 인정하는 것으로, 방어적 반응보다 공감적 사과가 고객의 분노를 완화하고 문제 해결로 나아갈 수 있게 합니다.",
    explanation: "서비스 회복 연구에 따르면, 신속하고 진정성 있는 사과는 고객 만족 회복에 가장 효과적입니다. '즉시 사과 → 문제 파악 → 해결책 제시' 순서가 중요합니다.",
  },
  {
    id: "q11-2",
    week: 11,
    type: "객관식",
    question: "서비스 회복 공정성의 세 가지 유형이 아닌 것은?",
    options: [
      { number: 1, text: "결과 공정성" },
      { number: 2, text: "절차 공정성" },
      { number: 3, text: "상호작용 공정성" },
      { number: 4, text: "시간 공정성" },
    ],
    answer: "4",
    explanation: "서비스 회복 공정성의 3가지 유형은 결과 공정성(보상 수준), 절차 공정성(처리 과정), 상호작용 공정성(직원 태도)입니다.",
  },
  {
    id: "q11-3",
    week: 11,
    type: "OX",
    question: "서비스 실패 후 효과적으로 회복된 경우, 오히려 처음부터 문제가 없었던 경우보다 고객 만족도가 높아지는 현상을 '서비스 회복 역설'이라 한다.",
    answer: "O",
    explanation: "서비스 회복 역설(Service Recovery Paradox)은 서비스 실패 후 탁월한 회복이 이루어졌을 때 고객 만족과 충성도가 오히려 증가하는 현상입니다.",
  },
  // 12주차
  {
    id: "q12-1",
    week: 12,
    type: "객관식",
    question: "글로벌 서비스 전략에서 현지 문화와 고객 특성에 맞게 서비스를 조정하는 접근방식은?",
    options: [
      { number: 1, text: "표준화 전략" },
      { number: 2, text: "현지화 전략" },
      { number: 3, text: "글로벌화 전략" },
      { number: 4, text: "통합화 전략" },
    ],
    answer: "2",
    explanation: "현지화(Localization) 전략은 현지 문화, 소비자 선호, 규제에 맞게 서비스를 조정하는 접근방식으로, 글로벌 일관성보다 현지 적합성을 우선합니다.",
  },
  // 13주차
  {
    id: "q13-1",
    week: 13,
    type: "객관식",
    question: "ESG 경영에서 'G'가 나타내는 것은?",
    options: [
      { number: 1, text: "글로벌화(Globalization)" },
      { number: 2, text: "성장(Growth)" },
      { number: 3, text: "거버넌스(Governance)" },
      { number: 4, text: "공익(Good)" },
    ],
    answer: "3",
    explanation: "ESG는 Environmental(환경), Social(사회), Governance(지배구조/거버넌스)의 약자로, 기업의 비재무적 성과를 측정하는 기준입니다.",
  },
  {
    id: "q13-2",
    week: 13,
    type: "OX",
    question: "CSR(기업사회책임)과 ESG는 동일한 개념으로 구별 없이 사용할 수 있다.",
    answer: "X",
    explanation: "CSR은 기업의 사회적 의무와 자선 활동 중심이라면, ESG는 투자자 관점에서 기업의 지속가능성을 E·S·G 세 가지 측면에서 정량적으로 측정하는 개념입니다.",
  },
  // 14주차
  {
    id: "q14-1",
    week: 14,
    type: "객관식",
    question: "기존 서비스의 점진적 개선이 아닌, 완전히 새로운 가치를 창출하는 혁신 유형은?",
    options: [
      { number: 1, text: "점진적 혁신" },
      { number: 2, text: "급진적 혁신" },
      { number: 3, text: "지속적 개선" },
      { number: 4, text: "프로세스 최적화" },
    ],
    answer: "2",
    explanation: "급진적 혁신(Radical Innovation)은 기존 시장을 파괴하거나 완전히 새로운 시장을 창출하는 혁신으로, 에어비앤비나 우버가 대표적 사례입니다.",
  },
  // 15주차
  {
    id: "q15-1",
    week: 15,
    type: "단답형",
    question: "팀 발표에서 좋은 발표란 내용의 정확성 외에 어떤 요소가 중요한지 3가지 이상 서술하시오.",
    answer: "명확한 구조와 논리적 흐름, 시각자료 활용, 청중과의 눈맞춤 및 적절한 속도, 질의응답 준비, AI 도구를 활용한 전문적인 발표 자료",
    explanation: "효과적인 발표는 내용, 구조, 전달 방법, 시각화, 인터랙션이 조화롭게 이루어져야 합니다.",
  },
  // 16주차
  {
    id: "q16-1",
    week: 16,
    type: "사례형",
    question: "16주간 서비스경영 수업에서 학습한 개념 중 실제 생활에 가장 유용하게 적용할 수 있는 것을 하나 선택하고, 구체적인 적용 방법을 서술하시오.",
    answer: "자유 서술 (예: 고객여정맵을 활용하여 아르바이트하는 카페의 서비스 개선점을 분석하고 제안함)",
    explanation: "이 문항은 학습 전이(Transfer of Learning)를 평가합니다. 실제 경험이나 생활에 개념을 연결하는 능력을 평가합니다.",
  },
];
