import type { ProjectData } from '../types'

export const STORAGE_KEY = 'eduai-studio:project-data'

export function loadProjectData(): ProjectData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProjectData
  } catch (error) {
    console.error('저장된 데이터를 불러오는 중 오류가 발생했습니다.', error)
    return null
  }
}

export function saveProjectData(data: ProjectData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('데이터를 저장하는 중 오류가 발생했습니다.', error)
    return false
  }
}

export function clearProjectData(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function createEmptyProjectData(): ProjectData {
  return {
    courseInfo: null,
    weeklyPlan: [],
    quizSets: [],
    rubrics: [],
    feedbackSets: [],
    tutorQuestions: [],
    updatedAt: new Date().toISOString(),
  }
}
