import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import CopyButton from './CopyButton'

const initialForm = {
  industry: '헬스케어',
  problem: '노인 복지 서비스 접근성 부족',
  customer: '65세 이상 독거 노인',
  teamSize: '5',
  duration: '15주',
  aiTools: 'ChatGPT, Gamma, Python',
}

export default function ProjectIdea() {
  const [form, setForm] = useState(() =>
    storage.get(STORAGE_KEYS.PROJECT_INFO, initialForm)
  )
  const [generated, setGenerated] = useState(false)

  const industries = ['헬스케어', '핀테크', '에듀테크', '리테일', '식품·외식', '물류·유통', 'ESG·환경', 'AI·SaaS', '공공·사회', '엔터·미디어']

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    storage.set(STORAGE_KEYS.PROJECT_INFO, updated)
  }

  const prompts = {
    idea: `우리 팀은 [${form.industry}] 분야에서 [${form.problem}]을(를) 해결하는 경영학 프로젝트를 수행하려고 합니다.
- 고객: ${form.customer}
- 팀 인원: ${form.teamSize}명
- 프로젝트 기간: ${form.duration}
- 활용 AI 도구: ${form.aiTools}

다음을 포함하여 프로젝트 기획안을 작성해 주세요:
1. 프로젝트 주제 후보 5개 (각각 한 줄 설명 포함)
2. 문제 정의문 (Problem Statement, HMW 형식)
3. 고객 페르소나 2개 (이름, 나이, 직업, 니즈, 불만사항)
4. 핵심 가설 3개
5. 서비스 아이디어 개요
6. 수익모델 3가지 옵션
7. 조사 방법 (설문, 인터뷰, 관찰 등)
8. 발표 목차 구성안`,

    roles: `경영학 팀 프로젝트에서 [${form.industry}] 분야 [${form.problem}] 해결을 위해 ${form.teamSize}명 팀의 역할을 분담해 주세요.
프로젝트 기간: ${form.duration}
활용 도구: ${form.aiTools}

역할 분담표를 다음 형식으로 작성해 주세요:
- 팀장: 역할 및 주요 업무
- 조사·분석 담당: 역할 및 주요 업무
- 전략·기획 담당: 역할 및 주요 업무
- 발표·디자인 담당: 역할 및 주요 업무
- AI 활용 담당: 역할 및 주요 업무 (${form.aiTools} 활용)
각 단계별 마일스톤도 포함해 주세요.`,

    canvas: `[${form.industry}] 분야에서 [${form.problem}]을 해결하는 서비스의 비즈니스 모델 캔버스를 작성해 주세요.
고객 세그먼트: ${form.customer}
9개 블록 각각 구체적으로:
1. 고객 세그먼트
2. 가치 제안
3. 채널
4. 고객 관계
5. 수익원
6. 핵심 자원
7. 핵심 활동
8. 핵심 파트너십
9. 비용 구조
마지막으로 이 모델의 강점, 약점, 위협 요인도 간략히 정리해 주세요.`,
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">💡 프로젝트 아이디어 생성</h2>
        <p className="text-sm text-slate-500 mb-5">팀 프로젝트 기본 정보를 입력하면 주제 후보, 페르소나, 역할 분담, 비즈니스 모델 캔버스 프롬프트를 생성합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">관심 산업</label>
            <select className="input-field" value={form.industry} onChange={e => handleChange('industry', e.target.value)}>
              {industries.map(ind => <option key={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label className="label">팀 인원</label>
            <select className="input-field" value={form.teamSize} onChange={e => handleChange('teamSize', e.target.value)}>
              {['3', '4', '5', '6', '7'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">해결하고 싶은 문제</label>
            <input className="input-field" value={form.problem} onChange={e => handleChange('problem', e.target.value)} placeholder="예: 중소기업의 마케팅 비용 부담" />
          </div>
          <div>
            <label className="label">고객 유형</label>
            <input className="input-field" value={form.customer} onChange={e => handleChange('customer', e.target.value)} placeholder="예: 20~30대 1인 자영업자" />
          </div>
          <div>
            <label className="label">프로젝트 기간</label>
            <select className="input-field" value={form.duration} onChange={e => handleChange('duration', e.target.value)}>
              {['4주', '8주', '10주', '12주', '15주', '16주', '한 학기'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">활용하고 싶은 AI 도구</label>
            <input className="input-field" value={form.aiTools} onChange={e => handleChange('aiTools', e.target.value)} placeholder="예: ChatGPT, Gamma, Python, Napkin" />
          </div>
        </div>

        <button
          onClick={() => setGenerated(true)}
          className="btn-primary mt-5 w-full sm:w-auto"
        >
          💡 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">아이디어</span>
                프로젝트 아이디어 생성 프롬프트
              </h3>
              <CopyButton text={prompts.idea} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.idea}</pre>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">역할 분담</span>
                팀 역할 분담 프롬프트
              </h3>
              <CopyButton text={prompts.roles} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.roles}</pre>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">BMC</span>
                비즈니스 모델 캔버스 프롬프트
              </h3>
              <CopyButton text={prompts.canvas} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.canvas}</pre>
          </div>

          {/* 출력 구조 가이드 */}
          <div className="card bg-emerald-50 border border-emerald-200">
            <h4 className="font-bold text-emerald-800 mb-3">📋 발표 결과물 권장 구조</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['1. 문제 정의', '2. 시장 분석', '3. 고객 페르소나', '4. 서비스 아이디어', '5. 비즈니스 모델', '6. 경쟁 분석', '7. 실행 계획', '8. 기대효과'].map(s => (
                <div key={s} className="bg-white rounded-lg p-2 text-xs text-emerald-700 font-medium text-center border border-emerald-200">{s}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
