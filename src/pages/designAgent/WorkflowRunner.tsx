import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Pause,
  Play,
  RefreshCw,
  Square,
  Wand2,
} from 'lucide-react'
import type { AgentProject, StepKey, StepStatus } from '../../types/agent'
import { resolveDomainPack } from '../../services/aiAgent/domainPacks'
import { getAiConnectionStatus } from '../../services/aiAgent/aiConnectionStatus'
import { renderStepResultText } from '../../services/aiAgent/renderText'
import {
  applyFollowUpCommand,
  applyStepModification,
  computeStepResult,
  regenerateStep,
  setStepAt,
} from '../../services/aiAgent/workflowEngine'
import { buildFinalPackage } from '../../services/aiAgent/finalPackage'
import { Button } from '../../components/common/Button'
import { StepResultView } from './StepResultView'
import { FollowUpPanel } from './FollowUpPanel'

interface WorkflowRunnerProps {
  project: AgentProject
  onUpdate: (project: AgentProject) => void
  onReachFinalPackage: () => void
  onBackToList: () => void
}

const STATUS_STYLE: Record<StepStatus, string> = {
  대기: 'bg-brand-100 text-brand-500',
  '실행 중': 'bg-accent-100 text-accent-800 animate-pulse',
  '생성 완료': 'bg-brand-600 text-white',
  '검토 필요': 'bg-accent-200 text-accent-900',
  '승인 완료': 'bg-brand-700 text-white',
  '수정 완료': 'bg-brand-400 text-white',
  오류: 'bg-red-100 text-red-700',
  '재시도 중': 'bg-red-50 text-red-500 animate-pulse',
}

const ACCEPTED_STATUSES: StepStatus[] = ['생성 완료', '검토 필요', '승인 완료', '수정 완료']

export function WorkflowRunner({ project, onUpdate, onReachFinalPackage, onBackToList }: WorkflowRunnerProps) {
  const [local, setLocal] = useState<AgentProject>(project)
  const [editingKey, setEditingKey] = useState<StepKey | null>(null)
  const [editText, setEditText] = useState('')
  const [modifyRequestKey, setModifyRequestKey] = useState<StepKey | null>(null)
  const [modifyRequestText, setModifyRequestText] = useState('')
  const finalPackageNotifiedRef = useRef(false)
  const lastProjectIdRef = useRef(project.id)

  const pack = useMemo(() => resolveDomainPack(local.context), [local.context])
  const aiStatus = useMemo(() => getAiConnectionStatus(), [])

  // 다른 프로젝트로 전환될 때만 로컬 상태를 리셋한다(엔진이 계산한 로컬 변경을 부모 리렌더가 덮어쓰지 않도록).
  useEffect(() => {
    if (project.id !== lastProjectIdRef.current) {
      setLocal(project)
      lastProjectIdRef.current = project.id
      finalPackageNotifiedRef.current = false
    }
  }, [project])

  useEffect(() => {
    onUpdate(local)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local])

  // 진입 시 자동으로 실행 시작
  useEffect(() => {
    if (local.runState === 'idle') {
      setLocal((prev) => ({ ...prev, runState: 'running' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 워크플로 엔진: 상태에 따라 다음 전이를 예약한다.
  useEffect(() => {
    if (local.runState !== 'running') return undefined

    const idx = local.currentStepIndex
    if (idx >= local.steps.length) {
      const timer = setTimeout(() => {
        setLocal((prev) => {
          if (prev.finalPackage) return { ...prev, runState: 'completed' }
          try {
            const finalPackage = buildFinalPackage(prev.context, prev.steps)
            return { ...prev, runState: 'completed', finalPackage }
          } catch {
            return { ...prev, runState: 'error' }
          }
        })
      }, 10)
      return () => clearTimeout(timer)
    }

    const step = local.steps[idx]

    if (step.status === '대기' || step.status === '재시도 중') {
      const timer = setTimeout(() => {
        setLocal((prev) => setStepAt(prev, idx, { status: '실행 중' }))
      }, 250)
      return () => clearTimeout(timer)
    }

    if (step.status === '실행 중') {
      const timer = setTimeout(() => {
        setLocal((prev) => computeStepResult(prev, idx, pack))
      }, 450)
      return () => clearTimeout(timer)
    }

    if (local.mode === 'auto' && ACCEPTED_STATUSES.includes(step.status)) {
      const timer = setTimeout(() => {
        setLocal((prev) => ({ ...prev, currentStepIndex: idx + 1 }))
      }, 150)
      return () => clearTimeout(timer)
    }

    return undefined
  }, [local, pack])

  useEffect(() => {
    if (local.runState === 'completed' && !finalPackageNotifiedRef.current) {
      finalPackageNotifiedRef.current = true
      onReachFinalPackage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.runState])

  const doneCount = local.steps.filter((s) => ACCEPTED_STATUSES.includes(s.status)).length
  const progress = Math.round((doneCount / local.steps.length) * 100)
  const currentStep = local.steps[Math.min(local.currentStepIndex, local.steps.length - 1)]

  const handleApprove = (idx: number) => {
    setLocal((prev) => {
      const withApproval = setStepAt(prev, idx, {
        status: '승인 완료',
        history: [...prev.steps[idx].history, { label: '승인', at: new Date().toISOString() }],
      })
      return { ...withApproval, currentStepIndex: idx + 1, runState: 'running' }
    })
  }

  const handleRegenerate = (idx: number) => {
    setLocal((prev) => regenerateStep(prev, idx, pack))
  }

  const submitModifyRequest = (idx: number) => {
    if (!modifyRequestText.trim()) return
    setLocal((prev) => applyStepModification(prev, idx, pack, modifyRequestText.trim()))
    setModifyRequestKey(null)
    setModifyRequestText('')
  }

  const handleSwitchToAuto = () => {
    setLocal((prev) => ({ ...prev, mode: 'auto', runState: 'running' }))
  }

  const startManualEdit = (key: StepKey, result: unknown) => {
    setEditingKey(key)
    setEditText(renderStepResultText(key, result as never))
  }

  const submitManualEdit = (idx: number) => {
    setLocal((prev) =>
      setStepAt(prev, idx, {
        status: '수정 완료',
        manualOverrideText: editText,
        history: [...prev.steps[idx].history, { label: '직접 수정', at: new Date().toISOString() }],
      }),
    )
    setEditingKey(null)
  }

  const handleFollowUp = (command: string) => {
    const outcome = applyFollowUpCommand(local, pack, command)
    setLocal(outcome.project)
    return { summary: outcome.summary, affectedNotice: outcome.affectedNotice }
  }

  const hasAnyResult = local.steps.some((s) => s.result)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onBackToList}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          목록으로
        </Button>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            aiStatus.connected ? 'bg-brand-600 text-white' : 'bg-accent-100 text-accent-800'
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
          {aiStatus.label}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-950">{local.name}</h2>
          <span className="text-sm font-semibold text-brand-700">
            {Math.min(local.currentStepIndex + 1, local.steps.length)}/{local.steps.length} 단계
            {local.runState === 'running' ? ' 실행 중' : local.runState === 'paused' ? ' 일시정지' : local.runState === 'error' ? ' 오류' : ''}{' '}
            · 전체 진행률 {progress}%
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {local.mode === 'auto' && local.runState !== 'completed' && local.runState !== 'error' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {local.runState === 'running' ? (
              <Button onClick={() => setLocal((prev) => ({ ...prev, runState: 'paused' }))}>
                <Pause className="h-4 w-4" aria-hidden="true" />
                일시정지
              </Button>
            ) : (
              <Button onClick={() => setLocal((prev) => ({ ...prev, runState: 'running' }))}>
                <Play className="h-4 w-4" aria-hidden="true" />
                재개
              </Button>
            )}
            <Button variant="danger" onClick={() => setLocal((prev) => ({ ...prev, runState: 'stopped' }))}>
              <Square className="h-4 w-4" aria-hidden="true" />
              중단
            </Button>
          </div>
        )}
      </div>

      {/* 단계 타임라인 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {local.steps.map((s, idx) => (
          <span
            key={s.key}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[s.status]} ${
              idx === local.currentStepIndex ? 'ring-2 ring-brand-400 ring-offset-1' : ''
            }`}
          >
            {s.id}. {s.title} · {s.status}
          </span>
        ))}
      </div>

      {local.runState === 'error' && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">오류가 발생했습니다</p>
          <p className="mt-1 text-sm text-red-600">{currentStep?.error ?? '알 수 없는 오류'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                setLocal((prev) => setStepAt({ ...prev, runState: 'running' }, prev.currentStepIndex, { status: '대기', retryCount: 0 }))
              }
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              재시도
            </Button>
            <Button
              onClick={() => setLocal((prev) => ({ ...prev, currentStepIndex: Math.max(0, prev.currentStepIndex - 1), runState: 'paused' }))}
            >
              이전 단계로 돌아가기
            </Button>
            <Button onClick={onBackToList}>입력 수정(목록에서 새로 시작)</Button>
          </div>
        </div>
      )}

      {/* 단계별 결과 목록 */}
      <div className="space-y-6">
        {local.steps.map((s, idx) => {
          if (!s.result && s.status !== '실행 중' && s.status !== '재시도 중') return null
          return (
            <section key={s.key} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-brand-900">
                  STEP {s.id} · {s.title}
                </h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
              </div>

              {(s.status === '실행 중' || s.status === '재시도 중') && (
                <p className="text-sm text-brand-500">{s.title} 생성 중입니다…</p>
              )}

              {s.result && editingKey !== s.key && <StepResultView step={s} />}

              {editingKey === s.key && (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-brand-200 p-3 font-mono text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button variant="primary" onClick={() => submitManualEdit(idx)}>
                      저장
                    </Button>
                    <Button onClick={() => setEditingKey(null)}>취소</Button>
                  </div>
                </div>
              )}

              {local.mode === 'stepApproval' && (s.status === '검토 필요' || s.status === '수정 완료') && editingKey !== s.key && (
                <div className="mt-4 border-t border-brand-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => handleApprove(idx)}>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      승인하고 계속
                    </Button>
                    <Button onClick={() => setModifyRequestKey(modifyRequestKey === s.key ? null : s.key)}>수정 요청</Button>
                    <Button onClick={() => startManualEdit(s.key, s.result)}>직접 수정</Button>
                    <Button onClick={() => handleRegenerate(idx)}>
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      다시 생성
                    </Button>
                    <Button onClick={handleSwitchToAuto}>자동 실행으로 전환</Button>
                  </div>

                  {modifyRequestKey === s.key && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        autoFocus
                        value={modifyRequestText}
                        onChange={(e) => setModifyRequestText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitModifyRequest(idx)}
                        placeholder="이 단계에서 수정하고 싶은 내용을 입력하세요"
                        className="flex-1 rounded-lg border border-brand-200 px-3.5 py-2 text-sm text-brand-950 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <Button variant="primary" onClick={() => submitModifyRequest(idx)}>
                        수정 반영
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {s.status === '승인 완료' && <p className="mt-3 text-xs text-brand-400">승인됨 · {s.history[s.history.length - 1]?.at && new Date(s.history[s.history.length - 1].at).toLocaleString('ko-KR')}</p>}
            </section>
          )
        })}
      </div>

      {hasAnyResult && <FollowUpPanel followUpLog={local.followUpLog} onSubmit={handleFollowUp} />}
    </div>
  )
}
