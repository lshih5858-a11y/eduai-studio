import { useState } from 'react'
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

const PAGES = {
  dashboard: Dashboard,
  lecture:   LectureCase,
  project:   ProjectIdea,
  data:      DataAnalysis,
  pitchdeck: PitchDeck,
  coaching:  TeamCoaching,
  agent:     AgentBuilder,
  weekly:    WeeklyPlan,
  rubric:    Rubric,
  links:     LinkManager,
}

const PAGE_TITLES = {
  dashboard: '홈 대시보드',
  lecture:   '강의안·사례 발굴',
  project:   '프로젝트 아이디어 생성',
  data:      '데이터 분석·코딩 보조',
  pitchdeck: '피치덱·보고서 자동화',
  coaching:  '팀 프로젝트 코칭 에이전트',
  agent:     'AI 튜터·비즈니스 시뮬레이션',
  weekly:    '16주차 수업 운영표',
  rubric:    '평가 루브릭',
  links:     'LMS·챗봇 링크 관리',
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [mode, setMode] = useState('professor')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const ActiveComponent = PAGES[activePage] ?? Dashboard

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        mode={mode}
        onModeChange={setMode}
        onMenuToggle={() => setMobileMenuOpen(true)}
      />

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* 사이드바 */}
        <Sidebar
          active={activePage}
          onSelect={setActivePage}
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          {/* 브레드크럼 */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <button onClick={() => setActivePage('dashboard')} className="hover:text-blue-600 transition-colors">
              홈
            </button>
            {activePage !== 'dashboard' && (
              <>
                <span>/</span>
                <span className="text-gray-700 font-medium">{PAGE_TITLES[activePage]}</span>
              </>
            )}
          </div>

          {/* 페이지 컴포넌트 */}
          <ActiveComponent
            mode={mode}
            onNavigate={setActivePage}
          />

          {/* 하단 푸터 */}
          <footer className="mt-12 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-600">
                EduAI Studio 연구소 — Business AI Class Studio
              </p>
              <p className="text-xs text-slate-400">생성형 AI 기반 경영학 수업 운영 플랫폼</p>
              <p className="text-xs text-amber-600">⚠️ AI 생성 결과물은 교수자 검토 후 수업에 활용하세요. 학생 개인정보는 서버에 저장되지 않습니다.</p>
              <p className="text-xs text-slate-400">저작권·표절·AI 윤리를 준수하여 사용해 주세요. © 2025 EduAI Studio</p>
            </div>
            {/* 향후 API 연동 가능: OpenAI API, Gemini API, LMS API */}
          </footer>
        </main>
      </div>
    </div>
  )
}
