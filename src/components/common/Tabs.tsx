import { useRef, type KeyboardEvent } from 'react'

interface TabItem {
  key: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
  /** id 접두사. 각 탭 버튼은 `${idPrefix}-tab-${key}`, 연결된 패널은 `${idPrefix}-panel-${key}`를 사용해야 합니다. */
  idPrefix?: string
}

export function Tabs({ tabs, active, onChange, idPrefix = 'tabs' }: TabsProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const focusAndSelect = (key: string) => {
    onChange(key)
    buttonRefs.current[key]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    if (e.key === 'Home') {
      focusAndSelect(tabs[0].key)
      return
    }
    if (e.key === 'End') {
      focusAndSelect(tabs[tabs.length - 1].key)
      return
    }
    const delta = e.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + delta + tabs.length) % tabs.length
    focusAndSelect(tabs[nextIndex].key)
  }

  return (
    <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto border-b border-brand-100">
      {tabs.map((tab, index) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[tab.key] = el
            }}
            id={`${idPrefix}-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`shrink-0 border-b-2 px-1 pb-3 text-base font-semibold transition-colors ${
              isActive
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-brand-400 hover:text-brand-600'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
