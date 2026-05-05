import { useState } from 'react'
import { Presentation, Wand2, AlertTriangle } from 'lucide-react'
import { generatePitchPrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'

const DEFAULT = {
  title: 'CareLink - 고령자 건강관리 플랫폼',
  problem: '고령자의 비대면 건강관리 서비스 접근성 부족',
  solution: 'AI 기반 맞춤형 건강 모니터링 및 가족 연결 앱',
  customer: '60-75세 고령자 및 그 자녀(40대)',
  market: '국내 디지털헬스케어 시장 2.5조원 (연 15% 성장)',
  competitor: 'Naver 건강, 카카오헬스케어, 굿닥',
  revenue: '월 구독료 9,900원 + B2B 요양원 SaaS',
  impact: '노인 1인당 병원비 20% 절감, 가족 안심 지수 향상',
  duration: '10분',
}

export default function PitchDeck() {
  const [form, setForm] = useState(DEFAULT)
  const [prompts, setPrompts] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generatePitchPrompt(form))

  const FIELDS = [
    { key: 'title', label: '프로젝트 제목', span: 2 },
    { key: 'problem', label: '핵심 문제', span: 2, textarea: true },
    { key: 'solution', label: '해결 아이디어', span: 2, textarea: true },
    { key: 'customer', label: '목표 고객', span: 1 },
    { key: 'market', label: '시장 현황', span: 1 },
    { key: 'competitor', label: '경쟁자', span: 1 },
    { key: 'revenue', label: '수익모델', span: 1 },
    { key: 'impact', label: '기대효과', span: 2, textarea: true },
    { key: 'duration', label: '발표 시간 (예: 10분)', span: 1 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-xl"><Presentation size={22} className="text-purple-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">피치덱·보고서 자동화</h2>
          <p className="text-sm text-gray-500">팀 프로젝트 결과를 Gamma 피치덱, 보고서, 발표 대본으로 변환하는 프롬프트를 생성합니다.</p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="card">
        <h3 className="section-title"><Wand2 size={18} className="text-purple-600" /> 프로젝트 정보 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, span, textarea }) => (
            <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
              <label className="label">{label}</label>
              {textarea
                ? <textarea className="input-field" rows={2} value={form[key]} onChange={e => set(key, e.target.value)} />
                : <input className="input-field" value={form[key]} onChange={e => set(key, e.target.value)} />
              }
            </div>
          ))}
        </div>
        <button onClick={generate} className="btn-primary mt-5 bg-purple-600 hover:bg-purple-700">
          <Wand2 size={16} /> 피치덱·보고서 프롬프트 생성
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>Gamma 프롬프트는 <strong>gamma.app</strong>에서 "AI로 만들기" 기능에 붙여넣기하세요. 보고서 프롬프트는 ChatGPT 또는 Gemini에 사용하세요.</p>
          </div>

          {/* Gamma 사용 가이드 */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
            <p className="font-bold mb-2">🎨 Gamma 피치덱 제작 순서</p>
            <ol className="space-y-1 list-decimal list-inside text-xs">
              <li>gamma.app 접속 → "새로 만들기" 클릭</li>
              <li>"AI로 생성" 선택 → 아래 프롬프트 붙여넣기</li>
              <li>슬라이드 수: 10장, 스타일: 비즈니스 선택</li>
              <li>생성 후 내용 검토 및 디자인 수정</li>
            </ol>
          </div>

          <PromptCard title="🎨 Gamma용 피치덱 생성 프롬프트" prompt={prompts.gamma} color="purple" />
          <PromptCard title="📋 보고서 목차 자동 생성 프롬프트" prompt={prompts.outline} color="indigo" />
          <PromptCard title="🎤 발표 대본 생성 프롬프트" prompt={prompts.script} color="blue" />
          <PromptCard title="📄 1페이지 요약보고서 생성 프롬프트" prompt={prompts.summary} color="green" />
          <PromptCard title="📝 경영학 보고서 형식 변환 프롬프트" prompt={prompts.report} color="orange" />

          {/* 발표 구조 */}
          <div className="card border-2 border-purple-100">
            <h3 className="section-title text-purple-700">📊 추천 피치덱 슬라이드 구조 (10장)</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                '1. 표지 (팀명, 프로젝트명, 날짜)',
                '2. 문제 제기 (Pain Point)',
                '3. 고객 분석 (페르소나)',
                '4. 시장 규모 (TAM/SAM/SOM)',
                '5. 해결 아이디어 (솔루션)',
                '6. 비즈니스 모델',
                '7. 경쟁자 분석 (포지셔닝 맵)',
                '8. 실행 전략 (로드맵)',
                '9. 기대효과 및 성과 지표',
                '10. 결론 및 Q&A',
              ].map((s, i) => (
                <div key={i} className="flex gap-2 items-start text-sm text-gray-700 bg-purple-50 rounded-lg p-2 border border-purple-100">
                  <span className="text-purple-600 font-bold text-xs flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  {s.substring(3)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
