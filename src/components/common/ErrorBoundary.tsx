import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Edu AI Studio에서 예기치 않은 오류가 발생했습니다.', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertOctagon className="h-7 w-7 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-brand-950">예기치 않은 오류가 발생했습니다</h1>
          <p className="max-w-sm text-sm text-brand-600">
            페이지를 새로고침해도 문제가 계속되면, 설정 메뉴에서 데이터를 내보낸 뒤 전체 초기화를 시도해보세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
