import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const SAMPLE = {
  subject: '경영전략',
  week: '4',
  topic: '블루오션 전략과 가치혁신',
  level: '3학년 대학생',
  caseType: ['스타트업', 'AI전환'],
}

export default function LectureCase() {
  const [form, setForm] = useState(() => storage.get(STORAGE_KEYS.LECTURE_FORM, SAMPLE))
  const [generated, setGenerated] = useState(false)

  const caseTypes = ['국내기업', '글로벌기업', '스타트업', '서비스기업', '플랫폼기업', 'ESG', 'AI전환']

  const toggleCaseType = (type) => {
    const next = form.caseType.includes(type)
      ? form.caseType.filter(t => t !== type)
      : [...form.caseType, type]
    update({ caseType: next })
  }

  const update = (patch) => {
    const next = { ...form, ...patch }
    setForm(next)
    storage.set(STORAGE_KEYS.LECTURE_FORM, next)
  }

  const caseStr = form.caseType.length > 0 ? form.caseType.join(', ') : '다양한 기업'

  const prompts = {
    gpt: `나는 경영학 교수입니다. [${form.subject}] 수업 ${form.week}주차에서 [${form.topic}]를 설명하려고 합니다.
대상: ${form.level}
사례 유형: ${caseStr}

다음 내용을 포함하여 90분 강의안을 작성해 주세요:
1. 핵심 개념 설명 (이론적 배경 포함, 비유·예시 활용)
2. 실제 기업 사례 2~3개 (${caseStr} 중심, 국내 사례 1개 이상)
3. 토론 질문 5개 (비판적 사고 유도)
4. 30분 팀 AI 실습 활동안
5. 핵심 키워드 10개
6. 추천 AI 도구 및 수업 내 활용 방법
7. 다음 주 예습 과제 2개`,

    gemini: `[${form.topic}] 주제와 관련하여 2024~2025년 최신 국내외 기업 사례를 찾아주세요.
조건:
- 사례 유형: ${caseStr}
- ${form.level} 수준에서 이해 가능
- 각 사례별: 기업명, 전략 내용, 성과 수치, 수업 시사점 포함
- 한국 기업 사례 1개 이상 포함
- 최신성 기준: 2023년 이후 사례 우선`,

    perplexity: `다음 내용을 신뢰할 수 있는 출처와 함께 검증해 주세요:
주제: [${form.topic}] / 과목: ${form.subject}
1. 최근 3년 내 국내외 연구·보고서 3개 (출처·연도 포함)
2. 실제 기업 적용 사례의 사실 여부 확인
3. 관련 통계 데이터 (출처 포함)
4. 이 전략의 한계·반론 시각`,

    discussion: `[${form.topic}]에 대한 경영학 ${form.level} 대상 토론 질문 5개를 생성해 주세요.
- 단순 암기가 아닌 비판적 사고를 요구하는 질문
- 실제 기업 사례와 연결하는 질문
- AI 시대의 맥락을 포함한 질문 1개 이상
- 각 질문에 예상 토론 포인트 2~3개와 참고 AI 도구 포함`,

    activity: `[${form.topic}] 수업의 30분 팀 AI 실습 활동 아이디어 3개를 제안해 주세요.
- AI 도구(ChatGPT, Gemini 등)를 직접 활용하는 활동
- 팀 4~5인 기준
- 각 활동별: 목표, 진행 방법, AI 프롬프트 예시, 산출물, 평가 기준 포함
- 수업 목표와 연계된 실용적 활동`,
  }

  return (
    <div className="space-y-5">

      {/* 수업 활용 가이드 */}
      <GuideBox
        mode="professor"
        steps={['과목·주제 입력', 'AI 도구 프롬프트 생성', 'ChatGPT·Gemini에 붙여넣기', '강의안·사례 획득', '수업 자료로 가공·활용']}
        tip="강의 전날 이 메뉴에서 프롬프트를 생성하고 ChatGPT에 실행하면, 90분 강의안 초안을 10분 이내에 완성할 수 있습니다. 결과는 반드시 검토 후 사용하세요."
      />

      {/* 입력 폼 */}
      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">📚</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">강의안·사례 발굴</h2>
            <p className="text-xs text-slate-500">수업 정보 입력 → GPT·Gemini·Perplexity 맞춤 프롬프트 자동 생성</p>
          </div>
          <button
            onClick={() => { setForm(SAMPLE); storage.set(STORAGE_KEYS.LECTURE_FORM, SAMPLE) }}
            className="ml-auto text-xs text-slate-400 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
            📋 샘플 불러오기
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">과목명</label>
            <input className="input-field" value={form.subject} onChange={e => update({ subject: e.target.value })} placeholder="예: 경영전략, 마케팅관리" />
          </div>
          <div>
            <label className="label">주차</label>
            <input className="input-field" value={form.week} onChange={e => update({ week: e.target.value })} placeholder="예: 4" type="number" min="1" max="16" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">수업 주제</label>
            <input className="input-field" value={form.topic} onChange={e => update({ topic: e.target.value })} placeholder="예: 블루오션 전략과 가치혁신" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">대상 학생 수준</label>
            <select className="input-field" value={form.level} onChange={e => update({ level: e.target.value })}>
              {['1학년 대학생', '2학년 대학생', '3학년 대학생', '4학년 대학생 (취업 준비)', '대학원생 (MBA)', '사내 교육 수강생'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 사례 유형 (복수 선택)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {caseTypes.map(type => (
                <button key={type} onClick={() => toggleCaseType(type)}
                  className={`chip ${form.caseType.includes(type) ? 'chip-active' : 'chip-inactive'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5">
          🚀 프롬프트 생성하기
        </button>
      </div>

      {/* 생성 결과 */}
      {generated && (
        <div className="space-y-4">
          {[
            { key: 'gpt',        badge: 'ChatGPT',         badgeColor: 'bg-green-100 text-green-800',   title: '강의안 생성 프롬프트' },
            { key: 'gemini',     badge: 'Gemini',          badgeColor: 'bg-blue-100 text-blue-800',     title: '최신 사례 탐색 프롬프트' },
            { key: 'perplexity', badge: 'Perplexity·Felo', badgeColor: 'bg-orange-100 text-orange-800', title: '사례 검증 프롬프트' },
            { key: 'discussion', badge: '토론',             badgeColor: 'bg-purple-100 text-purple-800', title: '토론 질문 5개 생성' },
            { key: 'activity',   badge: '실습',             badgeColor: 'bg-pink-100 text-pink-800',     title: '수업 활동 아이디어 3개' },
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

          <div className="card bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              ⚠️ <strong>교수자 안내:</strong> 생성된 프롬프트를 AI 도구에 붙여 넣고, 결과를 반드시 검토·수정 후 수업에 활용하세요.
              AI 결과물은 보조 자료이며 교수자의 전문적 판단이 우선합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
