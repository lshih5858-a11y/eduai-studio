const menuItems = [
  { id: 'dashboard', icon: '🏠', label: '홈 대시보드', short: '홈' },
  { id: 'lecture', icon: '📚', label: '강의안·사례 발굴', short: '강의안' },
  { id: 'project', icon: '💡', label: '프로젝트 아이디어 생성', short: '아이디어' },
  { id: 'data', icon: '📊', label: '데이터 분석·코딩 보조', short: '데이터' },
  { id: 'pitch', icon: '📑', label: '피치덱·보고서 자동화', short: '피치덱' },
  { id: 'coaching', icon: '🤝', label: '팀 프로젝트 코칭', short: '코칭' },
  { id: 'agent', icon: '🤖', label: 'AI 튜터·시뮬레이션', short: 'AI 튜터' },
  { id: 'weekly', icon: '📅', label: '16주차 수업 운영표', short: '16주차' },
  { id: 'rubric', icon: '✅', label: '평가 루브릭', short: '루브릭' },
  { id: 'links', icon: '🔗', label: 'LMS·챗봇 링크 관리', short: '링크' },
]

export default function Sidebar({ active, setActive, menuOpen, setMenuOpen }) {
  const handleSelect = (id) => {
    setActive(id)
    setMenuOpen(false)
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 z-40
          flex flex-col shadow-xl transition-transform duration-300
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:w-56 xl:w-60
        `}
      >
        {/* 사이드바 헤더 (모바일) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-blue-900 text-white">
          <span className="font-bold text-sm">메뉴</span>
          <button onClick={() => setMenuOpen(false)} className="text-xl">✕</button>
        </div>

        {/* 메뉴 목록 */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all
                ${active === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              <span className="flex-1 leading-tight">{item.label}</span>
              {idx < 3 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                  인기
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* 하단 정보 */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 leading-relaxed">
            🔒 개인정보 미저장<br />
            📋 v1.0 · 2025
          </p>
        </div>
      </aside>
    </>
  )
}

export { menuItems }
