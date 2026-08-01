import { useState, type ReactNode } from 'react'
import type { MenuKey } from '../../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SaveToast } from '../common/SaveToast'

interface AppShellProps {
  active: MenuKey
  onNavigate: (key: MenuKey) => void
  children: ReactNode
}

export function AppShell({ active, onNavigate, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = (key: MenuKey) => {
    onNavigate(key)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar active={active} onNavigate={handleNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          active={active}
          mobileOpen={mobileOpen}
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
          onNavigate={handleNavigate}
        />
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="no-print border-t border-brand-100 px-4 py-4 text-center text-xs text-brand-500 sm:px-6">
          Edu AI Studio 교수지원 플랫폼 1.0 · 교육용 시범 플랫폼 · 모든 AI 결과는 교수자의 검토가 필요합니다.
        </footer>
      </div>
      <SaveToast />
    </div>
  )
}
