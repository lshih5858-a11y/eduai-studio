import { GraduationCap, Menu, X } from 'lucide-react'
import { DemoBadge } from '../common/DemoBadge'
import { navItems } from './navItems'
import type { MenuKey } from '../../types'

interface TopBarProps {
  active: MenuKey
  mobileOpen: boolean
  onToggleMobile: () => void
  onNavigate: (key: MenuKey) => void
}

export function TopBar({ active, mobileOpen, onToggleMobile, onNavigate }: TopBarProps) {
  const activeLabel = navItems.find((item) => item.key === active)?.label ?? ''

  return (
    <header className="no-print sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-brand-950">Edu AI Studio</span>
        </div>
        <h2 className="hidden text-lg font-semibold text-brand-950 lg:block">{activeLabel}</h2>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <DemoBadge />
          </div>
          <button
            type="button"
            onClick={onToggleMobile}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-brand-700 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <DemoBadge />
      </div>
      {mobileOpen && (
        <nav className="border-t border-brand-100 bg-white px-3 py-3 lg:hidden" aria-label="모바일 메뉴">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
