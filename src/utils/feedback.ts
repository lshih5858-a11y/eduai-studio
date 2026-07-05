import type { InvestorType, PortfolioAllocation, PortfolioMetrics, ChecklistTier, QuizTier } from './calculations'

export const EDU_DISCLAIMER =
  '본 프로그램은 투자 권유가 아니라 주식 공부를 위한 교육용 시뮬레이션입니다.'

export const AI_ANSWER_DISCLAIMER =
  '이 내용은 투자 권유가 아니라 학습용 설명입니다. 실제 투자 판단은 본인의 책임으로 충분히 검토해야 합니다.'

export interface InvestorProfileResult {
  type: InvestorType
  summary: string
  strengths: string[]
  cautions: string[]
  studyDirection: string[]
  riskAdvice: string
}

export function getInvestorProfileResult(type: InvestorType): InvestorProfileResult {
  switch (type) {
    case '안정형':
      return {
        type,
        summary:
          '변동성보다 원금 보전과 예측 가능성을 중시하는 성향입니다. 큰 손실보다 꾸준하고 안정적인 흐름을 선호합니다.',
        strengths: [
          '감정적인 매매보다 신중한 판단을 하는 경향이 있습니다.',
          '급격한 하락장에서도 비교적 침착하게 대응할 가능성이 높습니다.',
        ],
        cautions: [
          '지나치게 안정만 추구하면 물가 상승 대비 실질 수익이 낮아질 수 있습니다.',
          '변동성을 지나치게 회피하면 학습 기회 자체를 놓칠 수 있습니다.',
        ],
        studyDirection: [
          '대형 안정주와 배당주, ETF 중심의 자산 구조를 공부해보는 것이 좋습니다.',
          'PBR, 배당수익률 같은 안정성 지표 해석 연습을 해보세요.',
        ],
        riskAdvice:
          '안정형이라도 자산을 한 곳에만 두기보다, 소액이라도 다양한 자산 유형을 학습 삼아 공부해보는 것을 권장합니다.',
      }
    case '균형형':
      return {
        type,
        summary:
          '안정성과 수익 가능성을 함께 고려하는 균형 잡힌 성향입니다. 상황에 따라 유연하게 대응하는 편입니다.',
        strengths: [
          '한쪽으로 치우치지 않고 다양한 자산 유형을 학습하기에 좋은 성향입니다.',
          '리스크와 수익의 균형을 스스로 조절하려는 태도를 갖고 있습니다.',
        ],
        cautions: [
          '너무 많은 정보를 동시에 고려하다 판단이 늦어질 수 있습니다.',
          '균형을 맞춘다는 이유로 원칙 없이 이것저것 섞기만 하면 오히려 리스크 관리가 흐트러질 수 있습니다.',
        ],
        studyDirection: [
          '대형 안정주, 배당주, 성장주, ETF를 고르게 배분하는 포트폴리오 구조를 공부해보는 것이 좋습니다.',
          'PER, PBR, ROE를 종합적으로 해석하는 연습을 해보세요.',
        ],
        riskAdvice:
          '균형형은 특정 원칙(예: 자산별 목표 비중)을 미리 세워두고, 정기적으로 리밸런싱하는 습관을 학습하는 것이 도움이 됩니다.',
      }
    case '적극형':
      return {
        type,
        summary:
          '높은 변동성을 감수하더라도 수익 가능성을 우선시하는 성향입니다. 새로운 산업과 성장 스토리에 관심이 많습니다.',
        strengths: [
          '변화하는 산업 트렌드를 빠르게 학습하고 받아들이는 태도를 갖고 있습니다.',
          '높은 변동성 자산의 구조를 이해하는 데 적극적입니다.',
        ],
        cautions: [
          '기대감만으로 판단하면 큰 손실 위험에 노출될 수 있습니다.',
          '잦은 매매 확인은 감정적 의사결정으로 이어지기 쉽습니다.',
        ],
        studyDirection: [
          '성장주와 테마주의 밸류에이션 구조, 그리고 리스크 관리 원칙을 함께 공부해보는 것이 좋습니다.',
          '손절 기준과 리밸런싱 개념을 반드시 함께 학습해보세요.',
        ],
        riskAdvice:
          '적극형일수록 손실 감내 범위와 손절 기준을 명확히 세워두는 리스크 관리 학습이 특히 중요합니다.',
      }
  }
}

export function getPortfolioFeedback(
  allocation: PortfolioAllocation,
  metrics: PortfolioMetrics,
): string[] {
  const messages: string[] = []

  if (allocation.growth >= 40) {
    messages.push('성장주 비중이 높습니다. 수익 가능성은 높지만 변동성도 커질 수 있습니다.')
  }
  if (allocation.cash >= 30) {
    messages.push('현금 비중이 높습니다. 하락장 대응력은 좋지만 상승장 참여도는 낮을 수 있습니다.')
  }
  if (allocation.etf >= 40) {
    messages.push(
      'ETF 비중이 높습니다. 분산투자 효과를 기대할 수 있지만 개별 종목보다 큰 수익을 기대하기는 어려울 수 있습니다.',
    )
  }
  if (metrics.concentratedAsset) {
    messages.push('특정 자산에 60% 이상 집중되어 있어 리스크가 커질 수 있습니다.')
  }
  if (allocation.dividend >= 40) {
    messages.push('배당주 비중이 높습니다. 안정적인 현금흐름을 기대할 수 있지만 자본 차익은 제한적일 수 있습니다.')
  }
  if (messages.length === 0) {
    messages.push('여러 자산에 고르게 배분되어 있어 균형 잡힌 학습용 포트폴리오 구조를 보이고 있습니다.')
  }
  return messages
}

export function getChecklistFeedback(tier: ChecklistTier): string {
  switch (tier) {
    case '학습 우선':
      return '아직 투자 판단보다 공부가 먼저 필요합니다.'
    case '추가 확인 필요':
      return '기본 점검은 했지만 추가 확인이 필요합니다.'
    case '균형 잡힌 준비':
      return '비교적 균형 잡힌 투자 판단 준비가 되어 있습니다.'
  }
}

export function getQuizFeedback(tier: QuizTier): string {
  switch (tier) {
    case '개념 재학습 필요':
      return '기본 개념부터 다시 학습해보세요.'
    case '지표 해석 연습 필요':
      return '핵심 개념은 이해했지만 지표 해석 연습이 더 필요합니다.'
    case '좋은 이해도':
      return '초보 학습 단계에서는 좋은 이해도를 보이고 있습니다.'
  }
}

interface AiCoachRule {
  keywords: string[]
  answer: string
}

const AI_COACH_RULES: AiCoachRule[] = [
  {
    keywords: ['per', 'PER'],
    answer:
      'PER은 기업의 이익 대비 주가가 얼마나 비싼지를 보는 지표입니다. 주가를 주당순이익(EPS)으로 나누어 계산하며, 같은 업종 내 다른 기업과 비교할 때 더 의미 있게 해석할 수 있습니다.',
  },
  {
    keywords: ['pbr', 'PBR'],
    answer:
      'PBR은 기업의 순자산 대비 주가 수준을 보는 지표입니다. 주가를 주당순자산(BPS)으로 나누어 계산하며, 1보다 낮으면 장부가치보다 싸게 거래되고 있다는 의미로 해석할 수 있습니다.',
  },
  {
    keywords: ['roe', 'ROE'],
    answer:
      'ROE는 자기자본으로 얼마나 효율적으로 이익을 내는지를 보는 지표입니다. 다만 부채가 많아져도 ROE가 높아질 수 있으니 부채 수준을 함께 확인하는 것이 좋습니다.',
  },
  {
    keywords: ['분산투자', '분산'],
    answer:
      '분산투자는 한 종목에 모든 돈을 넣지 않고 여러 자산에 나누어 담아 위험을 나누는 방법입니다. 특정 자산이 하락해도 포트폴리오 전체가 크게 흔들리지 않도록 도와줍니다.',
  },
  {
    keywords: ['배당', '배당주'],
    answer:
      '배당은 기업이 이익 일부를 주주에게 나누어주는 것입니다. 배당주는 꾸준한 현금흐름을 기대할 수 있지만, 배당수익률이 높다고 무조건 안전한 것은 아니며 기업의 실적과 배당 지속 가능성을 함께 확인해야 합니다.',
  },
  {
    keywords: ['성장주'],
    answer:
      '성장주는 미래 이익 성장에 대한 기대감이 주가에 많이 반영되어 있는 경우가 많습니다. 실적이 기대에 못 미치면 주가가 크게 조정될 수 있어 변동성이 큰 편입니다.',
  },
  {
    keywords: ['etf', 'ETF'],
    answer:
      'ETF는 여러 종목을 묶어 하나의 상품처럼 거래할 수 있는 투자수단입니다. 개별 종목보다 분산 효과가 크지만, 시장 전체가 하락하면 ETF도 함께 하락할 수 있습니다.',
  },
  {
    keywords: ['주가가 떨어지면', '하락', '손실', '떨어지면'],
    answer:
      '주가가 떨어졌을 때는 감정적으로 대응하지 말고, 애초에 투자한 이유와 자신의 리스크 허용 범위를 다시 점검하는 것이 중요합니다. 미리 정한 손절 기준이 있다면 원칙에 따라 대응하는 연습을 해보세요.',
  },
  {
    keywords: ['초보자', '무엇부터', '처음'],
    answer:
      '초보자라면 먼저 주식, 시가총액 같은 기본 개념과 PER, PBR, ROE 같은 재무지표를 이해하는 것부터 시작하는 것이 좋습니다. 이후 분산투자와 리스크 관리 개념을 함께 학습해보세요.',
  },
  {
    keywords: ['변동성'],
    answer:
      '변동성은 주가가 일정 기간 동안 얼마나 크게 오르내리는지를 나타내는 정도입니다. 변동성이 큰 자산은 단기간에 큰 폭의 수익 또는 손실이 발생할 수 있어 본인의 리스크 허용 범위를 고려해야 합니다.',
  },
  {
    keywords: ['장기투자', '장기'],
    answer:
      '장기투자는 단기적인 주가 변동보다 기업의 사업 모델과 성장성을 바탕으로 긴 시간에 걸쳐 투자하는 방식입니다. 다만 장기투자라고 해서 수익을 보장하지는 않습니다.',
  },
  {
    keywords: ['손절'],
    answer:
      '손절은 손실이 더 커지는 것을 막기 위해 미리 정한 기준에 따라 매도하는 것입니다. 감정에 흔들리지 않도록 투자 전에 손절 기준을 미리 세워두는 것이 중요합니다.',
  },
  {
    keywords: ['리밸런싱'],
    answer:
      '리밸런싱은 시간이 지나며 변한 자산 비중을 원래 계획한 비율로 다시 조정하는 것입니다. 특정 자산이 과도하게 커졌다면 일부를 다른 자산으로 재배분해 리스크 쏠림을 줄일 수 있습니다.',
  },
]

const DEFAULT_ANSWER =
  '아직 이 질문에 대한 학습 콘텐츠가 준비되어 있지 않습니다. PER, PBR, ROE, 분산투자, 배당, 변동성, 장기투자, ETF, 손절, 리밸런싱 같은 키워드로 다시 질문해보세요.'

export function getAiCoachAnswer(question: string): string {
  const normalized = question.trim()
  for (const rule of AI_COACH_RULES) {
    if (rule.keywords.some((keyword) => normalized.toLowerCase().includes(keyword.toLowerCase()))) {
      return `${rule.answer}\n\n${AI_ANSWER_DISCLAIMER}`
    }
  }
  return `${DEFAULT_ANSWER}\n\n${AI_ANSWER_DISCLAIMER}`
}
