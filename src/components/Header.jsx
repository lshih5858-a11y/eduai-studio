import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'

const modeConfig = {
  professor: { label: '교수자 모드', icon: '👨‍🏫', color: 'bg-blue-600 text-white' },
  student: { label: '학생 모드', icon: '🎓', color: 'bg-emerald-600 text-white' },
  team: { label: '팀 프로젝트 모드', icon: '👥', color: 'bg-purple-600 text-white' },
}

export default function Header({ mode, setMode, menuOpen, setMenuOpen }) {
  const handleMode = (m) => {
    setMode(m)
    storage.set(STORAGE_KEYS.MODE, m)
  }

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 로고 영역 */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="메뉴 열기/닫기"
            >
              <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span>Business AI Class Studio</span>
              </h1>
              <p className="text-blue-200 text-xs mt-0.5 hidden sm:block">
                생성형 AI 기반 경영학 수업 실습 플랫폼
              </p>
            </div>
          </div>

          {/* 모드 버튼 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Object.entries(modeConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleMode(key)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  mode === key
                    ? cfg.color + ' ring-2 ring-white ring-offset-1 ring-offset-blue-800'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{cfg.icon}</span>
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 현재 모드 표시 배지 */}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-blue-300">현재:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modeConfig[mode].color}`}>
            {modeConfig[mode].icon} {modeConfig[mode].label}
          </span>
          <span className="text-xs text-blue-300 hidden sm:inline">
            ⚠️ AI 생성 결과는 교수자 검토 후 사용하세요
          </span>
        </div>
      </div>
    </header>
  )
}
