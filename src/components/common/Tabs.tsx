interface TabItem {
  key: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto border-b border-brand-100">
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
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
