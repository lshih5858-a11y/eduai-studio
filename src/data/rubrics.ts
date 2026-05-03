export interface RubricCriterion {
  name: string;
  points: number;
  excellent: string;
  good: string;
  fair: string;
  poor: string;
}

export interface Rubric {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  criteria: RubricCriterion[];
}

export const rubrics: Rubric[] = [
  {
    id: "service-analysis",
    title: "서비스 사례 분석 보고서 루브릭",
    description: "서비스경영 사례 분석 보고서의 종합 평가 기준",
    totalPoints: 100,
    criteria: [
      {
        name: "문제 인식",
        points: 25,
        excellent: "서비스 문제를 다양한 관점에서 정확히 식별하고 구체적으로 기술함",
        good: "서비스 문제를 적절히 파악하고 기술함",
        fair: "서비스 문제를 부분적으로 파악함",
        poor: "서비스 문제 인식이 불명확하거나 관련성이 낮음",
      },
      {
        name: "서비스 개념 적용",
        points: 25,
        excellent: "학습한 서비스경영 개념을 정확하고 풍부하게 적용함",
        good: "핵심 서비스 개념을 대체로 정확하게 적용함",
        fair: "일부 서비스 개념을 적용하나 정확성이 부족함",
        poor: "서비스 개념 적용이 부적절하거나 누락됨",
      },
      {
        name: "사례 분석 깊이",
        points: 25,
        excellent: "사례를 다각도로 심층 분석하며 통찰력 있는 해석 제시",
        good: "사례를 충분히 분석하고 논리적으로 설명함",
        fair: "기본적인 사례 분석은 수행되나 깊이가 부족함",
        poor: "사례 분석이 표면적이거나 부정확함",
      },
      {
        name: "보고서 구성",
        points: 15,
        excellent: "논리적 구조, 명확한 표현, 적절한 시각자료로 완성도 높음",
        good: "보고서 구조가 적절하고 내용 전달이 명확함",
        fair: "기본 구성은 갖추었으나 표현이나 구조가 미흡함",
        poor: "보고서 구성이 불명확하고 내용 전달이 어려움",
      },
      {
        name: "AI 활용 적절성",
        points: 10,
        excellent: "AI 도구를 창의적이고 효과적으로 활용하여 분석을 심화함",
        good: "AI 도구를 적절하게 활용함",
        fair: "AI 도구를 활용하나 효과가 제한적임",
        poor: "AI 도구 활용이 미흡하거나 부적절함",
      },
    ],
  },
  {
    id: "customer-journey",
    title: "고객여정맵 실습 루브릭",
    description: "고객여정맵 제작 및 분석 실습 평가 기준",
    totalPoints: 100,
    criteria: [
      {
        name: "고객 단계 구분",
        points: 20,
        excellent: "고객 여정의 전 단계를 세밀하게 구분하고 논리적 흐름이 명확함",
        good: "주요 고객 단계를 적절히 구분함",
        fair: "기본 단계 구분은 있으나 세밀함이 부족함",
        poor: "단계 구분이 불명확하거나 누락됨",
      },
      {
        name: "터치포인트 분석",
        points: 25,
        excellent: "모든 주요 접점을 파악하고 각 접점의 중요도와 현황을 구체적으로 분석함",
        good: "주요 터치포인트를 파악하고 적절히 분석함",
        fair: "일부 터치포인트를 파악하나 분석이 부족함",
        poor: "터치포인트 분석이 불충분함",
      },
      {
        name: "페인포인트 도출",
        points: 25,
        excellent: "고객 불편 지점을 정확히 도출하고 감정 상태와 연결하여 깊이 있게 분석함",
        good: "주요 페인포인트를 도출하고 설명함",
        fair: "일부 페인포인트를 파악하나 분석 깊이가 부족함",
        poor: "페인포인트 도출이 미흡함",
      },
      {
        name: "개선 아이디어",
        points: 20,
        excellent: "페인포인트와 직결된 창의적이고 실행가능한 개선 아이디어 제시",
        good: "적절한 개선 아이디어를 제시함",
        fair: "개선 아이디어가 있으나 구체성이 부족함",
        poor: "개선 아이디어가 부재하거나 현실성이 없음",
      },
      {
        name: "시각화 완성도",
        points: 10,
        excellent: "전문적 수준의 시각화로 내용을 직관적으로 전달함",
        good: "시각화가 적절하게 이루어짐",
        fair: "기본적인 시각화는 있으나 완성도가 부족함",
        poor: "시각화가 미흡하거나 없음",
      },
    ],
  },
  {
    id: "service-recovery",
    title: "서비스 회복 시나리오 루브릭",
    description: "고객불만 대응 및 서비스 회복 시나리오 평가 기준",
    totalPoints: 100,
    criteria: [
      {
        name: "문제상황 이해",
        points: 20,
        excellent: "서비스 실패 상황을 정확히 파악하고 고객 관점에서 깊이 이해함",
        good: "문제 상황을 적절히 이해하고 설명함",
        fair: "문제 상황을 부분적으로 이해함",
        poor: "문제 상황 이해가 부족함",
      },
      {
        name: "고객감정 반영",
        points: 20,
        excellent: "고객의 감정 상태를 정확히 파악하고 공감적 표현으로 반영함",
        good: "고객 감정을 적절히 반영함",
        fair: "고객 감정 반영이 부분적임",
        poor: "고객 감정 반영이 미흡함",
      },
      {
        name: "회복전략 타당성",
        points: 30,
        excellent: "결과적·절차적·상호작용적 공정성을 모두 고려한 최적의 회복 전략 수립",
        good: "주요 회복 전략을 적절히 수립함",
        fair: "기본적인 회복 전략은 있으나 완성도 부족",
        poor: "회복 전략이 부적절하거나 미흡함",
      },
      {
        name: "대화문 현실성",
        points: 20,
        excellent: "실제 서비스 현장에서 즉시 활용 가능한 수준의 자연스러운 대화문",
        good: "현실적이고 자연스러운 대화문 구성",
        fair: "대화문이 있으나 현실감이 부족함",
        poor: "대화문의 현실성이 매우 낮음",
      },
      {
        name: "표현력",
        points: 10,
        excellent: "명확하고 전문적인 언어 사용, 오류 없는 표현",
        good: "적절한 언어 사용으로 내용 전달이 명확함",
        fair: "언어 사용에 일부 문제가 있음",
        poor: "언어 표현이 불명확하거나 오류가 많음",
      },
    ],
  },
  {
    id: "team-presentation",
    title: "팀 프로젝트 발표 루브릭",
    description: "서비스 전략 팀 프로젝트 발표 종합 평가 기준",
    totalPoints: 100,
    criteria: [
      {
        name: "문제분석",
        points: 20,
        excellent: "서비스 문제를 다각도로 심층 분석하고 근거가 명확함",
        good: "문제 분석이 논리적이고 충분한 근거를 제시함",
        fair: "기본적인 문제 분석은 수행됨",
        poor: "문제 분석이 표면적이거나 근거가 부족함",
      },
      {
        name: "전략 제안",
        points: 30,
        excellent: "창의적이고 실행가능한 전략을 구체적 데이터와 함께 제안함",
        good: "현실적인 전략을 논리적으로 제안함",
        fair: "전략 제안이 있으나 구체성 또는 현실성 부족",
        poor: "전략 제안이 미흡하거나 실행가능성이 낮음",
      },
      {
        name: "AI 도구 활용",
        points: 20,
        excellent: "다양한 AI 도구를 적재적소에 활용하여 발표 품질을 크게 향상시킴",
        good: "AI 도구를 적절히 활용하여 발표를 보완함",
        fair: "AI 도구를 활용하나 활용도가 제한적임",
        poor: "AI 도구 활용이 미흡함",
      },
      {
        name: "발표 구성",
        points: 20,
        excellent: "논리적 흐름, 명확한 시각자료, 시간 배분이 완벽함",
        good: "발표 구성이 적절하고 전달력이 좋음",
        fair: "기본적인 발표 구성은 갖추었으나 미흡한 부분이 있음",
        poor: "발표 구성이 불명확하거나 전달력이 부족함",
      },
      {
        name: "질의응답",
        points: 10,
        excellent: "날카로운 질문에도 논리적이고 자신감 있게 답변함",
        good: "질문에 적절히 답변함",
        fair: "질문에 부분적으로 답변함",
        poor: "질문에 답변하지 못하거나 내용이 부정확함",
      },
    ],
  },
];
