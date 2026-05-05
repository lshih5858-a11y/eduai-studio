// localStorage 유틸리티 (향후 API 연동 가능 구조)

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('localStorage 저장 실패:', e)
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn('localStorage 삭제 실패:', e)
    }
  }
}

export const STORAGE_KEYS = {
  MODE: 'bais_mode',
  LINKS: 'bais_links',
  PROJECT_INFO: 'bais_project_info',
  LECTURE_FORM: 'bais_lecture_form',
  ACTIVE_MENU: 'bais_active_menu',
}
