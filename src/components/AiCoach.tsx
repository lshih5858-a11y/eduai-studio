import { useState } from 'react'
import { getAiCoachAnswer } from '../utils/feedback'

interface ChatEntry {
  question: string
  answer: string
}

const EXAMPLE_QUESTIONS = [
  'PER이 뭐예요?',
  '분산투자가 왜 중요해요?',
  '배당주는 안전한가요?',
  '성장주는 왜 위험한가요?',
  'ETF는 무엇인가요?',
  '주가가 떨어지면 어떻게 해야 하나요?',
  '초보자는 무엇부터 공부해야 하나요?',
]

export default function AiCoach() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<ChatEntry[]>([])

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    const answer = getAiCoachAnswer(trimmed)
    setHistory((prev) => [...prev, { question: trimmed, answer }])
    setInput('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">AI 주식 학습 코치</h2>
        <p className="mt-1 text-sm text-slate-500">
          궁금한 주식 개념을 질문하면 키워드 기반 규칙으로 학습 설명을 제공합니다. (외부 AI API 미연결)
        </p>
      </div>

      <div className="card p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: PER이 뭐예요?"
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-400 focus:outline-none"
          />
          <button type="submit" className="btn-primary">질문하기</button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-navy-300 hover:text-navy-700"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {history.length === 0 && (
          <p className="text-sm text-slate-400">질문을 입력하거나 예시 질문을 눌러보세요.</p>
        )}
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="card p-5">
            <p className="text-sm font-semibold text-navy-800">Q. {entry.question}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {entry.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
