import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 disabled:bg-brand-300',
  secondary: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  ghost: 'text-brand-700 hover:bg-brand-100',
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
      {...rest}
    />
  )
}
