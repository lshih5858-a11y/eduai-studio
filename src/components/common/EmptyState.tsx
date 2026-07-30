import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
        <Icon className="h-7 w-7 text-brand-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-brand-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-brand-700">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
