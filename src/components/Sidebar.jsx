import {
  Home, BookOpen, Lightbulb, BarChart2, Presentation,
  Users, Bot, Calendar, ClipboardList, Link, X
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',    icon: Home,          label: '홈 대시보드',           badge: null },
  { id: 'lecture',      icon: BookOpen,      label: '강의안·사례 발굴',       badge: '교수' },
  { id: 'project',      icon: Lightbulb,     label: '프로젝트 아이디어',      badge: null },
  { id: 'data',         icon: BarChart2,     label: '데이터 분석·코딩',       badge: null },
  { id: 'pitchdeck',    icon: Presentation,  label: '피치덱·보고서 자동화',   badge: null },
  { id: 'coaching',     icon: Users,         label: '팀 프로젝트 코칭',       badge: '팀' },
  { id: 'agent',        icon: Bot,           label: 'AI 튜터·시뮬레이션',     badge: '신규' },
  { id: 'weekly',       icon: Calendar,      label: '16주차 수업 운영표',     badge: null },
  { id: 'rubric',       icon: ClipboardList, label: '평가 루브릭',            badge: null },
  { id: 'links',        icon: Link,          label: 'LMS·챗봇 링크',          badge: null },
]

const BADGE_COLOR = {
  교수: 'bg-blue-100 text-blue-700',
  팀:   'bg-purple-100 text-purple-700',
  신규: 'bg-green-100 text-green-700',
}

export default function Sidebar({ active, onSelect, mobileOpen, onClose }) {
  return (
    <>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-64 flex flex-col
          transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 모바일 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="font-bold text-gray-800">메뉴</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">메뉴</p>
          {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => { onSelect(id); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 ${
                active === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">{label}</span>
              {badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  active === id ? 'bg-white/20 text-white' : BADGE_COLOR[badge] ?? 'bg-gray-100 text-gray-600'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* 하단 안내 */}
        <div className="p-3 mx-2 mb-3 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100">
          <p className="font-semibold mb-1">📌 개인정보 안내</p>
          <p>이 플랫폼은 학생 개인정보를 서버에 저장하지 않습니다. 모든 데이터는 브라우저에만 저장됩니다.</p>
        </div>
      </aside>
    </>
  )
}
