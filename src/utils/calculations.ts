export type InvestorType = '안정형' | '균형형' | '적극형'

export interface ProfileQuestionOption {
  text: string
  score: number
}

export interface ProfileQuestion {
  id: string
  question: string
  options: ProfileQuestionOption[]
}

export const profileQuestions: ProfileQuestion[] = [
  {
    id: 'q1',
    question: '투자금이 10% 하락하면 어떻게 반응하겠습니까?',
    options: [
      { text: '불안해서 바로 매도한다', score: 1 },
      { text: '불안하지만 일단 지켜본다', score: 2 },
      { text: '이유를 점검하고 상황에 대응한다', score: 3 },
      { text: '저가 매수 기회로 보고 추가 매수를 고려한다', score: 4 },
    ],
  },
  {
    id: 'q2',
    question: '투자 기간은 어느 정도를 생각합니까?',
    options: [
      { text: '6개월 이내 단기', score: 1 },
      { text: '1년 내외', score: 2 },
      { text: '3년 정도 중장기', score: 3 },
      { text: '5년 이상 장기', score: 4 },
    ],
  },
  {
    id: 'q3',
    question: '안정적인 배당주와 성장주 중 무엇을 선호합니까?',
    options: [
      { text: '배당주를 훨씬 선호한다', score: 1 },
      { text: '배당주를 조금 더 선호한다', score: 2 },
      { text: '성장주를 조금 더 선호한다', score: 3 },
      { text: '성장주를 훨씬 선호한다', score: 4 },
    ],
  },
  {
    id: 'q4',
    question: '주가 변동을 얼마나 자주 확인합니까?',
    options: [
      { text: '거의 확인하지 않는다', score: 1 },
      { text: '일주일에 한두 번 확인한다', score: 2 },
      { text: '하루에 한 번 정도 확인한다', score: 3 },
      { text: '하루에도 여러 번 확인한다', score: 4 },
    ],
  },
  {
    id: 'q5',
    question: '투자에서 더 중요한 것은 안정성입니까, 수익 가능성입니까?',
    options: [
      { text: '안정성이 훨씬 중요하다', score: 1 },
      { text: '안정성이 조금 더 중요하다', score: 2 },
      { text: '수익 가능성이 조금 더 중요하다', score: 3 },
      { text: '수익 가능성이 훨씬 중요하다', score: 4 },
    ],
  },
]

export function getInvestorType(totalScore: number): InvestorType {
  if (totalScore <= 9) return '안정형'
  if (totalScore <= 15) return '균형형'
  return '적극형'
}

export interface PortfolioAllocation {
  largeCap: number
  growth: number
  dividend: number
  etf: number
  cash: number
}

export const emptyAllocation: PortfolioAllocation = {
  largeCap: 20,
  growth: 20,
  dividend: 20,
  etf: 20,
  cash: 20,
}

export type RiskLevel = '낮음' | '중간' | '높음'

export interface PortfolioMetrics {
  totalPercent: number
  isValid: boolean
  riskScore: number
  riskLevel: RiskLevel
  stability: number
  growthPotential: number
  cashResilience: number
  dividendExpectation: number
  diversificationScore: number
  concentratedAsset: keyof PortfolioAllocation | null
}

const RISK_WEIGHT: Record<keyof PortfolioAllocation, number> = {
  largeCap: 2,
  growth: 5,
  dividend: 1.5,
  etf: 2.2,
  cash: 0,
}

const STABILITY_WEIGHT: Record<keyof PortfolioAllocation, number> = {
  largeCap: 3.5,
  growth: 0.5,
  dividend: 4,
  etf: 3,
  cash: 5,
}

const GROWTH_WEIGHT: Record<keyof PortfolioAllocation, number> = {
  largeCap: 2.5,
  growth: 5,
  dividend: 1.5,
  etf: 3,
  cash: 0,
}

const DIVIDEND_WEIGHT: Record<keyof PortfolioAllocation, number> = {
  largeCap: 2,
  growth: 0,
  dividend: 5,
  etf: 1.5,
  cash: 0,
}

function weightedScore(
  allocation: PortfolioAllocation,
  weights: Record<keyof PortfolioAllocation, number>,
): number {
  const keys = Object.keys(allocation) as (keyof PortfolioAllocation)[]
  const total = keys.reduce((sum, key) => sum + allocation[key], 0)
  if (total === 0) return 0
  const weightedSum = keys.reduce(
    (sum, key) => sum + allocation[key] * weights[key],
    0,
  )
  return Math.round((weightedSum / (total * 5)) * 100)
}

export function calculatePortfolioMetrics(
  allocation: PortfolioAllocation,
): PortfolioMetrics {
  const keys = Object.keys(allocation) as (keyof PortfolioAllocation)[]
  const totalPercent = keys.reduce((sum, key) => sum + allocation[key], 0)
  const isValid = totalPercent === 100

  const riskScore = weightedScore(allocation, RISK_WEIGHT)
  const stability = weightedScore(allocation, STABILITY_WEIGHT)
  const growthPotential = weightedScore(allocation, GROWTH_WEIGHT)
  const dividendExpectation = weightedScore(allocation, DIVIDEND_WEIGHT)
  const cashResilience = Math.min(
    100,
    Math.round(allocation.cash * 1.4 + allocation.dividend * 0.3),
  )

  const maxAllocation = Math.max(...keys.map((key) => allocation[key]))
  const nonZeroCount = keys.filter((key) => allocation[key] > 0).length
  const diversificationScore = Math.max(
    0,
    Math.round(100 - maxAllocation * 0.8 + (nonZeroCount - 1) * 5),
  )

  const concentratedAsset =
    keys.find((key) => allocation[key] >= 60) ?? null

  let riskLevel: RiskLevel = '중간'
  if (riskScore < 35) riskLevel = '낮음'
  else if (riskScore > 65) riskLevel = '높음'

  return {
    totalPercent,
    isValid,
    riskScore,
    riskLevel,
    stability,
    growthPotential,
    cashResilience,
    dividendExpectation,
    diversificationScore: Math.min(100, diversificationScore),
    concentratedAsset,
  }
}

export type ChecklistTier = '학습 우선' | '추가 확인 필요' | '균형 잡힌 준비'

export function getChecklistTier(checkedCount: number): ChecklistTier {
  if (checkedCount <= 3) return '학습 우선'
  if (checkedCount <= 6) return '추가 확인 필요'
  return '균형 잡힌 준비'
}

export type QuizTier = '개념 재학습 필요' | '지표 해석 연습 필요' | '좋은 이해도'

export function getQuizTier(score: number): QuizTier {
  if (score <= 2) return '개념 재학습 필요'
  if (score <= 5) return '지표 해석 연습 필요'
  return '좋은 이해도'
}
