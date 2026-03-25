'use client'

import { MODES, TutorMode, ModeInfo } from '@/lib/tutorPrompt'

interface ModeSelectorProps {
  currentMode: TutorMode
  onModeChange: (mode: TutorMode) => void
}

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-500 mb-2 font-medium">학습 모드 선택</p>
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode: ModeInfo) => {
          const isActive = currentMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              title={mode.description}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${isActive
                  ? `${mode.bgColor} ${mode.color} ${mode.borderColor} shadow-sm scale-105`
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <span>{mode.emoji}</span>
              <span>{mode.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
