import { useState } from 'react'
import { virtualStocks } from '../data/stocks'
import StockChart from './StockChart'

export default function VirtualStockMarket() {
  const [selectedId, setSelectedId] = useState(virtualStocks[0].id)
  const selected = virtualStocks.find((s) => s.id === selectedId) ?? virtualStocks[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">가상 종목 학습 · 주가 차트</h2>
        <p className="mt-1 text-sm text-slate-500">
          실제 기업이 아닌 가상 종목 5개로 재무지표 해석과 차트 읽는 법을 연습해보세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {virtualStocks.map((stock) => {
          const active = stock.id === selectedId
          return (
            <button
              key={stock.id}
              onClick={() => setSelectedId(stock.id)}
              className={`card p-4 text-left transition ${
                active ? 'border-2 border-navy-700 shadow-cardHover' : 'hover:shadow-cardHover'
              }`}
            >
              <p className="text-sm font-bold text-navy-900">{stock.name}</p>
              <p className="text-xs text-slate-400">{stock.type}</p>
              <p className="mt-2 text-lg font-bold text-navy-700">
                {stock.price.toLocaleString()}원
              </p>
              <p className="mt-1 text-xs text-slate-500">변동성 {stock.volatility}</p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5 p-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-900">{selected.name}</h3>
              <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-700">
                {selected.type}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
            {[
              ['현재가', `${selected.price.toLocaleString()}원`],
              ['PER', selected.per],
              ['PBR', selected.pbr],
              ['ROE', `${selected.roe}%`],
              ['배당수익률', `${selected.dividendYield}%`],
              ['변동성', selected.volatility],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 px-2 py-3">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-navy-800">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-800">장점</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {selected.pros.map((p) => (
                <li key={p} className="flex gap-2"><span className="text-mint-500">✓</span>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-800">위험요인</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {selected.risks.map((r) => (
                <li key={r} className="flex gap-2"><span className="text-orange-500">!</span>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-800">공부할 포인트</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {selected.studyPoints.map((s) => (
                <li key={s} className="flex gap-2"><span className="text-navy-500">·</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 text-sm font-semibold text-navy-800">관련 재무지표 해석</p>
            {selected.indicatorInterpretation}
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-800">초보자가 조심해야 할 오해</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {selected.misconceptions.map((m) => (
                <li key={m} className="flex gap-2"><span className="text-orange-500">!</span>{m}</li>
              ))}
            </ul>
          </div>
        </div>

        <StockChart stock={selected} />
      </div>
    </div>
  )
}
