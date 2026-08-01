import { useMemo, useState } from 'react'
import type { AgentProject } from '../../types/agent'
import { useProjectData } from '../../context/ProjectDataContext'
import {
  toCourseInfo,
  toFeedbackSet,
  toQuizSet,
  toRubric,
  toTutorQuestions,
  toWeekPlans,
} from '../../services/aiAgent/applyToScreens'
import { Button } from '../../components/common/Button'

interface ApplyToScreensModalProps {
  open: boolean
  project: AgentProject
  onClose: () => void
}

interface TargetRow {
  key: 'courseInfo' | 'weeklyPlan' | 'quiz' | 'rubric' | 'feedback' | 'tutor'
  label: string
  before: string
  after: string
  enabled: boolean
}

export function ApplyToScreensModal({ open, project, onClose }: ApplyToScreensModalProps) {
  const { data, setCourseInfo, setWeeklyPlan, setQuizSets, setRubrics, setFeedbackSets, setTutorQuestions, notify } =
    useProjectData()
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const rows = useMemo<TargetRow[]>(() => {
    if (!open) return []
    const newCourseInfo = toCourseInfo(project)
    const newWeeklyPlan = toWeekPlans(project)
    const newQuiz = toQuizSet(project)
    const newRubric = toRubric(project)
    const newFeedback = toFeedbackSet(project)
    const newTutor = toTutorQuestions(project)

    return [
      {
        key: 'courseInfo',
        label: '과목 분석 및 기본정보 → 과목 설정',
        before: data.courseInfo ? `${data.courseInfo.courseName} (${data.courseInfo.major})` : '(없음)',
        after: `${newCourseInfo.courseName} (${newCourseInfo.major})`,
        enabled: true,
      },
      {
        key: 'weeklyPlan',
        label: '16주 계획 → 16주 수업설계',
        before: `${data.weeklyPlan.filter((w) => w.topic).length}주 입력됨`,
        after: `${newWeeklyPlan.length}주 생성됨`,
        enabled: true,
      },
      {
        key: 'quiz',
        label: '퀴즈 → 퀴즈 생성기',
        before: `기존 퀴즈 세트 ${data.quizSets.length}개`,
        after: newQuiz ? `새 퀴즈 세트 1개 추가 (${newQuiz.items.length}문항)` : '(생성된 퀴즈 없음)',
        enabled: Boolean(newQuiz),
      },
      {
        key: 'rubric',
        label: '루브릭 → 루브릭 생성기',
        before: `기존 루브릭 ${data.rubrics.length}개`,
        after: newRubric ? `새 루브릭 1개 추가 (${newRubric.criteria.length}개 평가영역)` : '(생성된 루브릭 없음)',
        enabled: Boolean(newRubric),
      },
      {
        key: 'feedback',
        label: '과제 및 피드백 기준 → 과제 피드백',
        before: `기존 피드백 세트 ${data.feedbackSets.length}개`,
        after: newFeedback ? `새 피드백 기준 1개 추가: ${newFeedback.assignmentTitle}` : '(생성된 항목 없음)',
        enabled: Boolean(newFeedback),
      },
      {
        key: 'tutor',
        label: '학생 질문과 학습자료 → AI 튜터',
        before: `기존 AI 튜터 질문 ${data.tutorQuestions.length}개`,
        after: `새 질문 ${newTutor.length}개 추가`,
        enabled: newTutor.length > 0,
      },
    ]
  }, [open, project, data])

  if (!open) return null

  const isChecked = (key: string, enabled: boolean) => (key in selected ? selected[key] : enabled)

  const handleApply = () => {
    if (isChecked('courseInfo', true)) setCourseInfo(toCourseInfo(project))
    if (isChecked('weeklyPlan', true)) {
      const weeks = toWeekPlans(project)
      if (weeks.length > 0) setWeeklyPlan(weeks)
    }
    if (isChecked('quiz', Boolean(toQuizSet(project)))) {
      const q = toQuizSet(project)
      if (q) setQuizSets([...data.quizSets, q])
    }
    if (isChecked('rubric', Boolean(toRubric(project)))) {
      const r = toRubric(project)
      if (r) setRubrics([...data.rubrics, r])
    }
    if (isChecked('feedback', Boolean(toFeedbackSet(project)))) {
      const f = toFeedbackSet(project)
      if (f) setFeedbackSets([...data.feedbackSets, f])
    }
    if (isChecked('tutor', true)) {
      const t = toTutorQuestions(project)
      if (t.length > 0) setTutorQuestions([...data.tutorQuestions, ...t])
    }
    notify('선택한 항목을 기존 화면에 반영했습니다.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-lg font-bold text-brand-950">기존 화면에 반영하기 전 확인</h2>
        <p className="mt-1.5 text-sm text-brand-600">
          아래 항목을 확인하고 반영할 항목만 선택하세요. 최종 승인해야 실제 화면 데이터가 바뀝니다.
        </p>

        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <label
              key={row.key}
              className={`flex items-start gap-3 rounded-xl border p-4 ${row.enabled ? 'border-brand-100' : 'border-brand-50 opacity-50'}`}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                disabled={!row.enabled}
                checked={isChecked(row.key, row.enabled)}
                onChange={(e) => setSelected((prev) => ({ ...prev, [row.key]: e.target.checked }))}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-900">{row.label}</p>
                <p className="mt-1 text-xs text-brand-500">현재: {row.before}</p>
                <p className="text-xs font-medium text-brand-700">변경 후: {row.after}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
            취소
          </button>
          <Button variant="primary" onClick={handleApply}>
            최종 승인 및 반영
          </Button>
        </div>
      </div>
    </div>
  )
}
