import { useState } from 'react'
import { copyToClipboard } from '../utils/copyToClipboard'

export default function CopyButton({ text, label = '프롬프트 복사', className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyToClipboard(text, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn-copy ${className}`}
    >
      {copied ? (
        <>✅ <span>복사됨!</span></>
      ) : (
        <>📋 <span>{label}</span></>
      )}
    </button>
  )
}
