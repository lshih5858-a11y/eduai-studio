import { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { ProjectList } from './designAgent/ProjectList'
import { RequestForm } from './designAgent/RequestForm'
import { WorkflowRunner } from './designAgent/WorkflowRunner'
import { FinalPackageView } from './designAgent/FinalPackageView'
import { loadAgentProjects, upsertAgentProject, deleteAgentProject } from '../utils/agentStorage'
import { generateId } from '../utils/id'
import type { AgentProject } from '../types/agent'

type View = 'list' | 'input' | 'workflow' | 'finalPackage'

export function DesignAgent() {
  const [projects, setProjects] = useState<AgentProject[]>(() => loadAgentProjects())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [view, setView] = useState<View>('list')

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null

  const persist = (project: AgentProject) => {
    upsertAgentProject(project)
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = project
        return next
      }
      return [project, ...prev]
    })
  }

  const handleStart = (project: AgentProject) => {
    persist(project)
    setActiveProjectId(project.id)
    setView('workflow')
  }

  const handleContinue = (id: string) => {
    const p = projects.find((x) => x.id === id)
    setActiveProjectId(id)
    setView(p?.finalPackage ? 'finalPackage' : 'workflow')
  }

  const handleDelete = (id: string) => {
    deleteAgentProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (activeProjectId === id) {
      setActiveProjectId(null)
      setView('list')
    }
  }

  const handleDuplicate = (id: string) => {
    const source = projects.find((p) => p.id === id)
    if (!source) return
    const now = new Date().toISOString()
    const copy: AgentProject = { ...source, id: generateId('project'), name: `${source.name} (복제본)`, createdAt: now, updatedAt: now }
    persist(copy)
  }

  const handleRename = (id: string, name: string) => {
    const p = projects.find((x) => x.id === id)
    if (!p) return
    persist({ ...p, name, updatedAt: new Date().toISOString() })
  }

  return (
    <div>
      <PageHeader
        title="AI 설계 에이전트"
        description="설계 요청을 한 번 입력하면 과목 분석부터 16주 수업설계, 퀴즈·루브릭, 최종 결과 패키지까지 12단계로 자동 생성합니다. 실제 개인정보·학생 민감정보는 입력하지 마세요."
      />

      {view === 'list' && (
        <ProjectList
          projects={projects}
          onCreateNew={() => setView('input')}
          onContinue={handleContinue}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onRename={handleRename}
        />
      )}

      {view === 'input' && <RequestForm onStart={handleStart} onCancel={() => setView('list')} />}

      {view === 'workflow' && activeProject && (
        <WorkflowRunner
          project={activeProject}
          onUpdate={persist}
          onReachFinalPackage={() => setView('finalPackage')}
          onBackToList={() => setView('list')}
        />
      )}

      {view === 'finalPackage' && activeProject && (
        <FinalPackageView project={activeProject} onUpdate={persist} onBackToWorkflow={() => setView('workflow')} />
      )}
    </div>
  )
}
