import type { AgentProject } from '../types/agent'

// AI 설계 에이전트 전용 localStorage 저장소. 기존 storage.ts(ProjectData)와는
// 별도 키를 사용해 기존 8개 메뉴의 데이터를 전혀 건드리지 않는다.
export const AGENT_STORAGE_KEY = 'eduai-studio:agent-projects'

export function loadAgentProjects(): AgentProject[] {
  try {
    const raw = window.localStorage.getItem(AGENT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AgentProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('AI 설계 프로젝트를 불러오는 중 오류가 발생했습니다.', error)
    return []
  }
}

export function saveAgentProjects(projects: AgentProject[]): boolean {
  try {
    window.localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(projects))
    return true
  } catch (error) {
    console.error('AI 설계 프로젝트를 저장하는 중 오류가 발생했습니다.', error)
    return false
  }
}

export function upsertAgentProject(project: AgentProject): boolean {
  const projects = loadAgentProjects()
  const idx = projects.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    projects[idx] = project
  } else {
    projects.unshift(project)
  }
  return saveAgentProjects(projects)
}

export function deleteAgentProject(id: string): boolean {
  const projects = loadAgentProjects().filter((p) => p.id !== id)
  return saveAgentProjects(projects)
}

export function generateProjectName(courseName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const half = now.getMonth() < 6 ? 1 : 2
  return `${courseName || '새 과목'} ${year}-${half} AI 설계 프로젝트`
}
