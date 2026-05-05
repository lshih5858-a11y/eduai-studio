import { Lightbulb } from 'lucide-react'

/**
 * 공통 "수업에서 이렇게 사용하세요" 안내 박스
 * steps: [{ icon, text }]
 * tip: 추가 팁 문자열 (선택)
 */
export default function UsageGuide({ steps, tip }) {
  return (
    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-sky-500 rounded-lg p-1.5">
          <Lightbulb size={15} className="text-white" />
        </div>
        <p className="font-bold text-sky-800 text-sm">수업에서 이렇게 사용하세요</p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="text-sm text-sky-900 leading-relaxed">
              <span className="mr-1">{step.icon}</span>
              {step.text}
            </div>
          </li>
        ))}
      </ol>
      {tip && (
        <div className="mt-3 pt-3 border-t border-sky-200 text-xs text-sky-700 flex items-start gap-1.5">
          <span className="font-semibold flex-shrink-0">💡 팁:</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  )
}
