import { useState } from 'react'
import { Send } from 'lucide-react'
import type { FollowUpLogEntry } from '../../types/agent'
import { Button } from '../../components/common/Button'

interface FollowUpPanelProps {
  followUpLog: FollowUpLogEntry[]
  onSubmit: (command: string) => { summary: string; affectedNotice: string | null }
  disabled?: boolean
}

const EXAMPLES = [
  '5주차 실습만 팀 토론형으로 수정해 주세요.',
  '프로젝트 평가비중을 35%로 변경해 주세요.',
  '1학년 수준으로 전체 난이도를 낮춰 주세요.',
  '퀴즈 중 사례형 문항을 5개 추가해 주세요.',
]

export function FollowUpPanel({ followUpLog, onSubmit, disabled }: FollowUpPanelProps) {
  const [text, setText] = useState('')
  const [lastResult, setLastResult] = useState<{ summary: string; affectedNotice: string | null } | null>(null)

  const handleSubmit = () => {
    if (!text.trim()) return
    const result = onSubmit(text.trim())
    setLastResult(result)
    setText('')
  }

  return (
    <div className="no-print sticky bottom-4 mt-8 rounded-2xl border border-brand-200 bg-white p-5 shadow-lg sm:p-6">
      <p className="mb-2 text-sm font-semibold text-brand-900">에이전트에게 추가 지시</p>
      <p className="mb-3 text-xs text-brand-500">예: {EXAMPLES[0]}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="수정하고 싶은 부분을 자유롭게 입력하세요"
          className="flex-1 rounded-lg border border-brand-200 px-3.5 py-2.5 text-base text-brand-950 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-brand-50"
        />
        <Button variant="primary" onClick={handleSubmit} disabled={disabled || !text.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
          전송
        </Button>
      </div>

      {lastResult && (
        <div className="mt-3 rounded-lg bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700">
          <p>{lastResult.summary}</p>
          {lastResult.affectedNotice && <p className="mt-1 text-accent-700">{lastResult.affectedNotice}</p>}
        </div>
      )}

      {followUpLog.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-brand-500">지시 이력 {followUpLog.length}건 보기</summary>
          <ul className="mt-2 space-y-1.5 text-xs text-brand-500">
            {followUpLog
              .slice()
              .reverse()
              .map((log) => (
                <li key={log.id}>
                  [{new Date(log.at).toLocaleTimeString('ko-KR')}] {log.command} — {log.matched ? '적용됨' : '이해 못함'}
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  )
}
