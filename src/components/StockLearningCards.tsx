import { useState } from 'react'
import { lessonCards } from '../data/lessons'
import { useAppState } from '../context/AppStateContext'

export default function StockLearningCards() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { markLessonOpened, lessonsOpened } = useAppState()

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
    markLessonOpened(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">주식 기초 학습 카드</h2>
        <p className="mt-1 text-sm text-slate-500">
          투자에 앞서 알아야 할 기본 개념을 카드로 살펴보세요. ({lessonsOpened.size} / {lessonCards.length} 열람)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessonCards.map((card) => {
          const isOpen = openId === card.id
          return (
            <div key={card.id} className="card flex flex-col p-5">
              <p className="text-lg font-bold text-navy-900">{card.term}</p>
              <p className="mt-2 text-sm text-slate-600">{card.summary}</p>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                💡 {card.analogy}
              </p>
              <p className="mt-3 text-xs font-medium text-orange-600">⚠ {card.caution}</p>

              {isOpen && (
                <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
                  {card.detail}
                </div>
              )}

              <button
                onClick={() => toggle(card.id)}
                className="btn-secondary mt-4 self-start"
              >
                {isOpen ? '접기' : '더 알아보기'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
