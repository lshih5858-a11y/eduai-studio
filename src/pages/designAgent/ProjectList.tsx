import { useState } from 'react'
import { Copy, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { AgentProject } from '../../types/agent'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ConfirmModal } from '../../components/common/ConfirmModal'
import { DemoBadge } from '../../components/common/DemoBadge'

interface ProjectListProps {
  projects: AgentProject[]
  onCreateNew: () => void
  onContinue: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function ProjectList({ projects, onCreateNew, onContinue, onDelete, onDuplicate, onRename }: ProjectListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const startRename = (p: AgentProject) => {
    setRenamingId(p.id)
    setRenameValue(p.name)
  }

  const submitRename = (id: string) => {
    if (renameValue.trim()) onRename(id, renameValue.trim())
    setRenamingId(null)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <DemoBadge />
        <Button variant="primary" onClick={onCreateNew}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          새 설계 시작
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="아직 만든 AI 설계 프로젝트가 없습니다"
          description="설계 요청을 한 번 입력하면 과목 분석부터 최종 결과 패키지까지 12단계로 자동 생성됩니다."
          action={
            <Button variant="primary" onClick={onCreateNew}>
              <Plus className="h-4 w-4" aria-hidden="true" />새 설계 시작
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const doneSteps = p.steps.filter((s) => s.status === '승인 완료' || s.status === '생성 완료' || s.status === '수정 완료').length
            const progress = Math.round((doneSteps / p.steps.length) * 100)
            return (
              <div key={p.id} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {renamingId === p.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => submitRename(p.id)}
                        onKeyDown={(e) => e.key === 'Enter' && submitRename(p.id)}
                        className="w-full rounded-lg border border-brand-300 px-3 py-1.5 text-lg font-bold text-brand-950"
                      />
                    ) : (
                      <h3 className="truncate text-lg font-bold text-brand-950">{p.name}</h3>
                    )}
                    <p className="mt-1 text-sm text-brand-500">
                      {p.mode === 'auto' ? '자동 실행 모드' : '단계별 승인 모드'} · 마지막 수정{' '}
                      {new Date(p.updatedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                    {p.finalPackage ? '완료' : `${progress}%`}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100">
                  <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${p.finalPackage ? 100 : progress}%` }} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => onContinue(p.id)}>
                    계속 작업
                  </Button>
                  <Button onClick={() => onDuplicate(p.id)}>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    복제
                  </Button>
                  <Button onClick={() => startRename(p)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    이름 변경
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDeleteId(p.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    삭제
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="이 프로젝트를 삭제할까요?"
        description="설계 진행 상황과 결과가 모두 삭제되며 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => {
          if (confirmDeleteId) onDelete(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
