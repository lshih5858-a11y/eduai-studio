import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VirtualStock } from '../data/stocks'

interface StockChartProps {
  stock: VirtualStock
}

export default function StockChart({ stock }: StockChartProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-navy-800">
            {stock.name} · 12개월 가상 주가 흐름 ({stock.chartPattern})
          </p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          가상 데이터
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stock.priceHistory} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()}원 (가상)`, '주가']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1fb28c"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-medium text-navy-800">
          이 차트만 보고 투자 판단을 해도 될까요?
        </p>
        <button onClick={() => setShowFeedback(true)} className="btn-secondary mt-3">
          답 확인하기
        </button>
        {showFeedback && (
          <p className="mt-3 text-sm text-slate-600">
            차트는 참고 자료일 뿐입니다. 기업의 실적, 재무상태, 산업 전망, 리스크, 투자 기간을
            함께 검토해야 합니다.
          </p>
        )}
      </div>
    </div>
  )
}
