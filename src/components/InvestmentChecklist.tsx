import { CHECKLIST_ITEMS, useAppState } from '../context/AppStateContext'
import { getChecklistFeedback } from '../utils/feedback'

export default function InvestmentChecklist() {
  const { checklistChecked, toggleChecklistItem, checklistScore, checklistTier } = useAppState()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">투자 판단 체크리스트</h2>
        <p className="mt-1 text-sm text-slate-500">
          투자를 결정하기 전에 스스로 점검해볼 항목들입니다.
        </p>
      </div>

      <div className="card p-6">
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item, i) => (
            <label
              key={item}
              className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checklistChecked[i]}
                onChange={() => toggleChecklistItem(i)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
              />
              <span className="text-sm text-slate-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-navy-800">체크 결과</p>
          <p className="text-2xl font-bold text-navy-800">{checklistScore} / 10</p>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-mint-500"
            style={{ width: `${(checklistScore / 10) * 100}%` }}
          />
        </div>
        <p className="mt-4 text-sm font-medium text-navy-700">
          [{checklistTier}] {getChecklistFeedback(checklistTier)}
        </p>
      </div>
    </div>
  )
}
