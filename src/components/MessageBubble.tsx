'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MODES, TutorMode } from '@/lib/tutorPrompt'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode?: TutorMode
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
}

function getModeLabel(mode?: TutorMode): { emoji: string; label: string; color: string } | null {
  if (!mode || mode === 'general') return null
  const found = MODES.find(m => m.id === mode)
  if (!found) return null
  return { emoji: found.emoji, label: found.label, color: found.color }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const modeInfo = getModeLabel(message.mode)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mr-2 mt-1">
          AI
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* 모드 배지 (AI 메시지에만 표시) */}
        {!isUser && modeInfo && (
          <span className={`text-xs ${modeInfo.color} mb-1 font-medium`}>
            {modeInfo.emoji} {modeInfo.label} 모드
          </span>
        )}

        <div
          className={`
            rounded-2xl px-4 py-3 shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
            }
          `}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 테이블 스타일링
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border-collapse border border-gray-200 text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-200 px-3 py-2 text-gray-600">
                      {children}
                    </td>
                  ),
                  // 코드 블록
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    return isBlock ? (
                      <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                        {children}
                      </code>
                    ) : (
                      <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                  // 제목
                  h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-gray-800 mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-gray-700 mt-2 mb-1">{children}</h3>,
                  // 강조
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  // 목록
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                  // 단락
                  p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">{children}</p>,
                  // 인용문
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-400 pl-3 my-2 text-gray-600 italic">
                      {children}
                    </blockquote>
                  ),
                  // 가로선
                  hr: () => <hr className="my-3 border-gray-200" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <span className="text-xs text-gray-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold ml-2 mt-1">
          나
        </div>
      )}
    </div>
  )
}
