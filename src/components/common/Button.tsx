import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

// 주요 동작(primary)은 크고 진하게, 보조 동작은 한 단계 가볍게 — 버튼 위계를 시각적으로 구분한다.
const variantClass: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-white text-base font-semibold px-5 py-2.5 shadow-sm hover:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-white text-brand-700 text-sm font-medium px-3.5 py-2 border border-brand-200 hover:bg-brand-50',
  danger:
    'bg-white text-red-600 text-sm font-medium px-3.5 py-2 border border-red-200 hover:bg-red-50',
  ghost: 'bg-transparent text-brand-600 text-sm font-medium px-2.5 py-1.5 hover:bg-brand-100',
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      {...rest}
    />
  )
}
