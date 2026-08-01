import { FlaskConical } from 'lucide-react'

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      교육용 시범 플랫폼
    </span>
  )
}
