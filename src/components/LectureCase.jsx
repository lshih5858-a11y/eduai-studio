import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import CopyButton from './CopyButton'

const initialForm = {
  subject: '경영전략',
  week: '4',
  topic: '블루오션 전략과 가치혁신',
  level: '3학년 대학생',
  caseType: ['스타트업', 'AI전환'],
}

export default function LectureCase() {
  const [form, setForm] = useState(() =>
    storage.get(STORAGE_KEYS.LECTURE_FORM, initialForm)
  )
  const [generated, setGenerated] = useState(false)

  const caseTypes = ['국내기업', '글로벌기업', '스타트업', '서비스기업', '플랫폼기업', 'ESG', 'AI전환']

  const toggleCaseType = (type) => {
    const next = form.caseType.includes(type)
      ? form.caseType.filter(t => t !== type)
      : [...form.caseType, type]
    const updated = { ...form, caseType: next }
    setForm(updated)
    storage.set(STORAGE_KEYS.LECTURE_FORM, updated)
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    storage.set(STORAGE_KEYS.LECTURE_FORM, updated)
  }

  const caseTypeStr = form.caseType.length > 0 ? form.caseType.join(', ') : '다양한 기업'

  const prompts = {
    gpt: `나는 경영학 교수입니다. [${form.subject}] 수업 ${form.week}주차에서 [${form.topic}]를 설명하려고 합니다.
대상: ${form.level}
사례 유형: ${caseTypeStr}

다음 내용을 포함하여 90분 강의안을 작성해 주세요:
1. 핵심 개념 설명 (이론적 배경 포함)
2. 실제 기업 사례 2~3개 (${caseTypeStr} 중심)
3. 토론 질문 5개
4. 30분 팀 실습 활동 안
5. 핵심 키워드 10개
6. 추천 AI 도구 및 활용 방법`,

    gemini: `[${form.topic}] 주제와 관련하여 2024~2025년 최신 국내외 기업 사례를 찾아주세요.
조건:
- 사례 유형: ${caseTypeStr}
- 대학교 경영학 ${form.level} 수준에서 이해 가능한 수준
- 각 사례별로: 기업명, 전략 내용, 성과, 시사점 포함
- 가능하면 한국 기업 사례 1개 이상 포함`,

    perplexity: `다음 내용에 대해 신뢰할 수 있는 출처와 함께 정보를 검증해 주세요:
주제: [${form.topic}]
과목: ${form.subject}
1. 이 주제와 관련된 최근 3년 내 국내외 연구·보고서 3개
2. 실제 기업 적용 사례의 사실 여부 확인
3. 관련 통계 데이터 (출처 포함)
4. 반론 또는 한계점`,

    discussion: `[${form.topic}]에 대한 경영학 ${form.level} 대상 토론 질문 5개를 생성해 주세요.
- 단순 암기가 아닌 비판적 사고를 요구하는 질문
- 실제 기업 사례와 연결하는 질문
- 팀 토론에 적합한 형식
- 각 질문에 예상 토론 포인트 2~3개 포함`,

    activity: `[${form.topic}] 수업의 30분 팀 실습 활동 아이디어 3개를 제안해 주세요.
- AI 도구를 활용하는 활동 포함
- 팀 4~5인 기준
- 각 활동별: 목표, 진행 방법, 산출물, 평가 기준 포함
- 수업 목표와 연계된 실용적 활동으로 구성`,
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">📚 강의안·사례 발굴</h2>
        <p className="text-sm text-slate-500 mb-5">수업 정보를 입력하면 GPT, Gemini, Perplexity용 맞춤 프롬프트를 생성합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">과목명</label>
            <input className="input-field" value={form.subject} onChange={e => handleChange('subject', e.target.value)} placeholder="예: 경영전략, 마케팅관리" />
          </div>
          <div>
            <label className="label">주차</label>
            <input className="input-field" value={form.week} onChange={e => handleChange('week', e.target.value)} placeholder="예: 4" type="number" min="1" max="16" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">수업 주제</label>
            <input className="input-field" value={form.topic} onChange={e => handleChange('topic', e.target.value)} placeholder="예: 블루오션 전략과 가치혁신" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">대상 학생 수준</label>
            <select className="input-field" value={form.level} onChange={e => handleChange('level', e.target.value)}>
              <option>1학년 대학생</option>
              <option>2학년 대학생</option>
              <option>3학년 대학생</option>
              <option>4학년 대학생 (취업 준비)</option>
              <option>대학원생 (MBA)</option>
              <option>사내 교육 수강생</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 사례 유형 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {caseTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleCaseType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.caseType.includes(type)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setGenerated(true)}
          className="btn-primary mt-5 w-full sm:w-auto"
        >
          🚀 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {/* GPT 강의안 프롬프트 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">ChatGPT</span>
                강의안 생성 프롬프트
              </h3>
              <CopyButton text={prompts.gpt} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.gpt}</pre>
          </div>

          {/* Gemini 사례 탐색 프롬프트 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Gemini</span>
                최신 사례 탐색 프롬프트
              </h3>
              <CopyButton text={prompts.gemini} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.gemini}</pre>
          </div>

          {/* Perplexity 사례 검증 프롬프트 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">Perplexity / Felo</span>
                사례 검증 프롬프트
              </h3>
              <CopyButton text={prompts.perplexity} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.perplexity}</pre>
          </div>

          {/* 토론 질문 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">토론</span>
                토론 질문 5개 생성 프롬프트
              </h3>
              <CopyButton text={prompts.discussion} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.discussion}</pre>
          </div>

          {/* 수업 활동 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs font-bold">실습</span>
                수업 활동 아이디어 3개 프롬프트
              </h3>
              <CopyButton text={prompts.activity} label="복사" />
            </div>
            <pre className="prompt-box">{prompts.activity}</pre>
          </div>

          <div className="card bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              ⚠️ <strong>교수자 안내:</strong> 생성된 프롬프트를 AI 도구에 붙여 넣은 후, 결과를 반드시 검토·수정하여 수업에 활용하세요. AI 결과물은 보조 자료로 활용하고 교수자의 전문적 판단이 우선합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
