import { useEffect, useState } from 'react'
import { Plus, Save, ShieldAlert, Trash2 } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Tabs } from '../components/common/Tabs'
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
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)

  useEffect(() => {
    setSets(data.feedbackSets)
    if (!selectedId && data.feedbackSets[0]) setSelectedId(data.feedbackSets[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.feedbackSets])

  const selected = sets.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    if (selected && (!activeStudentId || !selected.answers.some((a) => a.id === activeStudentId))) {
      setActiveStudentId(selected.answers[0]?.id ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const activeAnswer = selected?.answers.find((a) => a.id === activeStudentId) ?? null

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
        description="가상 학생 답안 예시를 보고 강점·개선점·수정 방향을 정리한 뒤, 학생에게 전달할 최종 의견을 작성하세요."
        actions={
          <>
            <Button onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 피드백 만들기
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!selected}>
              <Save className="h-4 w-4" aria-hidden="true" />
              저장
            </Button>
          </>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 px-5 py-4 text-base text-accent-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          아래 학생 답안은 실제 학생의 개인정보를 사용하지 않은 <strong>가상 예시</strong>입니다. 그대로 사용하지 말고
          반드시 검토·수정 후 활용해주세요.
        </p>
      </div>

      {sets.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {sets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
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
          title="선택된 피드백이 없습니다"
          description="'새 피드백 만들기' 버튼을 눌러 과제 피드백 예시를 만들어보세요."
          action={
            <Button variant="primary" onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 피드백 만들기
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* 입력 영역: 과제명 */}
          <section className="rounded-2xl border border-brand-200 bg-brand-50/60 p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold text-brand-900">1단계 · 과제 정보</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
                이 피드백 전체 삭제
              </Button>
            </div>
          </section>

          {/* 결과 영역: 학생별 답안을 탭으로 구분해 한 번에 하나씩만 보여준다 */}
          <section>
            <h2 className="mb-5 text-lg font-semibold text-brand-900">2단계 · 학생 답안별 피드백</h2>
            <Tabs
              tabs={selected.answers.map((a) => ({ key: a.id, label: a.studentLabel }))}
              active={activeStudentId ?? ''}
              onChange={setActiveStudentId}
            />
            {activeAnswer && (
              <div className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
                <p className="mb-5 text-sm text-brand-400">(가상 예시 답안 — 실제 학생 정보 아님)</p>
                <div className="space-y-5">
                  <TextareaField
                    label="학생 답안"
                    htmlFor={`answer-${activeAnswer.id}`}
                    rows={3}
                    value={activeAnswer.answerText}
                    onChange={(e) => patchAnswer(activeAnswer.id, { answerText: e.target.value })}
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <TextareaField
                      label="강점"
                      htmlFor={`strengths-${activeAnswer.id}`}
                      rows={2}
                      value={activeAnswer.strengths}
                      onChange={(e) => patchAnswer(activeAnswer.id, { strengths: e.target.value })}
                    />
                    <TextareaField
                      label="개선점"
                      htmlFor={`improvements-${activeAnswer.id}`}
                      rows={2}
                      value={activeAnswer.improvements}
                      onChange={(e) => patchAnswer(activeAnswer.id, { improvements: e.target.value })}
                    />
                  </div>
                  <TextareaField
                    label="구체적으로 이렇게 고치면 좋아요"
                    htmlFor={`suggestions-${activeAnswer.id}`}
                    rows={2}
                    value={activeAnswer.suggestions}
                    onChange={(e) => patchAnswer(activeAnswer.id, { suggestions: e.target.value })}
                  />
                </div>
              </div>
            )}
          </section>

          {/* 결과 영역: 종합 의견과 교수자 최종 검토 */}
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-brand-900">3단계 · 종합 의견</h2>
            <div className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
              <TextareaField
                label="전체 학생에 대한 종합 의견"
                htmlFor="overallComment"
                rows={3}
                value={selected.overallComment}
                onChange={(e) => patchSet({ overallComment: e.target.value })}
              />
            </div>

            <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-6 sm:p-8">
              <TextareaField
                label="교수자 최종 검토"
                htmlFor="instructorReview"
                hint="위 내용을 검토한 뒤, 학생에게 실제로 전달할 의견을 여기에 작성하세요."
                rows={3}
                value={selected.instructorReview}
                onChange={(e) => patchSet({ instructorReview: e.target.value })}
              />
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="이 피드백을 삭제할까요?"
        description="안에 있는 모든 학생 답안과 피드백이 함께 삭제되며 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => confirmDelete && deleteSet(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
