import { useState } from 'react'
import { BookOpen, Wand2, AlertTriangle } from 'lucide-react'
import { generateLecturePrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'

const CASE_TYPES = ['국내기업', '글로벌기업', '스타트업', '서비스기업', '플랫폼기업', 'ESG', 'AI전환']
const LEVELS = ['학부 1~2학년', '학부 3~4학년', '대학원 석사', 'MBA', '경영학 비전공자']

const DEFAULT = {
  subject: '경영전략', week: '4', topic: '경쟁우위와 블루오션 전략', level: '학부 3~4학년', caseType: '글로벌기업'
}

export default function LectureCase() {
  const [form, setForm] = useState(DEFAULT)
  const [prompts, setPrompts] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => {
    const result = generateLecturePrompt(form)
    setPrompts(result)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-xl"><BookOpen size={22} className="text-blue-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">강의안·사례 발굴</h2>
          <p className="text-sm text-gray-500">경영학 수업 주제를 입력하면 강의안과 최신 사례 탐색 프롬프트를 생성합니다.</p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="card">
        <h3 className="section-title"><Wand2 size={18} className="text-blue-600" /> 수업 정보 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">과목명</label>
            <input className="input-field" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="예: 경영전략, 마케팅관리, 운영관리" />
          </div>
          <div>
            <label className="label">주차</label>
            <input className="input-field" type="number" min="1" max="16" value={form.week} onChange={e => set('week', e.target.value)} placeholder="예: 4" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">수업 주제</label>
            <input className="input-field" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="예: 경쟁우위와 블루오션 전략" />
          </div>
          <div>
            <label className="label">학생 수준</label>
            <select className="input-field" value={form.level} onChange={e => set('level', e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">원하는 사례 유형</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CASE_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => set('caseType', t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.caseType === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generate} className="btn-primary mt-5">
          <Wand2 size={16} /> 프롬프트 생성하기
        </button>
      </div>

      {/* 출력 영역 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>생성된 프롬프트는 ChatGPT, Gemini, Perplexity 등 AI 도구에 붙여넣기하여 사용하세요. AI 결과물은 교수자 검토 후 수업에 활용하세요.</p>
          </div>

          <PromptCard title="🤖 GPT용 강의안 생성 프롬프트" prompt={prompts.gpt} color="blue" />
          <PromptCard title="✨ Gemini용 최신 사례 탐색 프롬프트" prompt={prompts.gemini} color="green" />
          <PromptCard title="🔍 Perplexity용 사례 검증 프롬프트" prompt={prompts.perplexity} color="orange" />

          <div className="card">
            <h3 className="section-title text-blue-700">💬 토론 질문 5개</h3>
            <ul className="space-y-2">
              {prompts.discussion.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="section-title text-emerald-700">🎯 수업 활동 아이디어 3개</h3>
            <ul className="space-y-2">
              {prompts.activities.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
