import { quizQuestions } from '../data/quizzes'
import { useAppState } from '../context/AppStateContext'
import { getQuizFeedback } from '../utils/feedback'

export default function QuizSection() {
  const { quizAnswers, setQuizAnswer, quizScore, quizCompleted, quizTier } = useAppState()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">초보자 주식 퀴즈</h2>
        <p className="mt-1 text-sm text-slate-500">
          7개의 객관식 문제로 오늘 배운 개념을 점검해보세요.
        </p>
      </div>

      <div className="space-y-4">
        {quizQuestions.map((q, qIndex) => {
          const selected = quizAnswers[qIndex]
          const isAnswered = selected !== null
          return (
            <div key={q.id} className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-mint-600">
                {q.topic}
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900">
                {qIndex + 1}. {q.question}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((option, optIndex) => {
                  const isCorrect = optIndex === q.answerIndex
                  const isSelected = selected === optIndex
                  let style = 'border-slate-200 bg-white text-slate-600 hover:border-navy-300'
                  if (isAnswered && isSelected && isCorrect) {
                    style = 'border-mint-500 bg-mint-50 text-mint-800'
                  } else if (isAnswered && isSelected && !isCorrect) {
                    style = 'border-orange-400 bg-orange-50 text-orange-700'
                  } else if (isAnswered && isCorrect) {
                    style = 'border-mint-300 bg-mint-50/60 text-mint-700'
                  }
                  return (
                    <button
                      key={optIndex}
                      disabled={isAnswered}
                      onClick={() => setQuizAnswer(qIndex, optIndex)}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${style} disabled:cursor-default`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {isAnswered && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {selected === q.answerIndex ? '✅ 정답입니다. ' : '❌ 오답입니다. '}
                  {q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {quizCompleted && (
        <div className="card p-6">
          <p className="text-sm font-semibold text-navy-800">퀴즈 결과</p>
          <p className="mt-1 text-3xl font-bold text-navy-900">{quizScore} / {quizQuestions.length}</p>
          <p className="mt-3 text-sm font-medium text-navy-700">
            [{quizTier}] {getQuizFeedback(quizTier)}
          </p>
        </div>
      )}
    </div>
  )
}
