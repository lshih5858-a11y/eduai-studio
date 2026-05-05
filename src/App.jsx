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
  lecture: LectureCase,
  project: ProjectIdea,
  data: DataAnalysis,
  pitch: PitchDeck,
  coaching: TeamCoaching,
  agent: AgentBuilder,
  weekly: WeeklyPlan,
  rubric: Rubric,
  links: LinkManager,
}

const menuTitles = {
  dashboard: '홈 대시보드',
  lecture: '강의안·사례 발굴',
  project: '프로젝트 아이디어 생성',
  data: '데이터 분석·코딩 보조',
  pitch: '피치덱·보고서 자동화',
  coaching: '팀 프로젝트 코칭 에이전트',
  agent: 'AI 튜터·시뮬레이션 에이전트',
  weekly: '16주차 수업 운영표',
  rubric: '평가 루브릭',
  links: 'LMS·챗봇 링크 관리',
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState(() => storage.get(STORAGE_KEYS.ACTIVE_MENU, 'dashboard'))
  const [mode, setMode] = useState(() => storage.get(STORAGE_KEYS.MODE, 'professor'))
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSetActive = (menu) => {
    setActiveMenu(menu)
    storage.set(STORAGE_KEYS.ACTIVE_MENU, menu)
  }

  const ActiveComponent = menuComponents[activeMenu] || Dashboard

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header mode={mode} setMode={setMode} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        <Sidebar active={activeMenu} setActive={handleSetActive} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {/* 현재 메뉴 경로 표시 */}
          {activeMenu !== 'dashboard' && (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <button onClick={() => handleSetActive('dashboard')} className="hover:text-blue-600 transition-colors">
                홈
              </button>
              <span>›</span>
              <span className="text-slate-700 font-medium">{menuTitles[activeMenu]}</span>
            </div>
          )}

          <ActiveComponent mode={mode} setActive={handleSetActive} />

          {/* 하단 공통 안내 */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Business AI Class Studio · 경영학 AI 수업 실습 플랫폼 · 개인정보 미저장 · AI 결과물은 교수자 검토 후 활용<br />
              저작권·AI 윤리 준수 | 본 플랫폼은 수업 지원 도구이며 실제 API와 연결되지 않습니다
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
