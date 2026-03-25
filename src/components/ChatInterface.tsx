'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { TutorMode, MODES } from '@/lib/tutorPrompt'
import MessageBubble, { Message } from './MessageBubble'
import ModeSelector from './ModeSelector'

// 모드별 초기 안내 메시지
function getWelcomeMessage(mode: TutorMode): string {
  const modeInfo = MODES.find(m => m.id === mode)
  const modeName = modeInfo ? `${modeInfo.emoji} ${modeInfo.label}` : ''

  const messages: Record<TutorMode, string> = {
    concept: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 통찰경영 개념을 함께 탐구해볼까요?\n\n예시:\n- "VUCA 환경이 무엇인지 설명해줘"\n- "비즈니스 모델 캔버스를 알려줘"\n- "블루오션 전략의 핵심 원리를 설명해줘"\n\n🤔 어떤 개념이 가장 궁금하신가요?`,
    case: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 기업이나 산업의 사례를 살펴볼까요?\n\n예시:\n- "쿠팡의 데이터 기반 전략 사례를 보여줘"\n- "넷플릭스가 어떻게 시장을 혁신했는지 사례로 보여줘"\n- "삼성이 반도체 1위가 된 전략적 사례를 알려줘"\n\n🤔 어떤 분야의 통찰 있는 사례가 궁금하신가요?`,
    visual: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 프레임워크나 개념을 시각적으로 구조화해볼까요?\n\n예시:\n- "Porter's 5 Forces를 표로 정리해줘"\n- "SWOT 분석 매트릭스를 만들어줘"\n- "데이터→패턴→통찰→전략 흐름을 시각화해줘"\n\n🤔 어떤 개념을 구조적으로 이해하고 싶으신가요?`,
    insight: `안녕하세요! **${modeName} 모드**입니다.\n\n저는 답을 직접 드리지 않고, 질문을 통해 여러분이 스스로 통찰을 발견하도록 돕겠습니다.\n\n주제나 현상을 말씀해주시면 함께 파고들어 볼게요!\n\n예시:\n- "왜 대기업들이 스타트업에 밀리는 경우가 있을까"\n- "카카오뱅크가 기존 은행보다 왜 성장했을까"\n\n🤔 어떤 현상이나 문제를 함께 탐구해볼까요?`,
    strategy: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 비즈니스 상황이나 문제에 대한 전략을 함께 고민해볼까요?\n\n예시:\n- "기존 오프라인 유통 기업이 디지털 전환하는 전략은?"\n- "스타트업이 대기업과 경쟁할 수 있는 전략은?"\n- "글로벌 시장 진출 전략 옵션들을 분석해줘"\n\n🤔 어떤 전략적 과제를 해결하고 싶으신가요?`,
    quiz: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 주제로 실력을 테스트해볼까요? 개념 확인 → 사례 분석 → 통찰 도출 순서로 문제를 드릴게요!\n\n예시:\n- "경쟁전략 전반적으로 퀴즈 내줘"\n- "Porter's 5 Forces 퀴즈 내줘"\n- "블루오션 전략 심화 문제 풀고 싶어"\n\n🤔 어떤 주제로 평가를 시작할까요?`,
    summary: `안녕하세요! **${modeName} 모드**입니다.\n\n어떤 주제나 오늘 배운 내용을 구조적으로 정리해드릴까요?\n\n예시:\n- "오늘 배운 경쟁전략 내용 정리해줘"\n- "데이터 기반 경영의 핵심 포인트를 정리해줘"\n- "디지털 전환 전략 핵심을 요약해줘"\n\n🤔 어떤 내용을 체계적으로 정리하고 싶으신가요?`,
    general: `안녕하세요! 저는 **통찰경영 AI 튜터**입니다. 🎓\n\n**데이터 → 패턴 → 통찰 → 전략**의 사고 흐름으로 함께 경영을 배워봅시다!\n\n위의 **학습 모드**를 선택하거나, 자유롭게 질문해주세요.\n\n🤔 오늘 가장 궁금한 통찰경영 주제는 무엇인가요?`,
  }
  return messages[mode]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState<TutorMode>('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 초기 웰컴 메시지
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage('general'),
      mode: 'general',
      timestamp: new Date(),
    }
    setMessages([welcomeMsg])
  }, [])

  // 모드 변경 시 안내 메시지 추가
  const handleModeChange = useCallback((mode: TutorMode) => {
    setCurrentMode(mode)
    const modeInfo = MODES.find(m => m.id === mode)
    const modeLabel = modeInfo ? `${modeInfo.emoji} ${modeInfo.label}` : mode

    const modeChangeMsg: Message = {
      id: `mode-${Date.now()}`,
      role: 'assistant',
      content: getWelcomeMessage(mode),
      mode,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, {
      id: `mode-notice-${Date.now()}`,
      role: 'assistant',
      content: `**${modeLabel} 모드**로 전환되었습니다.`,
      mode,
      timestamp: new Date(),
    }, modeChangeMsg])
  }, [])

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 텍스트영역 자동 높이 조절
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const sendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      mode: currentMode,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    // 스트리밍 AI 응답 메시지 초기화
    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      mode: currentMode,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      // API 요청 (대화 히스토리 전송, 최근 20개)
      const historyMessages = newMessages
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyMessages,
          mode: currentMode,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // 스트리밍 읽기
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk

          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          )
        }
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: '죄송합니다, 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n\n💡 **ANTHROPIC_API_KEY** 환경 변수가 설정되어 있는지 확인해주세요.',
              }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentModeInfo = MODES.find(m => m.id === currentMode)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🎓 통찰경영 AI 튜터</h1>
            <p className="text-xs text-blue-100">데이터 → 패턴 → 통찰 → 전략</p>
          </div>
          <div className="flex items-center gap-2">
            {currentModeInfo && currentMode !== 'general' && (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {currentModeInfo.emoji} {currentModeInfo.label}
              </span>
            )}
            <span className="bg-green-400 text-white text-xs px-2 py-0.5 rounded-full">
              Claude Opus
            </span>
          </div>
        </div>
      </header>

      {/* 모드 선택기 */}
      <div className="max-w-4xl w-full mx-auto">
        <ModeSelector currentMode={currentMode} onModeChange={handleModeChange} />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* 타이핑 인디케이터 */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mr-2 mt-1">
                AI
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* 빠른 입력 제안 */}
          {messages.length <= 3 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                '블루오션 전략 설명해줘',
                '쿠팡 성장 사례 보여줘',
                '경쟁전략 퀴즈 내줘',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    textareaRef.current?.focus()
                  }}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                currentMode === 'insight'
                  ? '탐구할 현상이나 질문을 입력하세요...'
                  : currentMode === 'quiz'
                    ? '퀴즈 주제를 입력하세요...'
                    : '질문이나 주제를 입력하세요... (Shift+Enter로 줄바꿈)'
              }
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 font-medium text-sm hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            통찰경영 AI 튜터 · Claude Opus 4.6 · 교육 목적용
          </p>
        </div>
      </div>
    </div>
  )
}
