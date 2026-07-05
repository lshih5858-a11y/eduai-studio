import { EDU_DISCLAIMER } from '../utils/feedback'

export type Section =
  | 'dashboard'
  | 'profile'
  | 'lessons'
  | 'market'
  | 'portfolio'
  | 'checklist'
  | 'quiz'
  | 'coach'
  | 'report'

interface NavItem {
  id: Section
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'profile', label: '투자 성향 진단' },
  { id: 'lessons', label: '기초 학습 카드' },
  { id: 'market', label: '가상 종목 · 차트' },
  { id: 'portfolio', label: '포트폴리오 시뮬레이터' },
  { id: 'checklist', label: '투자 체크리스트' },
  { id: 'quiz', label: '초보자 퀴즈' },
  { id: 'coach', label: 'AI 학습 코치' },
  { id: 'report', label: '월간 리포트' },
]

interface HeaderProps {
  activeSection: Section
  onNavigate: (section: Section) => void
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 text-mint-300">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M6 21L12 14L17 18L26 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 8H26V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-navy-900 sm:text-lg">
                AI 주식 투자 학습 코치
              </p>
              <p className="text-[11px] text-slate-400">교육용 모의투자 시뮬레이션</p>
            </div>
          </div>
        </div>
        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeSection === item.id
                  ? 'bg-navy-700 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-navy-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-mint-50 py-1.5 text-center text-xs font-medium text-mint-800">
        ⚠ {EDU_DISCLAIMER} 모든 종목·가격·수익률은 가상 데이터입니다.
      </div>
    </header>
  )
}
