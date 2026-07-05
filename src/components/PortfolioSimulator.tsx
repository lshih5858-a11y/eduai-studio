import { useAppState } from '../context/AppStateContext'
import type { PortfolioAllocation } from '../utils/calculations'
import { getPortfolioFeedback } from '../utils/feedback'

const ASSET_LABELS: Record<keyof PortfolioAllocation, string> = {
  largeCap: '대형 안정주',
  growth: '성장주',
  dividend: '배당주',
  etf: 'ETF',
  cash: '현금',
}

const ASSET_KEYS = Object.keys(ASSET_LABELS) as (keyof PortfolioAllocation)[]

export default function PortfolioSimulator() {
  const { allocation, setAllocation, portfolioMetrics } = useAppState()

  const updateAsset = (key: keyof PortfolioAllocation, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)))
    setAllocation({ ...allocation, [key]: clamped })
  }

  const feedbackMessages = getPortfolioFeedback(allocation, portfolioMetrics)

  const metricRows: [string, number, string][] = [
    ['예상 위험도', portfolioMetrics.riskScore, portfolioMetrics.riskLevel],
    ['안정성', portfolioMetrics.stability, ''],
    ['성장 가능성', portfolioMetrics.growthPotential, ''],
    ['현금 대응력', portfolioMetrics.cashResilience, ''],
    ['배당 기대 수준', portfolioMetrics.dividendExpectation, ''],
    ['분산투자 점수', portfolioMetrics.diversificationScore, ''],
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">모의 포트폴리오 시뮬레이터</h2>
        <p className="mt-1 text-sm text-slate-500">
          가상 투자금 1,000만 원을 자산별로 배분하고, 리스크와 분산투자 효과를 학습해보세요.
        </p>
      </div>

      <div className="card space-y-6 p-6">
        {ASSET_KEYS.map((key) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-navy-800">{ASSET_LABELS[key]}</span>
              <span className="text-navy-700">
                {allocation[key]}%{' '}
                <span className="text-xs text-slate-400">
                  ({(allocation[key] * 100000).toLocaleString()}원)
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={allocation[key]}
                onChange={(e) => updateAsset(key, Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-navy-700"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={allocation[key]}
                onChange={(e) => updateAsset(key, Number(e.target.value))}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm"
              />
            </div>
          </div>
        ))}

        <div
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
            portfolioMetrics.isValid
              ? 'bg-mint-50 text-mint-800'
              : 'bg-orange-50 text-orange-700'
          }`}
        >
          현재 배분 합계: {portfolioMetrics.totalPercent}%{' '}
          {portfolioMetrics.isValid ? '· 100%를 정확히 채웠습니다.' : '· 비율 합계가 100%가 되어야 합니다.'}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricRows.map(([label, value, extra]) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-navy-800">
              {value}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </p>
            {extra && <p className="mt-1 text-xs font-semibold text-orange-600">{extra}</p>}
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-navy-600"
                style={{ width: `${Math.min(100, value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-2 p-6">
        <p className="text-sm font-semibold text-navy-800">학습용 피드백</p>
        {feedbackMessages.map((msg) => (
          <p key={msg} className="text-sm text-slate-600">
            💬 {msg}
          </p>
        ))}
      </div>

      <div className="disclaimer">
        이 시뮬레이터의 배분과 결과는 실제 투자 성과를 예측하지 않으며, 학습 목적의 가상 계산입니다.
      </div>
    </div>
  )
}
