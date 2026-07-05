import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  calculatePortfolioMetrics,
  emptyAllocation,
  getChecklistTier,
  getInvestorType,
  getQuizTier,
  type InvestorType,
  type PortfolioAllocation,
  type PortfolioMetrics,
} from '../utils/calculations'
import { lessonCards } from '../data/lessons'
import { quizQuestions } from '../data/quizzes'

export const CHECKLIST_ITEMS = [
  '이 기업이 무엇으로 돈을 버는지 설명할 수 있다.',
  '최근 실적 흐름을 확인했다.',
  'PER, PBR, ROE를 확인했다.',
  '부채와 현금흐름을 확인했다.',
  '산업 전망을 살펴봤다.',
  '손실 가능성을 감당할 수 있다.',
  '투자 기간을 정했다.',
  '한 종목에 과도하게 집중하지 않았다.',
  '뉴스나 소문이 아니라 근거를 가지고 판단했다.',
  '매도 기준을 미리 생각했다.',
]

interface AppStateValue {
  profileAnswers: (number | null)[]
  setProfileAnswer: (index: number, score: number) => void
  investorType: InvestorType | null
  profileCompleted: boolean

  allocation: PortfolioAllocation
  setAllocation: (allocation: PortfolioAllocation) => void
  portfolioMetrics: PortfolioMetrics
  portfolioTouched: boolean

  checklistChecked: boolean[]
  toggleChecklistItem: (index: number) => void
  checklistScore: number
  checklistTier: ReturnType<typeof getChecklistTier>

  quizAnswers: (number | null)[]
  setQuizAnswer: (index: number, optionIndex: number) => void
  quizScore: number
  quizCompleted: boolean
  quizTier: ReturnType<typeof getQuizTier>

  lessonsOpened: Set<string>
  markLessonOpened: (id: string) => void

  completionRate: number
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profileAnswers, setProfileAnswers] = useState<(number | null)[]>(
    Array(5).fill(null),
  )
  const [allocation, setAllocationState] = useState<PortfolioAllocation>(emptyAllocation)
  const [portfolioTouched, setPortfolioTouched] = useState(false)
  const [checklistChecked, setChecklistChecked] = useState<boolean[]>(
    Array(CHECKLIST_ITEMS.length).fill(false),
  )
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null),
  )
  const [lessonsOpened, setLessonsOpened] = useState<Set<string>>(new Set())

  const setProfileAnswer = (index: number, score: number) => {
    setProfileAnswers((prev) => {
      const next = [...prev]
      next[index] = score
      return next
    })
  }

  const profileCompleted = profileAnswers.every((a) => a !== null)
  const investorType = profileCompleted
    ? getInvestorType(profileAnswers.reduce((sum, s) => sum + (s ?? 0), 0))
    : null

  const setAllocation = (next: PortfolioAllocation) => {
    setPortfolioTouched(true)
    setAllocationState(next)
  }

  const portfolioMetrics = useMemo(
    () => calculatePortfolioMetrics(allocation),
    [allocation],
  )

  const toggleChecklistItem = (index: number) => {
    setChecklistChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }
  const checklistScore = checklistChecked.filter(Boolean).length
  const checklistTier = getChecklistTier(checklistScore)

  const setQuizAnswer = (index: number, optionIndex: number) => {
    setQuizAnswers((prev) => {
      const next = [...prev]
      next[index] = optionIndex
      return next
    })
  }
  const quizCompleted = quizAnswers.every((a) => a !== null)
  const quizScore = quizAnswers.reduce<number>((sum, answer, i) => {
    if (answer === null) return sum
    return sum + (answer === quizQuestions[i].answerIndex ? 1 : 0)
  }, 0)
  const quizTier = getQuizTier(quizScore)

  const markLessonOpened = (id: string) => {
    setLessonsOpened((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const completionRate = useMemo(() => {
    const modules = [
      profileCompleted,
      portfolioTouched && portfolioMetrics.isValid,
      checklistScore > 0,
      quizCompleted,
      lessonsOpened.size >= Math.ceil(lessonCards.length / 2),
    ]
    const completedCount = modules.filter(Boolean).length
    return Math.round((completedCount / modules.length) * 100)
  }, [profileCompleted, portfolioTouched, portfolioMetrics.isValid, checklistScore, quizCompleted, lessonsOpened])

  const value: AppStateValue = {
    profileAnswers,
    setProfileAnswer,
    investorType,
    profileCompleted,
    allocation,
    setAllocation,
    portfolioMetrics,
    portfolioTouched,
    checklistChecked,
    toggleChecklistItem,
    checklistScore,
    checklistTier,
    quizAnswers,
    setQuizAnswer,
    quizScore,
    quizCompleted,
    quizTier,
    lessonsOpened,
    markLessonOpened,
    completionRate,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
