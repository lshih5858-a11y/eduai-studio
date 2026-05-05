import { storage, STORAGE_KEYS } from '../utils/storage'

const modeConfig = {
  professor: { label: '교수자 모드', icon: '👨‍🏫', bg: 'bg-blue-600', ring: 'ring-blue-300' },
  student:   { label: '학생 모드',   icon: '🎓',    bg: 'bg-emerald-600', ring: 'ring-emerald-300' },
  team:      { label: '팀 프로젝트', icon: '👥',    bg: 'bg-purple-600', ring: 'ring-purple-300' },
}

export default function Header({ mode, setMode, menuOpen, setMenuOpen }) {
  const handleMode = (m) => {
    setMode(m)
    storage.set(STORAGE_KEYS.MODE, m)
  }

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)' }}>
      {/* EduAI Studio 브랜드 띠 */}
      <div className="border-b border-white/10 px-4 py-1.5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-blue-300 uppercase">EduAI Studio</span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-xs text-blue-200/80">경영학 AI 수업 운영 플랫폼</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-blue-300/70">
            <span>🔒 개인정보 미저장</span>
            <span className="text-white/20">·</span>
            <span>📋 AI 윤리 준수</span>
            <span className="text-white/20">·</span>
            <span>v2.0</span>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* 왼쪽: 햄버거 + 로고 */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="메뉴 열기/닫기"
            >
              <span className="text-lg leading-none">{menuOpen ? '✕' : '☰'}</span>
            </button>

            <div className="flex items-center gap-3 min-w-0">
              {/* 로고 아이콘 */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xl shadow-md shrink-0">
                🎓
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                  Business AI Class Studio
                </h1>
                <p className="text-blue-200/70 text-xs mt-0.5 hidden sm:block truncate">
                  생성형 AI × 경영학 수업 실습 플랫폼
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 모드 버튼 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Object.entries(modeConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleMode(key)}
                className={`
                  flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold
                  transition-all duration-200 active:scale-95
                  ${mode === key
                    ? `${cfg.bg} text-white ring-2 ${cfg.ring} ring-offset-1 ring-offset-transparent shadow-md`
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                  }
                `}
              >
                <span className="text-sm sm:text-base leading-none">{cfg.icon}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 상태 바 */}
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${modeConfig[mode].bg} text-white shadow-sm`}>
            <span>{modeConfig[mode].icon}</span>
            <span>{modeConfig[mode].label} 활성</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300/90">
            <span>⚠️</span>
            <span className="hidden sm:inline">AI 생성 결과는 교수자 검토 후 수업에 활용하세요</span>
            <span className="sm:hidden">교수자 검토 필수</span>
          </div>
        </div>
      </div>
    </header>
  )
}
