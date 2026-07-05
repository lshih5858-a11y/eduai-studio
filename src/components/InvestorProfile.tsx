import { useAppState } from '../context/AppStateContext'
import { profileQuestions } from '../utils/calculations'
import { getInvestorProfileResult } from '../utils/feedback'

export default function InvestorProfile() {
  const { profileAnswers, setProfileAnswer, profileCompleted, investorType } = useAppState()

  const answeredCount = profileAnswers.filter((a) => a !== null).length

  const result = investorType ? getInvestorProfileResult(investorType) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">투자 성향 진단</h2>
        <p className="mt-1 text-sm text-slate-500">
          5개의 질문에 답하면 나의 투자 성향을 학습 목적으로 분석해드립니다.
        </p>
      </div>

      <div className="card space-y-6 p-6">
        {profileQuestions.map((q, qIndex) => (
          <div key={q.id} className={qIndex > 0 ? 'border-t border-slate-100 pt-6' : ''}>
            <p className="mb-3 text-sm font-semibold text-navy-800">
              {qIndex + 1}. {q.question}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, optIndex) => {
                const selected = profileAnswers[qIndex] === opt.score
                return (
                  <button
                    key={optIndex}
                    onClick={() => setProfileAnswer(qIndex, opt.score)}
                    className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                      selected
                        ? 'border-navy-700 bg-navy-700 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-navy-300'
                    }`}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-400">{answeredCount} / {profileQuestions.length} 문항 응답 완료</p>
      </div>

      {profileCompleted && result && (
        <div className="card space-y-5 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mint-600">진단 결과</p>
            <h3 className="mt-1 text-2xl font-bold text-navy-900">{result.type}</h3>
            <p className="mt-2 text-sm text-slate-600">{result.summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-800">장점</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {result.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-mint-500">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-800">주의할 점</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {result.cautions.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-orange-500">!</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-navy-800">적합한 학습 방향</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {result.studyDirection.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-navy-500">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="risk-badge">{result.riskAdvice}</div>
          <div className="disclaimer">
            본 결과는 특정 종목 매수·매도를 권유하는 것이 아니라, 학습 방향을 제안하기 위한 교육용 참고자료입니다.
          </div>
        </div>
      )}
    </div>
  )
}
