/**
 * 각 메뉴 상단에 표시되는 "수업에서 이렇게 사용하세요" 안내 박스
 */
export default function GuideBox({ steps, tip, mode = 'professor' }) {
  const modeColor = {
    professor: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', title: 'text-blue-800', badge: 'bg-blue-100 text-blue-700', step: 'bg-blue-600' },
    student:   { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', title: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700', step: 'bg-emerald-600' },
    both:      { bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', title: 'text-violet-800', badge: 'bg-violet-100 text-violet-700', step: 'bg-violet-600' },
  }
  const c = modeColor[mode] || modeColor.both

  return (
    <div className={`bg-gradient-to-r ${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <h4 className={`text-sm font-bold ${c.title}`}>수업에서 이렇게 사용하세요</h4>
        <span className={`badge ${c.badge} ml-auto`}>사용 가이드</span>
      </div>

      {/* 단계별 흐름 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-white shadow-sm">
              <span className={`w-5 h-5 rounded-full ${c.step} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-slate-700">{step}</span>
            </div>
            {i < steps.length - 1 && <span className="text-slate-300 font-bold text-sm">→</span>}
          </div>
        ))}
      </div>

      {tip && (
        <div className="bg-white/70 rounded-xl px-4 py-2.5 border border-white">
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">💬 팁: </span>{tip}
          </p>
        </div>
      )}
    </div>
  )
}
