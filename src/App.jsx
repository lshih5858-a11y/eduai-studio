import { useState } from 'react'
import { storage, STORAGE_KEYS } from './utils/storage'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LectureCase from './components/LectureCase'
import ProjectIdea from './components/ProjectIdea'
import DataAnalysis from './components/DataAnalysis'
import PitchDeck from './components/PitchDeck'
import TeamCoaching from './components/TeamCoaching'
import AgentBuilder from './components/AgentBuilder'
import WeeklyPlan from './components/WeeklyPlan'
import Rubric from './components/Rubric'
import LinkManager from './components/LinkManager'

const menuComponents = {
  dashboard: Dashboard,
  lecture:   LectureCase,
  project:   ProjectIdea,
  data:      DataAnalysis,
  pitch:     PitchDeck,
  coaching:  TeamCoaching,
  agent:     AgentBuilder,
  weekly:    WeeklyPlan,
  rubric:    Rubric,
  links:     LinkManager,
}

const menuMeta = {
  dashboard: { label: '홈 대시보드',              icon: '🏠' },
  lecture:   { label: '강의안·사례 발굴',         icon: '📚' },
  project:   { label: '프로젝트 아이디어 생성',   icon: '💡' },
  data:      { label: '데이터 분석·코딩 보조',    icon: '📊' },
  pitch:     { label: '피치덱·보고서 자동화',     icon: '📑' },
  coaching:  { label: '팀 프로젝트 코칭 에이전트', icon: '🤝' },
  agent:     { label: 'AI 튜터·시뮬레이션 에이전트', icon: '🤖' },
  weekly:    { label: '16주차 수업 운영표',        icon: '📅' },
  rubric:    { label: '평가 루브릭',               icon: '✅' },
  links:     { label: 'LMS·챗봇 링크 관리',       icon: '🔗' },
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState(() => storage.get(STORAGE_KEYS.ACTIVE_MENU, 'dashboard'))
  const [mode, setMode] = useState(() => storage.get(STORAGE_KEYS.MODE, 'professor'))
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSetActive = (menu) => {
    setActiveMenu(menu)
    storage.set(STORAGE_KEYS.ACTIVE_MENU, menu)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ActiveComponent = menuComponents[activeMenu] || Dashboard
  const current = menuMeta[activeMenu]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header mode={mode} setMode={setMode} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        <Sidebar active={activeMenu} setActive={handleSetActive} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <main className="flex-1 min-w-0 p-4 lg:p-6 xl:p-8">
          {/* 브레드크럼 */}
          {activeMenu !== 'dashboard' && (
            <nav className="flex items-center gap-2 text-sm mb-5">
              <button
                onClick={() => handleSetActive('dashboard')}
                className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <span>🏠</span>
                <span>홈</span>
              </button>
              <span className="text-slate-300">›</span>
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <span>{current.icon}</span>
                <span>{current.label}</span>
              </span>
            </nav>
          )}

          {/* 메인 콘텐츠 */}
          <ActiveComponent mode={mode} setActive={handleSetActive} />

          {/* 푸터 */}
          <footer className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs">🎓</div>
                <span className="text-xs font-bold text-slate-500">EduAI Studio · Business AI Class Studio v2.0</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>🔒 개인정보 미저장</span>
                <span>·</span>
                <span>⚠️ AI 결과 교수자 검토 필수</span>
                <span>·</span>
                <span>📋 AI 윤리 준수</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
