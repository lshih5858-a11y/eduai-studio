import { useState } from 'react'
import { ArrowLeft, ClipboardCheck, Copy, Eye, EyeOff, FileText, Printer, Save } from 'lucide-react'
import type { AgentProject, FinalPackageCard } from '../../types/agent'
import { Button } from '../../components/common/Button'
import { copyToClipboard } from '../../utils/download'
import { downloadWordDoc } from '../../services/aiAgent/wordExport'
import { ApplyToScreensModal } from './ApplyToScreensModal'
import { useProjectData } from '../../context/ProjectDataContext'

interface FinalPackageViewProps {
  project: AgentProject
  onUpdate: (project: AgentProject) => void
  onBackToWorkflow: () => void
}

export function FinalPackageView({ project, onUpdate, onBackToWorkflow }: FinalPackageViewProps) {
  const { notify } = useProjectData()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [applyModalOpen, setApplyModalOpen] = useState(false)

  const cards = project.finalPackage ?? []

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateCard = (id: string, patch: Partial<FinalPackageCard>) => {
    onUpdate({
      ...project,
      finalPackage: (project.finalPackage ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
      updatedAt: new Date().toISOString(),
    })
  }

  const handleCopy = async (card: FinalPackageCard) => {
    try {
      await copyToClipboard(`${card.title}\n\n${card.content}`)
      notify(`'${card.title}' 내용이 클립보드에 복사되었습니다.`)
    } catch {
      notify('복사에 실패했습니다. 브라우저 권한을 확인해주세요.')
    }
  }

  const handlePrint = (card: FinalPackageCard) => {
    setExpanded((prev) => new Set(prev).add(card.id))
    window.setTimeout(() => window.print(), 100)
  }

  const handleWordDownload = async (card: FinalPackageCard) => {
    try {
      await downloadWordDoc(`${project.name} - ${card.title}`, card.content)
      notify(`'${card.title}' Word 파일을 다운로드했습니다.`)
    } catch {
      notify('Word 파일 생성에 실패했습니다.')
    }
  }

  const startEdit = (card: FinalPackageCard) => {
    setEditingId(card.id)
    setEditText(card.content)
    setExpanded((prev) => new Set(prev).add(card.id))
  }

  const saveEdit = (card: FinalPackageCard) => {
    updateCard(card.id, { content: editText })
    setEditingId(null)
    notify(`'${card.title}'이(가) 수정되었습니다.`)
  }

  return (
    <div>
      <Button onClick={onBackToWorkflow} className="mb-5">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        워크플로로 돌아가기
      </Button>

      <div className="mb-6 rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-brand-950 sm:text-3xl">설계가 완료되었습니다</h1>
        <p className="mt-2 text-base text-brand-600">AI가 생성한 결과를 검토한 후 저장하거나 기존 교수설계 화면에 반영하세요.</p>
        <div className="mt-5">
          <Button variant="primary" onClick={() => setApplyModalOpen(true)}>
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            기존 화면에 반영
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card) => {
          const isOpen = expanded.has(card.id)
          return (
            <section key={card.id} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-brand-900">
                  {card.order}. {card.title}
                </h2>
                {!card.wordSupported && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-500">
                    슬라이드 구성안(복사/인쇄용)
                  </span>
                )}
              </div>

              {isOpen && editingId !== card.id && (
                <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-brand-50/60 p-4 text-sm text-brand-800">
                  {card.content}
                </pre>
              )}

              {editingId === card.id && (
                <div className="mt-4">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={14}
                    className="w-full rounded-lg border border-brand-200 p-3 font-mono text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button variant="primary" onClick={() => saveEdit(card)}>
                      저장
                    </Button>
                    <Button onClick={() => setEditingId(null)}>취소</Button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-100 pt-4">
                <Button onClick={() => toggleExpand(card.id)}>
                  {isOpen ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  미리보기
                </Button>
                <Button onClick={() => handleCopy(card)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  내용 복사
                </Button>
                <Button onClick={() => startEdit(card)}>수정</Button>
                <Button onClick={() => notify('브라우저에 자동 저장되어 있습니다. 목록 화면에서 언제든 이어할 수 있습니다.')}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  저장
                </Button>
                <Button onClick={() => handlePrint(card)}>
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  인쇄용 보기
                </Button>
                {card.wordSupported && (
                  <Button onClick={() => handleWordDownload(card)}>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Word 다운로드
                  </Button>
                )}
              </div>
              {!card.wordSupported && (
                <p className="mt-2 text-xs text-brand-400">
                  실제 PPT 파일 생성은 지원하지 않습니다. '내용 복사'로 슬라이드 구성안을 붙여넣거나, '인쇄용 보기' 후 브라우저의
                  '다른 이름으로 저장 &gt; PDF'를 이용해주세요.
                </p>
              )}
            </section>
          )
        })}
      </div>

      <ApplyToScreensModal open={applyModalOpen} project={project} onClose={() => setApplyModalOpen(false)} />
    </div>
  )
}
