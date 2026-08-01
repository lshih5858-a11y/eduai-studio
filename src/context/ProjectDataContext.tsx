import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  CourseInfo,
  ExampleCoursePackage,
  FeedbackSet,
  ProjectData,
  QuizSet,
  Rubric,
  TutorQuestion,
  WeekPlan,
} from '../types'
import { createEmptyProjectData, loadProjectData, saveProjectData } from '../utils/storage'

interface ToastState {
  message: string
  visible: boolean
}

interface ProjectDataContextValue {
  data: ProjectData
  toast: ToastState
  notify: (message: string) => void
  setCourseInfo: (info: CourseInfo) => void
  setWeeklyPlan: (plan: WeekPlan[]) => void
  setQuizSets: (sets: QuizSet[]) => void
  setRubrics: (rubrics: Rubric[]) => void
  setFeedbackSets: (sets: FeedbackSet[]) => void
  setTutorQuestions: (questions: TutorQuestion[]) => void
  loadExample: (pkg: ExampleCoursePackage) => void
  resetAll: () => void
  importData: (incoming: ProjectData) => void
}

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null)

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProjectData>(() => loadProjectData() ?? createEmptyProjectData())
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false })

  const notify = useCallback((message: string) => {
    setToast({ message, visible: true })
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 2200)
  }, [])

  const FAILURE_MESSAGE = '브라우저 저장 공간 문제로 데이터를 저장하지 못했습니다. 내보내기로 백업해주세요.'

  const persist = useCallback(
    (updater: (prev: ProjectData) => ProjectData, successMessage: string) => {
      let saved = false
      setData((prev) => {
        const next = updater(prev)
        const withTimestamp = { ...next, updatedAt: new Date().toISOString() }
        saved = saveProjectData(withTimestamp)
        return withTimestamp
      })
      notify(saved ? successMessage : FAILURE_MESSAGE)
    },
    [notify],
  )

  const setCourseInfo = useCallback(
    (info: CourseInfo) => {
      persist((prev) => ({ ...prev, courseInfo: info }), '과목 설정이 저장되었습니다.')
    },
    [persist],
  )

  const setWeeklyPlan = useCallback(
    (plan: WeekPlan[]) => {
      persist((prev) => ({ ...prev, weeklyPlan: plan }), '16주 수업설계가 저장되었습니다.')
    },
    [persist],
  )

  const setQuizSets = useCallback(
    (sets: QuizSet[]) => {
      persist((prev) => ({ ...prev, quizSets: sets }), '퀴즈가 저장되었습니다.')
    },
    [persist],
  )

  const setRubrics = useCallback(
    (rubrics: Rubric[]) => {
      persist((prev) => ({ ...prev, rubrics }), '루브릭이 저장되었습니다.')
    },
    [persist],
  )

  const setFeedbackSets = useCallback(
    (sets: FeedbackSet[]) => {
      persist((prev) => ({ ...prev, feedbackSets: sets }), '과제 피드백이 저장되었습니다.')
    },
    [persist],
  )

  const setTutorQuestions = useCallback(
    (questions: TutorQuestion[]) => {
      persist((prev) => ({ ...prev, tutorQuestions: questions }), 'AI 튜터 자료가 저장되었습니다.')
    },
    [persist],
  )

  const loadExample = useCallback(
    (pkg: ExampleCoursePackage) => {
      persist(
        () => ({
          courseInfo: pkg.courseInfo,
          weeklyPlan: pkg.weeklyPlan,
          quizSets: pkg.quizSets,
          rubrics: pkg.rubrics,
          feedbackSets: pkg.feedbackSets,
          tutorQuestions: pkg.tutorQuestions,
          lastLoadedExample: pkg.label,
          updatedAt: new Date().toISOString(),
        }),
        `'${pkg.label}' 예시 데이터를 불러왔습니다.`,
      )
    },
    [persist],
  )

  const resetAll = useCallback(() => {
    const empty = createEmptyProjectData()
    const saved = saveProjectData(empty)
    setData(empty)
    notify(saved ? '모든 데이터가 초기화되었습니다.' : FAILURE_MESSAGE)
  }, [notify])

  const importData = useCallback(
    (incoming: ProjectData) => {
      persist(() => incoming, '데이터를 불러왔습니다.')
    },
    [persist],
  )

  const value = useMemo<ProjectDataContextValue>(
    () => ({
      data,
      toast,
      notify,
      setCourseInfo,
      setWeeklyPlan,
      setQuizSets,
      setRubrics,
      setFeedbackSets,
      setTutorQuestions,
      loadExample,
      resetAll,
      importData,
    }),
    [
      data,
      toast,
      notify,
      setCourseInfo,
      setWeeklyPlan,
      setQuizSets,
      setRubrics,
      setFeedbackSets,
      setTutorQuestions,
      loadExample,
      resetAll,
      importData,
    ],
  )

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>
}

export function useProjectData(): ProjectDataContextValue {
  const ctx = useContext(ProjectDataContext)
  if (!ctx) {
    throw new Error('useProjectData는 ProjectDataProvider 내부에서 사용해야 합니다.')
  }
  return ctx
}
