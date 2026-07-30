import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children?: ReactNode
}

function FieldWrapper({ label, htmlFor, required, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-brand-900">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-500">{hint}</p>}
    </div>
  )
}

const baseInputClass =
  'w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-950 shadow-sm placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

type TextFieldProps = FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>

export function TextField({ label, htmlFor, required, hint, ...rest }: TextFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} required={required} hint={hint}>
      <input id={htmlFor} className={baseInputClass} {...rest} />
    </FieldWrapper>
  )
}

type TextareaFieldProps = FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextareaField({ label, htmlFor, required, hint, ...rest }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} required={required} hint={hint}>
      <textarea id={htmlFor} className={`${baseInputClass} resize-y`} {...rest} />
    </FieldWrapper>
  )
}

type SelectFieldProps = FieldWrapperProps &
  SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }

export function SelectField({ label, htmlFor, required, hint, children, ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={htmlFor} required={required} hint={hint}>
      <select id={htmlFor} className={baseInputClass} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  )
}
