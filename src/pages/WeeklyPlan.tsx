import { useEffect, useState } from 'react'
import { ChevronDown, Copy, Download, Printer, RotateCcw, Save, Sparkles } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { TextField, TextareaField } from '../components/common/FormField'
import { generateBlankWeeklyPlan } from '../data/exampleData'
import { downloadJson, copyToClipboard } from '../utils/download'
import type { WeekPlan } from '../types'

const fieldLabels: { key: keyof WeekPlan; label: string; area?: boolean }[] = [
  { key: 'topic', label: '주제' },
  { key: 'objectives', label: '학습 목표', area: true },
  { key: 'keyConcepts', label: '핵심 개념', area: true },
  { key: 'teachingActivities', label: '교수 활동', area: true },
  { key: 'studentActivities', label: '학생 활동', area: true },
  { key: 'aiUsage', label: 'AI 활용 방법', area: true },
  { key: 'assignment', label: '과제', area: true },
  { key: 'evaluationMethod', label: '평가 방법', area: true },
]

function planToText(plan: WeekPlan[]): string {
  return plan
    .map(
      (w) =>
        `[${w.week}주차] ${w.topic}\n- 학습 목표: ${w.objectives}\n- 핵심 개념: ${w.keyConcepts}\n- 교수 활동: ${w.teachingActivities}\n- 학생 활동: ${w.studentActivities}\n- AI 활용 방법: ${w.aiUsage}\n- 과제: ${w.assignment}\n- 평가 방법: ${w.evaluationMethod}`,
    )
    .join('\n\n')
}

export function WeeklyPlan() {
  const { data, setWeeklyPlan, notify } = useProjectData()
  const [plan, setPlan] = useState<WeekPlan[]>(data.weeklyPlan)
  const [openWeek, setOpenWeek] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<'reset' | 'regenerate' | null>(null)

  useEffect(() => {
    setPlan(data.weeklyPlan)
  }, [data.weeklyPlan])

  const updateWeek = (week: number, key: keyof WeekPlan, value: string) => {
    setPlan((prev) => prev.map((w) => (w.week === week ? { ...w, [key]: value } : w)))
  }

  const handleSave = () => {
    setWeeklyPlan(plan)
  }

  const handleGenerate = () => {
    if (plan.length > 0) {
      setConfirmAction('regenerate')
      return
    }
    setPlan(generateBlankWeeklyPlan())
  }

  const handleCopy = async () => {
    if (plan.length === 0) return
    try {
      await copyToClipboard(planToText(plan))
      notify('16주 수업설계가 클립보드에 복사되었습니다.')
    } catch {
      notify('복사에 실패했습니다. 브라우저 권한을 확인해주세요.')
    }
  }

  const handleDownload = () => {
    downloadJson(plan, `${data.courseInfo?.courseName || 'eduai-studio'}-16주수업설계.json`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleResetAll = () => {
    setPlan([])
    setWeeklyPlan([])
    setConfirmAction(null)
  }

  const handleRegenerate = () => {
    setPlan(generateBlankWeeklyPlan())
    setConfirmAction(null)
  }

  return (
    <div>
      <PageHeader
        title="16주 수업설계"
        description="주차별 주제, 학습 목표, 교수·학생 활동, AI 활용 방법을 설계하세요."
        actions={
          <>
            <Button onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              16주 자동 예시 생성
            </Button>
            <Button onClick={handleCopy} disabled={plan.length === 0}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              복사
            </Button>
            <Button onClick={handleDownload} disabled={plan.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" />
              파일로 저장
            </Button>
            <Button onClick={handlePrint} disabled={plan.length === 0}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              인쇄
            </Button>
            <Button variant="danger" onClick={() => setConfirmAction('reset')} disabled={plan.length === 0}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              전체 초기화
            </Button>
          </>
        }
      />

      {plan.length === 0 ? (
        <EmptyState
          title="아직 작성된 수업설계가 없습니다"
          description="'16주 자동 예시 생성' 버튼을 눌러 기본 틀을 만들거나, 홈에서 예시 과목을 불러오세요."
          action={
            <Button variant="primary" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              16주 자동 예시 생성
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {plan.map((week) => {
            const isOpen = openWeek === week.week
            return (
              <div key={week.week} className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenWeek(isOpen ? null : week.week)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-lg bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">
                      {week.week}주차
                    </span>
                    <span className="truncate text-base font-medium text-brand-950">{week.topic || '(주제 미입력)'}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-brand-100 px-4 py-4 sm:px-5">
                    {fieldLabels.map((f) =>
                      f.area ? (
                        <TextareaField
                          key={f.key}
                          label={f.label}
                          htmlFor={`week-${week.week}-${f.key}`}
                          rows={2}
                          value={week[f.key] as string}
                          onChange={(e) => updateWeek(week.week, f.key, e.target.value)}
                        />
                      ) : (
                        <TextField
                          key={f.key}
                          label={f.label}
                          htmlFor={`week-${week.week}-${f.key}`}
                          value={week[f.key] as string}
                          onChange={(e) => updateWeek(week.week, f.key, e.target.value)}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {plan.length > 0 && (
        <div className="no-print pointer-events-none sticky bottom-4 mt-6 flex justify-end">
          <Button variant="primary" onClick={handleSave} className="pointer-events-auto shadow-lg">
            <Save className="h-4 w-4" aria-hidden="true" />
            저장
          </Button>
        </div>
      )}

      <ConfirmModal
        open={confirmAction === 'reset'}
        title="16주 수업설계를 초기화할까요?"
        description="모든 주차의 입력 내용이 삭제되며 되돌릴 수 없습니다."
        confirmLabel="초기화"
        onConfirm={handleResetAll}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction === 'regenerate'}
        title="16주 예시 틀을 다시 생성할까요?"
        description="현재 작성 중인 내용이 기본 틀로 대체됩니다. 저장하지 않은 내용은 사라집니다."
        confirmLabel="다시 생성"
        danger={false}
        onConfirm={handleRegenerate}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
