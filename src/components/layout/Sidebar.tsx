import { GraduationCap } from 'lucide-react'
import type { MenuKey } from '../../types'
import { navItems } from './navItems'

interface SidebarProps {
  active: MenuKey
  onNavigate: (key: MenuKey) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="no-print hidden w-64 shrink-0 border-r border-brand-100 bg-white lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 border-b border-brand-100 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-brand-950">Edu AI Studio</p>
          <p className="text-xs leading-tight text-brand-500">교수지원 플랫폼 1.0</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="주요 메뉴">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-brand-700 hover:bg-brand-50 hover:text-brand-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-brand-100 px-4 py-4 text-xs text-brand-500">
        <p>모든 데이터는 브라우저(localStorage)에만 저장됩니다.</p>
      </div>
    </aside>
  )
}
