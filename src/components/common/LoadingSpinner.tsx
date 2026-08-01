import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ label = '불러오는 중입니다...' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-brand-600">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
