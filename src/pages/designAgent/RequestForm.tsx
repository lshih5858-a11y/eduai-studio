import { useState } from 'react'
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react'
import type { AgentProject, CourseContext, RunMode } from '../../types/agent'
import { STEP_DEFINITIONS } from '../../services/aiAgent/steps'
import { extractCourseContext, applyContextOverrides } from '../../services/aiAgent/extractor'
import { generateProjectName } from '../../utils/agentStorage'
import { generateId } from '../../utils/id'
import { Button } from '../../components/common/Button'
import { TextareaField, TextField } from '../../components/common/FormField'
import { DemoBadge } from '../../components/common/DemoBadge'

interface RequestFormProps {
  onStart: (project: AgentProject) => void
  onCancel: () => void
}

const FIELD_LABELS: Record<keyof Omit<CourseContext, 'missingFields' | 'desiredOutputs'>, string> = {
  major: '전공',
  courseName: '과목명',
  grade: '대상 학년',
  credit: '학점',
  hoursPerWeek: '주당 수업시간',
  courseType: '수업 형태',
  goal: '수업 목표',
  keyContent: '주요 학습내용',
  studentLevel: '학생 수준',
  aiUsageLevel: 'AI 활용 수준',
  evaluationStyle: '평가 방식',
}

function buildProject(request: string, context: CourseContext, mode: RunMode): AgentProject {
  const now = new Date().toISOString()
  return {
    id: generateId('project'),
    name: generateProjectName(context.courseName),
    createdAt: now,
    updatedAt: now,
    initialRequest: request,
    context,
    mode,
    steps: STEP_DEFINITIONS.map((def) => ({
      id: def.id,
      key: def.key,
      title: def.title,
      status: '대기',
      result: null,
      retryCount: 0,
      history: [],
    })),
    currentStepIndex: 0,
    runState: 'idle',
    followUpLog: [],
    finalPackage: null,
  }
}

export function RequestForm({ onStart, onCancel }: RequestFormProps) {
  const [requestText, setRequestText] = useState('')
  const [mode, setMode] = useState<RunMode>('auto')
  const [inputError, setInputError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'writing' | 'confirming' | 'editing'>('writing')
  const [context, setContext] = useState<CourseContext | null>(null)
  const [editForm, setEditForm] = useState<CourseContext | null>(null)

  const handleSubmit = () => {
    if (!requestText.trim()) {
      setInputError('설계 요청 내용을 입력해주세요. (예: "서비스경영과 3학년 대상, 3학점, 주 3시간, 이론+실습 형태로 수업을 설계해줘")')
      return
    }
    setInputError(null)
    const extracted = extractCourseContext(requestText)
    setContext(extracted)
    if (extracted.missingFields.length === 0) {
      onStart(buildProject(requestText, extracted, mode))
      return
    }
    setPhase('confirming')
  }

  const handleUseRecommended = () => {
    if (!context) return
    onStart(buildProject(requestText, context, mode))
  }

  const handleEditDirectly = () => {
    if (!context) return
    setEditForm(context)
    setPhase('editing')
  }

  const handleSubmitEdit = () => {
    if (!context || !editForm) return
    const merged = applyContextOverrides(context, editForm)
    onStart(buildProject(requestText, merged, mode))
  }

  if (phase === 'confirming' && context) {
    return (
      <div className="rounded-2xl border border-accent-200 bg-accent-50/60 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-brand-900">몇 가지 정보를 확인해주세요</h2>
        <p className="mt-1.5 text-base text-brand-600">
          아래 항목은 요청 문장에서 찾지 못해 기본값으로 채웠습니다. 그대로 진행하거나 직접 입력할 수 있습니다.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {context.missingFields.map((field) => (
            <div key={field} className="rounded-lg border border-accent-200 bg-white px-4 py-3">
              <p className="text-sm font-medium text-brand-500">{FIELD_LABELS[field]}</p>
              <p className="text-base font-semibold text-brand-900">{context[field] as string}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleUseRecommended}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            AI 추천값으로 진행
          </Button>
          <Button onClick={handleEditDirectly}>직접 입력</Button>
          <Button onClick={() => setPhase('writing')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            이전 화면
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'editing' && editForm) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="mb-5 text-lg font-semibold text-brand-900">과목 정보 직접 입력</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[]).map((field) => (
            <TextField
              key={field}
              label={FIELD_LABELS[field]}
              htmlFor={`edit-${field}`}
              value={editForm[field] as string}
              onChange={(e) => setEditForm((prev) => (prev ? { ...prev, [field]: e.target.value } : prev))}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleSubmitEdit}>
            이 정보로 설계 시작
          </Button>
          <Button onClick={() => setPhase('confirming')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            이전 화면
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <DemoBadge />
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
        <TextareaField
          label="설계 요청"
          htmlFor="agent-request"
          rows={5}
          placeholder="예: 항공서비스학과 2학년 대상, 3학점, 주 3시간, 이론+실습 형태로 항공 서비스 실무 수업을 설계해줘. 주요 내용은 승객 응대, 서비스 회복, 기내 안전 절차를 다루고 싶어."
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          hint="전공, 과목명, 학년, 학점, 수업 형태, 다루고 싶은 내용 등을 자유롭게 적어주세요. 이미 적은 내용은 다시 묻지 않습니다."
        />
        {inputError && <p className="mt-2 text-sm font-medium text-red-600">{inputError}</p>}

        <fieldset className="mt-6">
          <legend className="mb-3 text-base font-medium text-brand-900">실행 모드</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                mode === 'auto' ? 'border-brand-600 bg-brand-50' : 'border-brand-200 bg-white hover:bg-brand-50/50'
              }`}
            >
              <input type="radio" name="mode" className="sr-only" checked={mode === 'auto'} onChange={() => setMode('auto')} />
              <p className="font-semibold text-brand-900">모드 A · 자동 실행 모드</p>
              <p className="mt-1 text-sm text-brand-600">에이전트가 12단계를 자동으로 실행하고 완성된 결과 패키지를 생성합니다.</p>
            </label>
            <label
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                mode === 'stepApproval' ? 'border-brand-600 bg-brand-50' : 'border-brand-200 bg-white hover:bg-brand-50/50'
              }`}
            >
              <input
                type="radio"
                name="mode"
                className="sr-only"
                checked={mode === 'stepApproval'}
                onChange={() => setMode('stepApproval')}
              />
              <p className="font-semibold text-brand-900">모드 B · 단계별 승인 모드</p>
              <p className="mt-1 text-sm text-brand-600">각 단계의 결과를 교수가 검토하고 승인·수정한 후 다음 단계로 이동합니다.</p>
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleSubmit}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {mode === 'auto' ? '자동 실행 시작' : '단계별 승인 시작'}
          </Button>
          <Button onClick={onCancel}>취소</Button>
        </div>
      </div>
    </div>
  )
}
