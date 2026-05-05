import { GraduationCap, Users, BookOpen, Cpu } from 'lucide-react'

const MODES = [
  { id: 'professor', label: '교수자 모드', icon: BookOpen, color: 'bg-blue-600' },
  { id: 'student', label: '학생 모드', icon: GraduationCap, color: 'bg-emerald-600' },
  { id: 'team', label: '팀 프로젝트 모드', icon: Users, color: 'bg-purple-600' },
]

export default function Header({ mode, onModeChange, menuOpen, onMenuToggle }) {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
              <Cpu size={24} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight whitespace-nowrap">Business AI Class Studio</h1>
              <p className="text-blue-200 text-xs hidden sm:block">생성형 AI 기반 경영학 수업 실습 플랫폼</p>
            </div>
          </div>

          {/* 모드 버튼 */}
          <div className="flex gap-2 flex-shrink-0">
            {MODES.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  mode === id
                    ? `${color} text-white shadow-md scale-105`
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* 모바일 사이드바 토글 */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden bg-white/15 hover:bg-white/25 p-2 rounded-lg"
            aria-label="메뉴 열기"
          >
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
