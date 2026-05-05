const menuItems = [
  { id: 'dashboard', icon: '🏠', label: '홈 대시보드',           group: 'main' },
  { id: 'lecture',   icon: '📚', label: '강의안·사례 발굴',      group: 'professor' },
  { id: 'project',   icon: '💡', label: '프로젝트 아이디어',     group: 'student' },
  { id: 'data',      icon: '📊', label: '데이터 분석·코딩',      group: 'student' },
  { id: 'pitch',     icon: '📑', label: '피치덱·보고서',         group: 'student' },
  { id: 'coaching',  icon: '🤝', label: '팀 코칭 에이전트',      group: 'student' },
  { id: 'agent',     icon: '🤖', label: 'AI 튜터·시뮬레이션',   group: 'advanced' },
  { id: 'weekly',    icon: '📅', label: '16주차 운영표',          group: 'professor' },
  { id: 'rubric',    icon: '✅', label: '평가 루브릭',            group: 'professor' },
  { id: 'links',     icon: '🔗', label: 'LMS·링크 관리',         group: 'professor' },
]

const groupConfig = {
  main:      { label: '메인',    color: 'text-slate-400' },
  professor: { label: '교수자', color: 'text-blue-400' },
  student:   { label: '학생·팀', color: 'text-emerald-400' },
  advanced:  { label: '고급',   color: 'text-purple-400' },
}

const groupOrder = ['main', 'professor', 'student', 'advanced']

export default function Sidebar({ active, setActive, menuOpen, setMenuOpen }) {
  const handleSelect = (id) => {
    setActive(id)
    setMenuOpen(false)
  }

  const grouped = groupOrder.map(g => ({
    group: g,
    items: menuItems.filter(m => m.group === g),
  }))

  return (
    <>
      {/* 모바일 오버레이 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40
          flex flex-col transition-transform duration-300
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto lg:w-56 xl:w-64
        `}
        style={{ background: '#0f172a' }}
      >
        {/* 사이드바 상단 (모바일) */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">EduAI Studio</p>
            <p className="text-white text-sm font-bold mt-0.5">메뉴</p>
          </div>
          <button onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>

        {/* 로고 영역 (데스크탑) */}
        <div className="hidden lg:flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-base">
            🎓
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-400 uppercase leading-none">EduAI Studio</p>
            <p className="text-white/60 text-xs mt-0.5">경영학 AI 플랫폼</p>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {grouped.map(({ group, items }) => (
            <div key={group} className="mb-1">
              <p className={`text-xs font-bold uppercase tracking-wider px-3 py-2 ${groupConfig[group].color}`}>
                {groupConfig[group].label}
              </p>
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all mb-0.5
                    ${active === item.id
                      ? 'bg-blue-600/20 text-blue-300 font-semibold'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }
                  `}
                >
                  <span className={`text-base w-5 text-center ${active === item.id ? '' : 'opacity-70'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 leading-tight text-sm">{item.label}</span>
                  {active === item.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 하단 정보 */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/40 leading-relaxed">
              🔒 개인정보 미저장<br />
              ⚠️ AI 결과 교수자 검토 필수<br />
              📋 Business AI Class Studio v2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export { menuItems }
