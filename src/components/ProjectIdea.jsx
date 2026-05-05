import { useState } from 'react'
import { Lightbulb, Wand2, Copy, Check } from 'lucide-react'
import { generateProjectPrompt, copyToClipboard } from '../utils/promptTemplates'
import PromptCard from './PromptCard'
import UsageGuide from './UsageGuide'

const AI_TOOLS = ['ChatGPT', 'Gemini', 'Perplexity', 'Gamma', 'Napkin AI', 'Notion AI', 'Claude']
const INDUSTRIES = ['유통·이커머스', '금융·핀테크', '헬스케어', '교육·에듀테크', '식음료·외식', '여행·숙박', '모빌리티', '패션·뷰티', 'AI·소프트웨어', '제조·스마트팩토리', '부동산·공간', 'ESG·소셜임팩트']

/* 시연용 샘플 데이터 */
const SAMPLE = {
  industry: '헬스케어',
  problem: '고령자 비대면 건강관리 서비스 접근성 부족',
  customer: 'MZ세대 자녀(30~40대)와 고령 부모(60~75세)',
  teamSize: '4',
  duration: '8주',
  aiTool: 'ChatGPT',
}

const USAGE_STEPS = [
  { icon: '🏭', text: '관심 산업을 선택하고, 해결하고 싶은 문제를 구체적으로 입력합니다.' },
  { icon: '👥', text: '고객 유형, 팀 인원, 프로젝트 기간을 입력합니다.' },
  { icon: '💡', text: '"아이디어 생성하기" 버튼을 클릭해 프로젝트 주제 후보 5개를 확인합니다.' },
  { icon: '📋', text: '아이디어 생성·팀 역할 분담·사업모델 캔버스 프롬프트를 각각 복사합니다.' },
  { icon: '🚀', text: 'ChatGPT 또는 Gemini에 프롬프트를 붙여넣어 팀 프로젝트 기획안을 완성합니다.' },
]

export default function ProjectIdea() {
  const [form, setForm] = useState(SAMPLE)
  const [prompts, setPrompts] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generateProjectPrompt(form))

  const handleCopy = async (key, text) => {
    await copyToClipboard(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const PROJECT_TOPICS = form.industry && form.problem ? [
    `${form.industry} 분야 AI 기반 개인화 건강 모니터링 구독 플랫폼`,
    `${form.industry} 분야 가족 연결형 O2O(온·오프라인 연계) 케어 서비스`,
    `${form.problem}을 해결하는 B2B SaaS 솔루션 (병원·요양원 대상)`,
    `${form.industry} 분야 ESG 연계 고령 친화 소셜벤처 창업 아이디어`,
    `${form.customer} 대상 웨어러블 기반 예방적 건강관리 앱 서비스`,
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-2.5 rounded-xl shadow-sm"><Lightbulb size={22} className="text-amber-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">프로젝트 아이디어 생성</h2>
          <p className="text-sm text-gray-500">팀 프로젝트 주제 발굴과 비즈니스 모델 설계를 위한 프롬프트를 생성합니다.</p>
        </div>
      </div>

      <UsageGuide
        steps={USAGE_STEPS}
        tip="팀별로 서로 다른 산업을 선택하게 하면, 다양한 주제를 발굴하는 브레인스토밍 수업으로 활용할 수 있습니다."
      />

      {/* 입력 폼 */}
      <div className="card !p-6">
        <h3 className="section-title"><Wand2 size={18} className="text-amber-600" /> 프로젝트 정보 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">관심 산업</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {INDUSTRIES.map(i => (
                <button key={i} onClick={() => set('industry', i)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.industry === i ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                  }`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">팀 인원</label>
            <input className="input-field" type="number" min="2" max="10" value={form.teamSize} onChange={e => set('teamSize', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">해결하고 싶은 문제</label>
            <textarea className="input-field" rows={2} value={form.problem} onChange={e => set('problem', e.target.value)} placeholder="예: 고령자 비대면 건강관리 서비스 접근성 부족" />
          </div>
          <div>
            <label className="label">고객 유형</label>
            <input className="input-field" value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="예: MZ세대, 고령자, 중소기업" />
          </div>
          <div>
            <label className="label">프로젝트 기간</label>
            <input className="input-field" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="예: 8주" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">활용하고 싶은 AI 도구</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {AI_TOOLS.map(t => (
                <button key={t} onClick={() => set('aiTool', t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.aiTool === t ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generate} className="btn-primary mt-5 bg-amber-500 hover:bg-amber-600 shadow-md">
          <Wand2 size={16} /> 아이디어 생성하기
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          {/* 주제 후보 */}
          <div className="card !p-5">
            <h3 className="section-title text-amber-700">💡 프로젝트 주제 후보 5개</h3>
            <ul className="space-y-2">
              {PROJECT_TOPICS.map((t, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                  <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* 빠른 복사 버튼 3개 */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { key: 'idea',   label: '💡 아이디어 생성', text: prompts.ideaGeneration },
              { key: 'role',   label: '👥 팀 역할 분담',  text: prompts.roleAssignment },
              { key: 'canvas', label: '📊 BMC 프롬프트',  text: prompts.businessCanvas },
            ].map(({ key, label, text }) => (
              <button
                key={key}
                onClick={() => handleCopy(key, text)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  copiedKey === key
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {copiedKey === key ? <><Check size={15} /> 복사됨!</> : <><Copy size={15} /> {label}</>}
              </button>
            ))}
          </div>

          <PromptCard title="🚀 아이디어 생성 프롬프트 (ChatGPT / Gemini)" prompt={prompts.ideaGeneration} color="orange" />
          <PromptCard title="👥 팀 역할 분담 프롬프트" prompt={prompts.roleAssignment} color="rose" />
          <PromptCard title="📊 비즈니스 모델 캔버스 생성 프롬프트" prompt={prompts.businessCanvas} color="purple" />
        </div>
      )}
    </div>
  )
}
