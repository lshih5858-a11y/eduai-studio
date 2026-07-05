import { useAppState } from '../context/AppStateContext'
import { EDU_DISCLAIMER } from '../utils/feedback'
import type { Section } from './Header'

const GOALS = [
  '주식 기본 개념 이해하기',
  '재무지표와 리스크 살펴보기',
  '모의 포트폴리오를 구성해보기',
]

interface DashboardProps {
  onNavigate: (section: Section) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const {
    investorType,
    profileCompleted,
    portfolioMetrics,
    portfolioTouched,
    completionRate,
    checklistScore,
    quizScore,
    quizCompleted,
  } = useAppState()

  const summaryCards = [
    {
      label: '투자 성향',
      value: profileCompleted ? investorType : '진단 전',
      sub: profileCompleted ? '진단 완료' : '투자 성향 진단에서 확인해보세요',
      accent: 'text-navy-700',
    },
    {
      label: '모의 포트폴리오 위험도',
      value: portfolioTouched ? portfolioMetrics.riskLevel : '구성 전',
      sub: portfolioTouched ? `위험 점수 ${portfolioMetrics.riskScore}/100` : '포트폴리오를 구성해보세요',
      accent: 'text-navy-700',
    },
    {
      label: '학습 완료율',
      value: `${completionRate}%`,
      sub: '5개 모듈 기준',
      accent: 'text-mint-700',
    },
    {
      label: '체크리스트 점수',
      value: `${checklistScore} / 10`,
      sub: '투자 판단 체크리스트',
      accent: 'text-navy-700',
    },
    {
      label: '퀴즈 점수',
      value: quizCompleted ? `${quizScore} / 7` : '응시 전',
      sub: '초보자 주식 퀴즈',
      accent: 'text-navy-700',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600 px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-mint-300">
            AI 주식 투자 학습 코치
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">
            주식 투자는 예측보다 원칙,<br className="hidden sm:block" /> 감정보다 리스크 관리가 중요합니다.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-navy-100 sm:text-base">
            {EDU_DISCLAIMER}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary bg-mint-500 hover:bg-mint-400" onClick={() => onNavigate('profile')}>
              투자 성향 진단 시작하기
            </button>
            <button
              className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => onNavigate('lessons')}
            >
              기초 학습 카드 보기
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">오늘의 학습 목표</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {GOALS.map((goal, i) => (
            <div key={goal} className="card flex items-start gap-3 p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-navy-800">{goal}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">학습 현황 요약</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((c) => (
            <div key={c.label} className="card p-5">
              <p className="text-xs font-medium text-slate-400">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.accent}`}>{c.value}</p>
              <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
