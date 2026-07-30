import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { TextField, TextareaField } from '../components/common/FormField'
import { generateId } from '../utils/id'
import type { Rubric, RubricCriterion } from '../types'

const levelNames = ['우수', '양호', '보통', '미흡']

function createBlankCriterion(): RubricCriterion {
  return {
    id: generateId('crit'),
    name: '',
    maxPoints: 25,
    levels: levelNames.map((level, idx) => ({
      level,
      description: '',
      points: 25 - idx * 6,
    })),
  }
}

function createBlankRubric(): Rubric {
  return {
    id: generateId('rubric'),
    assignmentName: '새 과제 루브릭',
    purpose: '',
    criteria: [createBlankCriterion()],
    updatedAt: new Date().toISOString(),
  }
}

export function RubricGenerator() {
  const { data, setRubrics } = useProjectData()
  const [rubrics, setLocalRubrics] = useState<Rubric[]>(data.rubrics)
  const [selectedId, setSelectedId] = useState<string | null>(data.rubrics[0]?.id ?? null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    setLocalRubrics(data.rubrics)
    if (!selectedId && data.rubrics[0]) setSelectedId(data.rubrics[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.rubrics])

  const selected = rubrics.find((r) => r.id === selectedId) ?? null

  const patchRubric = (patch: Partial<Rubric>) => {
    if (!selected) return
    setLocalRubrics((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)))
  }

  const patchCriterion = (critId: string, patch: Partial<RubricCriterion>) => {
    if (!selected) return
    patchRubric({
      criteria: selected.criteria.map((c) => (c.id === critId ? { ...c, ...patch } : c)),
    })
  }

  const patchLevel = (critId: string, levelIdx: number, patch: Partial<{ description: string; points: number }>) => {
    if (!selected) return
    const criterion = selected.criteria.find((c) => c.id === critId)
    if (!criterion) return
    const levels = criterion.levels.map((l, idx) => (idx === levelIdx ? { ...l, ...patch } : l))
    patchCriterion(critId, { levels })
  }

  const addCriterion = () => {
    if (!selected) return
    patchRubric({ criteria: [...selected.criteria, createBlankCriterion()] })
  }

  const removeCriterion = (critId: string) => {
    if (!selected) return
    patchRubric({ criteria: selected.criteria.filter((c) => c.id !== critId) })
  }

  const createRubric = () => {
    const rubric = createBlankRubric()
    setLocalRubrics((prev) => [...prev, rubric])
    setSelectedId(rubric.id)
  }

  const deleteRubric = (id: string) => {
    setLocalRubrics((prev) => prev.filter((r) => r.id !== id))
    if (selectedId === id) setSelectedId(null)
    setConfirmDelete(null)
  }

  const handleSave = () => {
    setRubrics(rubrics.map((r) => (r.id === selected?.id ? { ...r, updatedAt: new Date().toISOString() } : r)))
  }

  const totalPoints = selected ? selected.criteria.reduce((sum, c) => sum + (Number(c.maxPoints) || 0), 0) : 0

  return (
    <div>
      <PageHeader
        title="루브릭 생성기"
        description="채점 기준표를 만듭니다. 평가 영역별 배점을 정하면 총점이 자동으로 더해집니다."
        actions={
          <>
            <Button onClick={createRubric}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 루브릭
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!selected}>
              <Save className="h-4 w-4" aria-hidden="true" />
              저장
            </Button>
          </>
        }
      />

      {rubrics.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {rubrics.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                r.id === selectedId ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {r.assignmentName}
            </button>
          ))}
        </div>
      )}

      {!selected ? (
        <EmptyState
          title="선택된 루브릭이 없습니다"
          description="'새 루브릭' 버튼을 눌러 평가 루브릭을 만들어보세요."
          action={
            <Button variant="primary" onClick={createRubric}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 루브릭 만들기
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* 입력 영역: 과제 기본 정보 */}
          <section className="rounded-2xl border border-brand-200 bg-brand-50/60 p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-semibold text-brand-900">1단계 · 기본 정보</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                label="과제명"
                htmlFor="assignmentName"
                value={selected.assignmentName}
                onChange={(e) => patchRubric({ assignmentName: e.target.value })}
              />
              <TextField
                label="평가 목적"
                htmlFor="purpose"
                placeholder="이 채점표로 무엇을 평가하는지 적어주세요"
                value={selected.purpose}
                onChange={(e) => patchRubric({ purpose: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end border-t border-brand-200 pt-4">
              <Button variant="danger" onClick={() => setConfirmDelete(selected.id)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                이 루브릭 전체 삭제
              </Button>
            </div>
          </section>

          {/* 결과 영역: 평가 영역과 배점표 */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-brand-900">2단계 · 평가 영역과 배점</h2>
              <div className="flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-white">
                <span className="text-sm font-medium">총점</span>
                <span className="text-lg font-bold">{totalPoints}점</span>
              </div>
            </div>

            <div className="space-y-5">
              {selected.criteria.map((criterion, cIdx) => (
                <div key={criterion.id} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
                      <TextField
                        label={`평가 영역 ${cIdx + 1} 이름`}
                        htmlFor={`crit-name-${criterion.id}`}
                        placeholder="예: 내용의 정확성"
                        value={criterion.name}
                        onChange={(e) => patchCriterion(criterion.id, { name: e.target.value })}
                      />
                      <TextField
                        label="배점"
                        htmlFor={`crit-points-${criterion.id}`}
                        type="number"
                        min={0}
                        value={criterion.maxPoints}
                        onChange={(e) => patchCriterion(criterion.id, { maxPoints: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      aria-label="평가 영역 삭제"
                      className="rounded-lg p-2 text-brand-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* 데스크톱: 표 형태 */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full border-collapse text-base">
                      <thead>
                        <tr className="bg-brand-50 text-left text-sm font-semibold text-brand-600">
                          <th className="rounded-l-lg px-3 py-2.5 w-28">성취수준</th>
                          <th className="px-3 py-2.5">설명</th>
                          <th className="rounded-r-lg px-3 py-2.5 w-28">배점</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criterion.levels.map((level, lIdx) => (
                          <tr key={level.level} className="border-b border-brand-50 last:border-0">
                            <td className="px-3 py-2.5 font-medium text-brand-800">{level.level}</td>
                            <td className="px-3 py-2.5">
                              <input
                                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                value={level.description}
                                onChange={(e) => patchLevel(criterion.id, lIdx, { description: e.target.value })}
                                aria-label={`${criterion.name || '평가 영역'} - ${level.level} 설명`}
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                className="w-full rounded-lg border border-brand-200 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                value={level.points}
                                onChange={(e) => patchLevel(criterion.id, lIdx, { points: Number(e.target.value) || 0 })}
                                aria-label={`${criterion.name || '평가 영역'} - ${level.level} 배점`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 모바일: 표 대신 카드 형태로 전환 */}
                  <div className="space-y-3 sm:hidden">
                    {criterion.levels.map((level, lIdx) => (
                      <div key={level.level} className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                        <p className="mb-2 text-base font-semibold text-brand-800">{level.level}</p>
                        <label className="mb-1 block text-sm text-brand-600" htmlFor={`m-desc-${criterion.id}-${lIdx}`}>
                          설명
                        </label>
                        <input
                          id={`m-desc-${criterion.id}-${lIdx}`}
                          className="mb-3 w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={level.description}
                          onChange={(e) => patchLevel(criterion.id, lIdx, { description: e.target.value })}
                        />
                        <label className="mb-1 block text-sm text-brand-600" htmlFor={`m-pts-${criterion.id}-${lIdx}`}>
                          배점
                        </label>
                        <input
                          id={`m-pts-${criterion.id}-${lIdx}`}
                          type="number"
                          className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={level.points}
                          onChange={(e) => patchLevel(criterion.id, lIdx, { points: Number(e.target.value) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button onClick={addCriterion} className="w-full justify-center border-dashed">
                <Plus className="h-4 w-4" aria-hidden="true" />
                평가 영역 추가
              </Button>
            </div>

            {selected.criteria.length > 0 && (
              <div className="mt-6">
                <TextareaField
                  label="전체 내용 미리보기 (글로 정리된 형태)"
                  htmlFor="rubric-preview"
                  hint="인쇄물이나 문서에 붙여넣을 때 사용하세요."
                  rows={4}
                  readOnly
                  value={selected.criteria
                    .map((c) => `${c.name || '(영역명 없음)'} (${c.maxPoints}점): ${c.levels.map((l) => `${l.level} ${l.points}점`).join(' / ')}`)
                    .join('\n')}
                />
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="루브릭을 삭제할까요?"
        description="루브릭의 모든 평가 영역이 함께 삭제되며 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => confirmDelete && deleteRubric(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
