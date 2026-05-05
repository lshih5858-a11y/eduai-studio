import { useState } from 'react'
import { Users, Wand2, AlertTriangle } from 'lucide-react'
import { generateCoachingPrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'
import UsageGuide from './UsageGuide'

const STAGES = ['주제 선정', '자료 조사', '아이디어 도출', '데이터 분석', '발표자료 제작', '리허설']
const FEEDBACK_TYPES = ['논리성', '창의성', '실현가능성', '발표력', '자료 구성', '팀 협업']

/* 시연용 샘플 데이터 */
const SAMPLE = {
  stage:        '아이디어 도출',
  difficulty:   '아이디어가 너무 많아 핵심 주제를 좁히기 어렵고, 팀원 간 방향성 의견 충돌이 발생 중',
  roles:        'PM 1명(기획·진행), 리서치 2명(조사·분석), 발표 1명(자료제작)',
  deadline:     '3주 후 중간 발표',
  feedbackType: '논리성',
}

const USAGE_STEPS = [
  { icon: '📍', text: '현재 프로젝트 진행 단계를 선택합니다 (주제 선정 ~ 리허설).' },
  { icon: '✏️', text: '겪고 있는 어려운 점을 구체적으로 입력합니다. 상세할수록 유용한 코칭 프롬프트가 생성됩니다.' },
  { icon: '🤖', text: '"코칭 프롬프트 생성하기"를 클릭해 5종류의 AI 코칭 프롬프트를 받습니다.' },
  { icon: '💬', text: 'AI 코칭 프롬프트를 ChatGPT 또는 Claude에 붙여넣어 팀 코칭을 받습니다.' },
  { icon: '📋', text: '발표 전 점검표와 교수자 피드백 요청 이메일을 활용해 마무리합니다.' },
]

export default function TeamCoaching() {
  const [form, setForm] = useState(SAMPLE)
  const [prompts, setPrompts] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generateCoachingPrompt(form))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-rose-100 p-2.5 rounded-xl shadow-sm"><Users size={22} className="text-rose-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">팀 프로젝트 코칭 에이전트</h2>
          <p className="text-sm text-gray-500">프로젝트 진행 중 막히는 지점을 입력하면 AI 코칭·팀 회의 질문·점검표를 생성합니다.</p>
        </div>
      </div>

      <UsageGuide
        steps={USAGE_STEPS}
        tip="수업 중 팀별로 '어려운 점'만 입력하게 하고, 생성된 코칭 프롬프트를 팀 스스로 ChatGPT에 실행하게 하면 자기주도 학습 효과가 높습니다."
      />

      {/* 입력 폼 */}
      <div className="card !p-6">
        <h3 className="section-title"><Wand2 size={18} className="text-rose-600" /> 팀 현황 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">현재 단계</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {STAGES.map(s => (
                <button key={s} onClick={() => set('stage', s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.stage === s ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-rose-400'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">어려운 점 <span className="text-gray-400 font-normal">(구체적일수록 더 유용한 코칭 생성)</span></label>
            <textarea className="input-field" rows={3} value={form.difficulty} onChange={e => set('difficulty', e.target.value)} placeholder="예: 아이디어가 너무 많아 핵심 주제를 좁히기 어렵고, 팀원 간 방향성 충돌이 발생 중" />
          </div>
          <div>
            <label className="label">팀원 역할</label>
            <input className="input-field" value={form.roles} onChange={e => set('roles', e.target.value)} placeholder="예: PM 1명, 분석 2명, 발표 1명" />
          </div>
          <div>
            <label className="label">제출 마감일</label>
            <input className="input-field" value={form.deadline} onChange={e => set('deadline', e.target.value)} placeholder="예: 3주 후, 12월 15일" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 피드백 유형</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {FEEDBACK_TYPES.map(f => (
                <button key={f} onClick={() => set('feedbackType', f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.feedbackType === f ? 'bg-pink-600 text-white border-pink-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-pink-400'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={generate} className="btn-primary mt-5 bg-rose-600 hover:bg-rose-700 shadow-md">
          <Wand2 size={16} /> 코칭 프롬프트 생성하기
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>AI 코칭은 방향 제시를 위한 보조 도구입니다. 중요한 결정은 교수자 및 팀원과 함께 논의하세요.</p>
          </div>

          <PromptCard title="🎯 AI 코칭 요청 프롬프트 (ChatGPT / Claude)" prompt={prompts.coaching} color="rose" />
          <PromptCard title="🗣️ 팀 회의 핵심 질문 생성 프롬프트" prompt={prompts.meetingQuestions} color="orange" />
          <PromptCard title="✅ 다음 실행 과제 추천 프롬프트" prompt={prompts.nextTasks} color="green" />
          <PromptCard title="📋 발표 전 점검표 생성 프롬프트" prompt={prompts.checklist} color="blue" />
          <PromptCard title="📧 교수자 피드백 요청 이메일 프롬프트" prompt={prompts.professorFeedback} color="indigo" />

          {/* 팀 갈등 조정 */}
          <div className="card border-2 border-rose-100 !p-5">
            <h3 className="section-title text-rose-700">🤝 팀 갈등 조정 프롬프트</h3>
            <div className="prompt-box text-xs">
              {`우리 팀 프로젝트에서 팀원 간 의견 충돌이 발생했습니다.\n상황: "${form.difficulty}"\n\n경영학적 팀 역학(Team Dynamics) 이론에 근거하여 다음을 제안해 주세요:\n1. 갈등의 근본 원인 분석\n2. 단기적 해결 방안 3가지\n3. 장기적 팀 문화 개선 방법\n4. 다음 팀 미팅 진행 방식 제안\n5. 역할 재조정 방안\n\n현재 역할: ${form.roles} | 마감: ${form.deadline}`}
            </div>
          </div>

          {/* 발표 리허설 */}
          <div className="card border-2 border-pink-100 !p-5">
            <h3 className="section-title text-pink-700">🎤 발표 리허설 AI 피드백 프롬프트</h3>
            <div className="prompt-box text-xs">
              {`다음 발표 대본을 검토하고 피드백을 제공해 주세요.\n[발표 대본을 여기에 붙여넣기]\n\n평가 기준:\n- 논리 흐름과 스토리라인 (30점)\n- 데이터·사례 활용의 적절성 (25점)\n- 청중 설득력과 언어 명확성 (20점)\n- 발표 시간 배분 (15점)\n- 마무리 및 Q&A 대비 (10점)\n\n발표 시간: 10분 기준 각 슬라이드 소요 시간도 제안해 주세요.\n현재 단계: ${form.stage}`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
