import type { AgentProject, AgentStepState, StepKey, StepResultMap } from '../../types/agent'
import type { DomainPack } from './domainPacks/types'
import { runStep, StepGenerationError, validateContextForRun } from './steps'
import { computeAffectedSteps, parseFollowUpCommand, postProcessFollowUp } from './followUpCommand'
import { generateId } from '../../utils/id'

export function buildPriorResults(steps: AgentStepState[]): Partial<StepResultMap> {
  const prior: Partial<StepResultMap> = {}
  for (const step of steps) {
    if (step.result) {
      ;(prior as Record<string, unknown>)[step.key] = step.result
    }
  }
  return prior
}

export function setStepAt(project: AgentProject, idx: number, patch: Partial<AgentStepState>): AgentProject {
  const steps = project.steps.map((s, i) => (i === idx ? { ...s, ...patch } : s))
  return { ...project, steps, updatedAt: new Date().toISOString() }
}

const MAX_RETRIES = 2

/** 한 스텝을 실제로 계산한다. 성공하면 모드에 따라 '생성 완료' 또는 '검토 필요'로, 실패하면 재시도/오류로 전환한다. */
export function computeStepResult(project: AgentProject, idx: number, pack: DomainPack): AgentProject {
  const step = project.steps[idx]
  const prior = buildPriorResults(project.steps)

  try {
    if (idx === 0) validateContextForRun(project.context)
    const result = runStep(step.key, project.context, pack, prior)
    const status = project.mode === 'auto' ? '생성 완료' : '검토 필요'
    return setStepAt(project, idx, { status, result, error: undefined })
  } catch (err) {
    const message = err instanceof StepGenerationError ? err.message : '알 수 없는 오류로 생성에 실패했습니다.'
    const retryCount = step.retryCount + 1
    if (retryCount <= MAX_RETRIES) {
      return setStepAt(project, idx, { status: '재시도 중', retryCount, error: message })
    }
    return { ...setStepAt(project, idx, { status: '오류', retryCount, error: message }), runState: 'error' }
  }
}

/** 특정 스텝을 사용자가 직접 재생성("다시 생성")할 때 사용한다. */
export function regenerateStep(project: AgentProject, idx: number, pack: DomainPack): AgentProject {
  const step = project.steps[idx]
  const prior = buildPriorResults(project.steps)
  try {
    const result = runStep(step.key, project.context, pack, prior)
    return setStepAt(project, idx, {
      status: '검토 필요',
      result,
      error: undefined,
      history: [...step.history, { label: '다시 생성', at: new Date().toISOString() }],
    })
  } catch (err) {
    const message = err instanceof StepGenerationError ? err.message : '재생성에 실패했습니다.'
    return setStepAt(project, idx, { status: '오류', error: message })
  }
}

/** 단계별 승인 모드에서 "수정 요청" 버튼: 현재 보고 있는 스텝을 지시문에 따라 수정한다. */
export function applyStepModification(project: AgentProject, idx: number, pack: DomainPack, instruction: string): AgentProject {
  const step = project.steps[idx]
  if (!step.result) return project
  const parsed = parseFollowUpCommand(instruction)

  const overrideContext =
    parsed.studentLevelOverride && (step.key === 'learningObjectives' || step.key === 'weeklyPlan' || step.key === 'quizzes')
      ? { ...project.context, studentLevel: parsed.studentLevelOverride }
      : project.context

  const prior = buildPriorResults(project.steps)
  try {
    const raw = runStep(step.key, overrideContext, pack, prior)
    const processed = postProcessFollowUp(step.key, raw, parsed, pack)
    return setStepAt(project, idx, {
      status: '수정 완료',
      result: processed,
      manualOverrideText: undefined,
      history: [...step.history, { label: `수정 요청: ${instruction}`, at: new Date().toISOString() }],
    })
  } catch {
    return setStepAt(project, idx, { status: '오류', error: '수정 요청을 반영하지 못했습니다.' })
  }
}

export interface FollowUpOutcome {
  project: AgentProject
  matched: boolean
  summary: string
  affectedNotice: string | null
}

/** 후속 지시를 파싱해 대상 스텝(들)만 재생성하고 파라미터를 반영한다. */
export function applyFollowUpCommand(project: AgentProject, pack: DomainPack, command: string): FollowUpOutcome {
  const parsed = parseFollowUpCommand(command)
  const now = new Date().toISOString()

  if (!parsed.matched) {
    return {
      project: {
        ...project,
        followUpLog: [
          ...project.followUpLog,
          { id: generateId('log'), command, targetSteps: [], summary: '이해하지 못한 요청', matched: false, at: now },
        ],
      },
      matched: false,
      summary: `요청을 이해하지 못했습니다. ${parsed.exampleGuide}`,
      affectedNotice: null,
    }
  }

  let next = project
  const generatedSteps: StepKey[] = []

  for (const key of parsed.targetSteps) {
    const idx = next.steps.findIndex((s) => s.key === key)
    if (idx < 0) continue
    const step = next.steps[idx]
    if (!step.result) continue // 아직 생성되지 않은 단계는 후속 지시로 수정할 수 없음(스킵)

    const overrideContext =
      parsed.studentLevelOverride && (key === 'learningObjectives' || key === 'weeklyPlan' || key === 'quizzes')
        ? { ...next.context, studentLevel: parsed.studentLevelOverride }
        : next.context

    const prior = buildPriorResults(next.steps)
    try {
      const contextForRun = overrideContext === next.context ? next.context : overrideContext
      const raw = runStep(key, contextForRun, pack, prior)
      const processed = postProcessFollowUp(key, raw, parsed, pack)
      next = setStepAt(next, idx, {
        status: '수정 완료',
        result: processed,
        manualOverrideText: undefined,
        history: [...step.history, { label: `후속 지시 반영: ${command}`, at: now }],
      })
      generatedSteps.push(key)
    } catch {
      // 개별 스텝 재생성 실패는 조용히 건너뛰고 나머지 대상은 계속 처리한다
    }
  }

  const affected = computeAffectedSteps(parsed.targetSteps)
  const affectedNotice =
    affected.length > 0
      ? `${parsed.targetSteps.join(', ')} 변경으로 인해 ${affected.join(', ')} 단계에도 영향이 있을 수 있습니다. 필요하면 해당 단계도 다시 생성해주세요.`
      : null

  return {
    project: {
      ...next,
      followUpLog: [
        ...next.followUpLog,
        { id: generateId('log'), command, targetSteps: generatedSteps, summary: parsed.summary, matched: true, at: now },
      ],
    },
    matched: true,
    summary: generatedSteps.length > 0 ? `${generatedSteps.join(', ')} 단계를 수정했습니다.` : '대상 단계가 아직 생성되지 않아 적용할 수 없습니다.',
    affectedNotice,
  }
}
