import { useEffect, useState } from 'react'
import { Copy, Plus, Save, Trash2 } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { TextField, TextareaField, SelectField } from '../components/common/FormField'
import { generateId } from '../utils/id'
import { copyToClipboard } from '../utils/download'
import type { QuizDifficulty, QuizItem, QuizSet, QuizType } from '../types'

const quizTypes: QuizType[] = ['OX', '객관식', '단답형', '사례형']
const difficulties: QuizDifficulty[] = ['기초', '보통', '심화']

function createBlankItem(type: QuizType, difficulty: QuizDifficulty): QuizItem {
  return {
    id: generateId('quiz'),
    type,
    difficulty,
    question: '',
    options: type === '객관식' ? ['', '', '', ''] : undefined,
    answer: type === 'OX' ? 'O' : '',
    explanation: '',
  }
}

function setToText(set: QuizSet): string {
  return set.items
    .map((item, idx) => {
      const optionsText = item.options ? `\n  보기: ${item.options.join(' / ')}` : ''
      return `${idx + 1}. [${item.type} · ${item.difficulty}] ${item.question}${optionsText}\n  정답: ${item.answer}\n  해설: ${item.explanation}`
    })
    .join('\n\n')
}

export function QuizGenerator() {
  const { data, setQuizSets, notify } = useProjectData()
  const [sets, setSets] = useState<QuizSet[]>(data.quizSets)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(data.quizSets[0]?.id ?? null)
  const [newType, setNewType] = useState<QuizType>('객관식')
  const [newDifficulty, setNewDifficulty] = useState<QuizDifficulty>('보통')
  const [newCount, setNewCount] = useState(3)
  const [confirmDeleteSet, setConfirmDeleteSet] = useState<string | null>(null)

  useEffect(() => {
    setSets(data.quizSets)
    if (!selectedSetId && data.quizSets[0]) setSelectedSetId(data.quizSets[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.quizSets])

  const selectedSet = sets.find((s) => s.id === selectedSetId) ?? null

  const createSet = () => {
    const newSet: QuizSet = {
      id: generateId('set'),
      title: `새 퀴즈 세트 ${sets.length + 1}`,
      createdAt: new Date().toISOString(),
      items: [],
    }
    setSets((prev) => [...prev, newSet])
    setSelectedSetId(newSet.id)
  }

  const deleteSet = (id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id))
    if (selectedSetId === id) setSelectedSetId(null)
    setConfirmDeleteSet(null)
  }

  const updateSetTitle = (title: string) => {
    if (!selectedSet) return
    setSets((prev) => prev.map((s) => (s.id === selectedSet.id ? { ...s, title } : s)))
  }

  const addItems = () => {
    if (!selectedSet) return
    const items = Array.from({ length: newCount }, () => createBlankItem(newType, newDifficulty))
    setSets((prev) => prev.map((s) => (s.id === selectedSet.id ? { ...s, items: [...s.items, ...items] } : s)))
  }

  const updateItem = (itemId: string, patch: Partial<QuizItem>) => {
    if (!selectedSet) return
    setSets((prev) =>
      prev.map((s) =>
        s.id === selectedSet.id
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : s,
      ),
    )
  }

  const removeItem = (itemId: string) => {
    if (!selectedSet) return
    setSets((prev) =>
      prev.map((s) => (s.id === selectedSet.id ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s)),
    )
  }

  const handleSave = () => {
    setQuizSets(sets)
  }

  const handleCopy = async () => {
    if (!selectedSet) return
    try {
      await copyToClipboard(setToText(selectedSet))
      notify('퀴즈가 클립보드에 복사되었습니다.')
    } catch {
      notify('복사에 실패했습니다. 브라우저 권한을 확인해주세요.')
    }
  }

  return (
    <div>
      <PageHeader
        title="퀴즈 생성기"
        description="OX, 객관식, 단답형, 사례형 문항을 난이도별로 생성하고 직접 다듬어 저장하세요."
        actions={
          <>
            <Button onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 퀴즈 세트
            </Button>
            <Button onClick={handleCopy} disabled={!selectedSet || selectedSet.items.length === 0}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              복사
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" aria-hidden="true" />
              저장
            </Button>
          </>
        }
      />

      {sets.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {sets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSetId(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                s.id === selectedSetId ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {s.title} ({s.items.length})
            </button>
          ))}
        </div>
      )}

      {!selectedSet ? (
        <EmptyState
          title="선택된 퀴즈 세트가 없습니다"
          description="'새 퀴즈 세트' 버튼을 눌러 퀴즈 세트를 만들어보세요."
          action={
            <Button variant="primary" onClick={createSet}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 퀴즈 세트 만들기
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <TextField
                  label="퀴즈 세트 제목"
                  htmlFor="set-title"
                  value={selectedSet.title}
                  onChange={(e) => updateSetTitle(e.target.value)}
                />
              </div>
              <Button variant="danger" onClick={() => setConfirmDeleteSet(selectedSet.id)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                세트 삭제
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-brand-100 pt-4 sm:grid-cols-4">
              <SelectField
                label="문항 유형"
                htmlFor="new-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as QuizType)}
              >
                {quizTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="난이도"
                htmlFor="new-difficulty"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as QuizDifficulty)}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="문항 수"
                htmlFor="new-count"
                type="number"
                min={1}
                max={20}
                value={newCount}
                onChange={(e) => setNewCount(Number(e.target.value) || 1)}
              />
              <div className="flex items-end">
                <Button variant="primary" onClick={addItems} className="w-full justify-center">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  문항 생성
                </Button>
              </div>
            </div>
          </div>

          {selectedSet.items.length === 0 ? (
            <EmptyState title="아직 생성된 문항이 없습니다" description="위에서 유형과 난이도, 문항 수를 선택하고 '문항 생성'을 눌러보세요." />
          ) : (
            <div className="space-y-4">
              {selectedSet.items.map((item, idx) => (
                <div key={item.id} className="rounded-2xl border border-brand-100 bg-white p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                        문항 {idx + 1}
                      </span>
                      <span className="rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-800">
                        {item.type} · {item.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="문항 삭제"
                      className="rounded-lg p-1.5 text-brand-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <TextareaField
                      label="문항 내용"
                      htmlFor={`q-${item.id}`}
                      rows={2}
                      value={item.question}
                      onChange={(e) => updateItem(item.id, { question: e.target.value })}
                    />

                    {item.type === '객관식' && item.options && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {item.options.map((opt, optIdx) => (
                          <TextField
                            key={optIdx}
                            label={`보기 ${optIdx + 1}`}
                            htmlFor={`opt-${item.id}-${optIdx}`}
                            value={opt}
                            onChange={(e) => {
                              const options = [...(item.options ?? [])]
                              options[optIdx] = e.target.value
                              updateItem(item.id, { options })
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {item.type === 'OX' ? (
                      <SelectField
                        label="정답"
                        htmlFor={`a-${item.id}`}
                        value={item.answer}
                        onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                      >
                        <option value="O">O</option>
                        <option value="X">X</option>
                      </SelectField>
                    ) : (
                      <TextareaField
                        label="정답"
                        htmlFor={`a-${item.id}`}
                        rows={2}
                        value={item.answer}
                        onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                      />
                    )}

                    <TextareaField
                      label="해설"
                      htmlFor={`e-${item.id}`}
                      rows={2}
                      value={item.explanation}
                      onChange={(e) => updateItem(item.id, { explanation: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteSet !== null}
        title="퀴즈 세트를 삭제할까요?"
        description="세트 안의 모든 문항이 함께 삭제되며 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => confirmDeleteSet && deleteSet(confirmDeleteSet)}
        onCancel={() => setConfirmDeleteSet(null)}
      />
    </div>
  )
}
