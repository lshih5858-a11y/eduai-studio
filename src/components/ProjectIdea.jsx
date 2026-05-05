import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const SAMPLE = {
  industry: '헬스케어',
  problem: '65세 이상 독거 노인의 사회적 고립과 응급 상황 대응 부재',
  customer: '65세 이상 독거 노인 및 이를 걱정하는 40~50대 자녀',
  teamSize: '5',
  duration: '15주',
  aiTools: 'ChatGPT, Gamma, Napkin',
}

const industries = ['헬스케어', '핀테크', '에듀테크', '리테일·커머스', '식품·외식', '물류·유통', 'ESG·환경', 'AI·SaaS', '공공·사회', '엔터·미디어', '부동산·건설', '제조·스마트팩토리']

export default function ProjectIdea() {
  const [form, setForm] = useState(() => storage.get(STORAGE_KEYS.PROJECT_INFO, SAMPLE))
  const [generated, setGenerated] = useState(false)

  const update = (patch) => {
    const next = { ...form, ...patch }
    setForm(next)
    storage.set(STORAGE_KEYS.PROJECT_INFO, next)
  }

  const prompts = {
    idea: `우리 팀은 [${form.industry}] 분야에서 [${form.problem}]을(를) 해결하는 경영학 프로젝트를 수행합니다.
- 목표 고객: ${form.customer}
- 팀 인원: ${form.teamSize}명 / 기간: ${form.duration}
- 활용 AI 도구: ${form.aiTools}

다음을 포함한 프로젝트 기획안을 작성해 주세요:
1. 프로젝트 주제 후보 5개 (각 한 줄 설명 + 차별성 포함)
2. 문제 정의문 (HMW 형식: "어떻게 하면 ___가 ___할 수 있을까?")
3. 고객 페르소나 2개 (이름·나이·직업·하루 일과·핵심 니즈·불만사항)
4. 핵심 가설 3개 (고객·문제·솔루션 가설 각 1개)
5. 서비스 아이디어 개요 (핵심 기능 3가지)
6. 수익모델 3가지 옵션 (수익원·가격 전략 포함)
7. 1차 조사 방법 (설문·인터뷰·관찰 중 선택, 샘플 질문 3개 포함)
8. 발표 목차 구성안 (8슬라이드 기준)`,

    roles: `경영학 팀 프로젝트 역할 분담표를 작성해 주세요.
- 분야: [${form.industry}] / 문제: [${form.problem}]
- 팀 인원: ${form.teamSize}명 / 기간: ${form.duration}
- 활용 도구: ${form.aiTools}

각 역할별 (팀장·조사분석·전략기획·발표디자인·AI활용):
① 주요 책임 업무 3가지
② 주차별 마일스톤 (주요 산출물)
③ 협업 방법 (도구·미팅 주기)
팀 규칙 5가지 (의사결정·갈등 해결 포함)도 추가해 주세요.`,

    canvas: `[${form.industry}] 분야, [${form.problem}] 해결 서비스의 비즈니스 모델 캔버스를 작성해 주세요.
고객: ${form.customer}

BMC 9개 블록을 각각 3~5개 항목으로 구체적으로:
1. 고객 세그먼트 (주요·보조 고객 구분)
2. 가치 제안 (핵심 차별화 3가지)
3. 채널 (온라인·오프라인 구분)
4. 고객 관계 (고객 유지 전략)
5. 수익원 (가격 모델 포함)
6. 핵심 자원 (물리·인적·지식)
7. 핵심 활동 (운영 프로세스)
8. 핵심 파트너십 (협력사 후보)
9. 비용 구조 (고정·변동비 구분)
강점·위험 요인·MVP 제안도 포함해 주세요.`,
  }

  const outputStructure = ['1. 문제 정의', '2. 시장 분석', '3. 고객 페르소나', '4. 서비스 아이디어', '5. 비즈니스 모델', '6. 경쟁 분석', '7. 실행 계획', '8. 기대효과']

  return (
    <div className="space-y-5">

      <GuideBox
        mode="student"
        steps={['산업·문제 입력', '아이디어 프롬프트 실행', 'AI 결과 팀 검토', '아이디어 5개 중 선정', 'BMC·역할 분담 완성']}
        tip="팀 브레인스토밍 전에 이 메뉴를 사용해 AI 아이디어 후보를 먼저 뽑으세요. 이후 팀 토론으로 가장 적합한 아이디어를 선정하면 효율이 높아집니다."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">💡</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">프로젝트 아이디어 생성</h2>
            <p className="text-xs text-slate-500">팀 기본 정보 입력 → 주제 후보·BMC·역할 분담 프롬프트 자동 생성</p>
          </div>
          <button
            onClick={() => { setForm(SAMPLE); storage.set(STORAGE_KEYS.PROJECT_INFO, SAMPLE) }}
            className="ml-auto text-xs text-slate-400 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            📋 샘플 불러오기
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">관심 산업</label>
            <select className="input-field" value={form.industry} onChange={e => update({ industry: e.target.value })}>
              {industries.map(ind => <option key={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label className="label">팀 인원</label>
            <select className="input-field" value={form.teamSize} onChange={e => update({ teamSize: e.target.value })}>
              {['3', '4', '5', '6', '7'].map(n => <option key={n}>{n}명</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">해결하고 싶은 문제</label>
            <textarea className="input-field min-h-[70px] resize-y" value={form.problem} onChange={e => update({ problem: e.target.value })} placeholder="예: 중소기업의 마케팅 비용 부담 및 디지털 전환 어려움" />
          </div>
          <div>
            <label className="label">목표 고객</label>
            <input className="input-field" value={form.customer} onChange={e => update({ customer: e.target.value })} placeholder="예: 20~30대 1인 자영업자" />
          </div>
          <div>
            <label className="label">프로젝트 기간</label>
            <select className="input-field" value={form.duration} onChange={e => update({ duration: e.target.value })}>
              {['4주', '8주', '10주', '12주', '15주', '16주', '한 학기'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">활용하고 싶은 AI 도구</label>
            <input className="input-field" value={form.aiTools} onChange={e => update({ aiTools: e.target.value })} placeholder="예: ChatGPT, Gamma, Napkin, Python" />
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5">
          💡 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'idea',   badge: '아이디어',   badgeColor: 'bg-emerald-100 text-emerald-800', title: '프로젝트 아이디어·기획안 프롬프트' },
            { key: 'roles',  badge: '역할 분담',  badgeColor: 'bg-blue-100 text-blue-800',      title: '팀 역할 분담 프롬프트' },
            { key: 'canvas', badge: 'BMC',        badgeColor: 'bg-purple-100 text-purple-800',  title: '비즈니스 모델 캔버스 프롬프트' },
          ].map(({ key, badge, badgeColor, title }) => (
            <div key={key} className="card">
              <div className="prompt-header">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className={`badge ${badgeColor}`}>{badge}</span>
                  {title}
                </h3>
                <CopyButton text={prompts[key]} label="복사" />
              </div>
              <pre className="prompt-box">{prompts[key]}</pre>
            </div>
          ))}

          <div className="card bg-emerald-50 border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-3 text-sm">📋 발표 결과물 권장 구조 (8슬라이드)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {outputStructure.map(s => (
                <div key={s} className="bg-white rounded-xl p-2.5 text-xs text-emerald-700 font-semibold text-center border border-emerald-200 shadow-sm">{s}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
