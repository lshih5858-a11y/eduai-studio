import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '통찰경영 AI 튜터',
  description: '데이터 → 패턴 → 통찰 → 전략으로 사고하는 경영학 AI 튜터',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
