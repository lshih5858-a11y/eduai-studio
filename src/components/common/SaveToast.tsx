import { CheckCircle2 } from 'lucide-react'
import { useProjectData } from '../../context/ProjectDataContext'

export function SaveToast() {
  const { toast } = useProjectData()

  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 sm:bottom-6 ${
        toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-brand-200" aria-hidden="true" />
        {toast.message}
      </div>
    </div>
  )
}
