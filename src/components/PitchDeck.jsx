import { useState } from 'react'
import { Presentation, Wand2, AlertTriangle } from 'lucide-react'
import { generatePitchPrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'
import UsageGuide from './UsageGuide'

/* 시연용 샘플 데이터 */
const SAMPLE = {
  title:      'CareLink — 고령자 AI 건강관리 플랫폼',
  problem:    '고령자의 비대면 건강관리 서비스 접근성 부족, 가족 연결 기능 미흡',
  solution:   'AI 기반 맞춤형 건강 모니터링 + 가족 알림 연동 구독 앱',
  customer:   '60~75세 고령자 및 그 자녀(30~40대 직장인)',
  market:     '국내 디지털헬스케어 시장 2.5조원, 연 15% 성장 중',
  competitor: 'Naver 헬스케어, 카카오헬스케어, 굿닥, 케어닥',
  revenue:    '월 구독료 9,900원 (B2C) + 요양원 SaaS 연계 (B2B)',
  impact:     '노인 1인당 병원 방문 횟수 30% 절감, 가족 안심 지수 향상, 예방적 건강관리 전환',
  duration:   '10분',
}

const USAGE_STEPS = [
  { icon: '📝', text: '프로젝트 제목·핵심 문제·해결 아이디어를 입력합니다. 샘플 데이터로 바로 시연 가능합니다.' },
  { icon: '🏪', text: '고객·시장·경쟁자·수익모델·기대효과 정보를 채웁니다.' },
  { icon: '🎨', text: '"피치덱·보고서 프롬프트 생성"을 클릭해 Gamma·보고서·대본 프롬프트를 받습니다.' },
  { icon: '🖥️', text: 'Gamma 프롬프트는 gamma.app의 "AI로 만들기"에 붙여넣어 슬라이드를 즉시 생성합니다.' },
  { icon: '📄', text: '보고서·요약·대본 프롬프트는 ChatGPT에 붙여넣어 문서를 자동 작성합니다.' },
]

const FIELDS = [
  { key: 'title',      label: '프로젝트 제목',                    span: 2 },
  { key: 'problem',    label: '핵심 문제',                        span: 2, textarea: true },
  { key: 'solution',   label: '해결 아이디어',                    span: 2, textarea: true },
  { key: 'customer',   label: '목표 고객',                        span: 1 },
  { key: 'market',     label: '시장 현황',                        span: 1 },
  { key: 'competitor', label: '경쟁자',                           span: 1 },
  { key: 'revenue',    label: '수익모델',                         span: 1 },
  { key: 'impact',     label: '기대효과',                         span: 2, textarea: true },
  { key: 'duration',   label: '발표 시간 (예: 10분)',              span: 1 },
]

export default function PitchDeck() {
  const [form, setForm] = useState(SAMPLE)
  const [prompts, setPrompts] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generatePitchPrompt(form))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2.5 rounded-xl shadow-sm"><Presentation size={22} className="text-purple-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">피치덱·보고서 자동화</h2>
          <p className="text-sm text-gray-500">팀 프로젝트 결과를 Gamma 피치덱·보고서·발표 대본 프롬프트로 자동 변환합니다.</p>
        </div>
      </div>

      <UsageGuide
        steps={USAGE_STEPS}
        tip="Gamma 사용 방법: gamma.app → 새로 만들기 → AI로 생성 → 프롬프트 붙여넣기 → 슬라이드 수 10장 선택 → 생성."
      />

      {/* 입력 폼 */}
      <div className="card !p-6">
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
        <button onClick={generate} className="btn-primary mt-5 bg-purple-600 hover:bg-purple-700 shadow-md">
          <Wand2 size={16} /> 피치덱·보고서 프롬프트 생성
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>Gamma 프롬프트는 <strong>gamma.app</strong>에서 사용하고, 보고서·대본 프롬프트는 ChatGPT 또는 Gemini에 사용하세요.</p>
          </div>

          {/* Gamma 가이드 */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-800">
            <p className="font-bold mb-2">🎨 Gamma 피치덱 제작 순서 (수업 중 실습)</p>
            <ol className="space-y-1 list-decimal list-inside text-xs leading-relaxed">
              <li><strong>gamma.app</strong> 접속 → 상단 "새로 만들기" 클릭</li>
              <li>"AI로 생성" 선택 → 아래 Gamma 프롬프트를 붙여넣기</li>
              <li>슬라이드 수: 10장 / 스타일: 비즈니스 컨설팅 선택</li>
              <li>생성 완료 후 내용 검토 및 브랜드 컬러로 수정</li>
              <li>오른쪽 상단 "공유" → 링크 복사 후 LMS에 제출</li>
            </ol>
          </div>

          <PromptCard title="🎨 Gamma용 피치덱 생성 프롬프트" prompt={prompts.gamma} color="purple" />
          <PromptCard title="📋 보고서 목차 자동 생성 프롬프트" prompt={prompts.outline} color="indigo" />
          <PromptCard title="🎤 발표 대본 생성 프롬프트" prompt={prompts.script} color="blue" />
          <PromptCard title="📄 1페이지 요약보고서 생성 프롬프트" prompt={prompts.summary} color="green" />
          <PromptCard title="📝 경영학 보고서 형식 변환 프롬프트" prompt={prompts.report} color="orange" />

          {/* 슬라이드 구조 */}
          <div className="card border-2 border-purple-100 !p-5">
            <h3 className="section-title text-purple-700">📊 추천 피치덱 슬라이드 구조 (10장)</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                '01  표지 — 팀명, 프로젝트명, 날짜',
                '02  문제 제기 — Pain Point & 고객 불편',
                '03  고객 분석 — 페르소나 & 시장 규모',
                '04  해결 아이디어 — 핵심 솔루션',
                '05  비즈니스 모델 — 수익 구조',
                '06  경쟁자 분석 — 포지셔닝 맵',
                '07  실행 전략 — 로드맵 & 타임라인',
                '08  기대효과 — 핵심 KPI',
                '09  한계점 & 극복 방안',
                '10  결론 & Q&A',
              ].map((s, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-gray-700 bg-purple-50 rounded-lg p-2.5 border border-purple-100">
                  <span className="text-purple-500 font-bold flex-shrink-0">{s.substring(0, 2)}</span>
                  <span>{s.substring(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
