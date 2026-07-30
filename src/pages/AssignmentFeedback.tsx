import { useEffect, useState } from 'react'
import { Plus, Save, ShieldAlert, Trash2 } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { TextField, TextareaField } from '../components/common/FormField'
import { generateId } from '../utils/id'
import type { FeedbackSet, StudentAnswer } from '../types'

function createBlankAnswers(): StudentAnswer[] {
  return ['학생 A', '학생 B', '학생 C'].map((label) => ({
    id: generateId('ans'),
    studentLabel: label,
    answerText: '',
    strengths: '',
    improvements: '',
    suggestions: '',
  }))
}

function createBlankFeedbackSet(): FeedbackSet {
  return {
    id: generateId('fb'),
    assignmentTitle: '새 과제 피드백',
    answers: createBlankAnswers(),
    overallComment: '',
    instructorReview: '',
    updatedAt: new Date().toISOString(),
  }
}

export function AssignmentFeedback() {
  const { data, setFeedbackSets } = useProjectData()
  const [sets, setSets] = useState<FeedbackSet[]>(data.feedbackSets)
  const [selectedId, setSelectedId] = useState<string | null>(data.feedbackSets[0]?.id ?? null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    setSets(data.feedbackSets)
    if (!selectedId && data.feedbackSets[0]) setSelectedId(data.feedbackSets[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.feedbackSets])

  const selected = sets.find((s) => s.id === selectedId) ?? null

  const patchSet = (patch: Partial<FeedbackSet>) => {
    if (!selected) return
    setSets((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)))
  }

  const patchAnswer = (answerId: string, patch: Partial<StudentAnswer>) => {
    if (!selected) return
    patchSet({ answers: selected.answers.map((a) => (a.id === answerId ? { ...a, ...patch } : a)) })
  }

  const createSet = () => {
    const set = createBlankFeedbackSet()
    setSets((prev) => [...prev, set])
    setSelectedId(set.id)
  }

  const deleteSet = (id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(null)
    setConfirmDelete(null)
  }

  const handleSave = () => {
    setFeedbackSets(sets.map((s) => (s.id === selected?.id ? { ...s, updatedAt: new Date().toISOString() } : s)))
  }

  return (
    <div>
      <PageHeader
        title="과제 피드백"
        description="가상 학생 답안 3개에 대한 강점·개선점·수정 방향 예시를 검토하고 교수자 최종 의견을 작성하세요."
        actions={
          <>
            <Button onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 피드백 세트
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!selected}>
              <Save className="h-4 w-4" aria-hidden="true" />
              저장
            </Button>
          </>
        }
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800 sm:text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          아래 학생 답안은 실제 학생의 개인정보를 사용하지 않은 <strong>가상 예시</strong>입니다. 교수자는 AI가 제안한
          피드백을 그대로 사용하지 말고 반드시 검토·수정 후 활용해야 합니다.
        </p>
      </div>

      {sets.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {sets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                s.id === selectedId ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {s.assignmentTitle}
            </button>
          ))}
        </div>
      )}

      {!selected ? (
        <EmptyState
          title="선택된 피드백 세트가 없습니다"
          description="'새 피드백 세트' 버튼을 눌러 과제 피드백 예시를 만들어보세요."
          action={
            <Button variant="primary" onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 피드백 세트 만들기
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <TextField
                  label="과제명"
                  htmlFor="assignmentTitle"
                  value={selected.assignmentTitle}
                  onChange={(e) => patchSet({ assignmentTitle: e.target.value })}
                />
              </div>
              <Button variant="danger" onClick={() => setConfirmDelete(selected.id)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                세트 삭제
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {selected.answers.map((answer) => (
              <div key={answer.id} className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {answer.studentLabel}
                  </span>
                  <span className="text-xs text-brand-400">(가상 예시 답안)</span>
                </div>
                <div className="space-y-3">
                  <TextareaField
                    label="학생 답안"
                    htmlFor={`answer-${answer.id}`}
                    rows={3}
                    value={answer.answerText}
                    onChange={(e) => patchAnswer(answer.id, { answerText: e.target.value })}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TextareaField
                      label="강점"
                      htmlFor={`strengths-${answer.id}`}
                      rows={2}
                      value={answer.strengths}
                      onChange={(e) => patchAnswer(answer.id, { strengths: e.target.value })}
                    />
                    <TextareaField
                      label="개선점"
                      htmlFor={`improvements-${answer.id}`}
                      rows={2}
                      value={answer.improvements}
                      onChange={(e) => patchAnswer(answer.id, { improvements: e.target.value })}
                    />
                  </div>
                  <TextareaField
                    label="구체적 수정 방향"
                    htmlFor={`suggestions-${answer.id}`}
                    rows={2}
                    value={answer.suggestions}
                    onChange={(e) => patchAnswer(answer.id, { suggestions: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <TextareaField
              label="종합 의견"
              htmlFor="overallComment"
              rows={3}
              value={selected.overallComment}
              onChange={(e) => patchSet({ overallComment: e.target.value })}
            />
          </div>

          <div className="rounded-2xl border border-brand-300 bg-brand-50 p-5">
            <TextareaField
              label="교수자 최종 검토"
              htmlFor="instructorReview"
              hint="AI가 제안한 피드백 내용을 검토한 뒤, 최종적으로 학생에게 전달할 의견을 작성하세요."
              rows={3}
              value={selected.instructorReview}
              onChange={(e) => patchSet({ instructorReview: e.target.value })}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="피드백 세트를 삭제할까요?"
        description="세트 안의 모든 학생 답안과 피드백이 함께 삭제되며 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => confirmDelete && deleteSet(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
