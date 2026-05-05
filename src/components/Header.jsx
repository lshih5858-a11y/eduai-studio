import { GraduationCap, Users, BookOpen, Cpu, FlaskConical } from 'lucide-react'

const MODES = [
  { id: 'professor', label: '교수자 모드', icon: BookOpen,      color: 'bg-blue-500' },
  { id: 'student',   label: '학생 모드',   icon: GraduationCap, color: 'bg-emerald-500' },
  { id: 'team',      label: '팀 프로젝트', icon: Users,          color: 'bg-violet-500' },
]

export default function Header({ mode, onModeChange, onMenuToggle }) {
  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* EduAI Studio 브랜드 띠 */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white px-4 py-1.5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <FlaskConical size={13} className="text-indigo-300" />
            <span className="text-indigo-200 font-medium tracking-wide">EduAI Studio 연구소</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">경영학 AI 수업 운영 플랫폼</span>
          </div>
          <span className="text-slate-400 text-xs hidden sm:block">
            생성형 AI로 설계된 차세대 경영학 교육 모델
          </span>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white/15 border border-white/20 rounded-xl p-2 flex-shrink-0 shadow-inner">
              <Cpu size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight">
                Business AI Class Studio
              </h1>
              <p className="text-blue-200 text-xs hidden sm:block mt-0.5">
                생성형 AI 기반 경영학 수업 실습 플랫폼
              </p>
            </div>
          </div>

          {/* 모드 전환 */}
          <div className="flex gap-1.5 flex-shrink-0">
            {MODES.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 border ${
                  mode === id
                    ? `${color} text-white border-white/30 shadow-md`
                    : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/10'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* 모바일 햄버거 */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden bg-white/10 hover:bg-white/20 p-2 rounded-lg border border-white/10"
            aria-label="메뉴 열기"
          >
            <div className="space-y-1.5 w-5">
              <span className="block h-0.5 bg-white rounded" />
              <span className="block h-0.5 bg-white rounded w-4" />
              <span className="block h-0.5 bg-white rounded" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
