import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '../utils/promptTemplates'

export default function PromptCard({ title, prompt, color = 'blue' }) {
  const [copied, setCopied] = useState(false)

  const COLOR_MAP = {
    blue:   'bg-blue-50 border-blue-200 text-blue-900',
    green:  'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    rose:   'bg-rose-50 border-rose-200 text-rose-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  }

  const BTN_MAP = {
    blue:   'bg-blue-600 hover:bg-blue-700',
    green:  'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-500 hover:bg-orange-600',
    rose:   'bg-rose-600 hover:bg-rose-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  }

  const handleCopy = async () => {
    await copyToClipboard(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!prompt) return null

  return (
    <div className={`border rounded-xl p-4 ${COLOR_MAP[color] ?? COLOR_MAP.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">{title}</p>
        <button
          onClick={handleCopy}
          className={`${BTN_MAP[color] ?? BTN_MAP.blue} text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors`}
        >
          {copied ? <><Check size={13} /> 복사됨!</> : <><Copy size={13} /> 복사</>}
        </button>
      </div>
      <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono">{prompt}</p>
    </div>
  )
}
