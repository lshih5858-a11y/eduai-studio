import { ClipboardList, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '../utils/promptTemplates'
import UsageGuide from './UsageGuide'

const RUBRIC = [
  {
    item: '문제 정의 명확성', score: 20,
    color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-600',
    levels: [
      { level: '우수 (18-20점)', desc: '문제가 구체적이고, 데이터·인터뷰로 검증됨. 고객 고통점이 명확히 제시됨.' },
      { level: '보통 (13-17점)', desc: '문제 정의가 있으나 근거 자료가 부족하거나 범위가 넓음.' },
      { level: '미흡 (0-12점)', desc: '문제가 모호하거나, 해결 가능성이 낮고 근거가 없음.' },
    ],
  },
  {
    item: '경영학 이론 적용', score: 20,
    color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-600',
    levels: [
      { level: '우수 (18-20점)', desc: '관련 이론(SWOT, 4P, BCG, Porter 등)을 적절히 적용하고 분석에 연계함.' },
      { level: '보통 (13-17점)', desc: '이론을 언급하나 분석과의 연계가 표면적임.' },
      { level: '미흡 (0-12점)', desc: '이론 적용이 없거나 잘못 적용됨.' },
    ],
  },
  {
    item: 'AI 도구 활용 적절성', score: 20,
    color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-600',
    levels: [
      { level: '우수 (18-20점)', desc: 'AI 도구 활용 과정이 투명하게 공개되고, 결과를 비판적으로 검토·수정함.' },
      { level: '보통 (13-17점)', desc: 'AI를 활용했으나 활용 방식이 불명확하거나 결과를 무비판적으로 수용함.' },
      { level: '미흡 (0-12점)', desc: 'AI 활용이 없거나, AI 결과를 그대로 제출함 (표절 의심).' },
    ],
  },
  {
    item: '데이터·사례 분석력', score: 15,
    color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-600',
    levels: [
      { level: '우수 (13-15점)', desc: '신뢰할 수 있는 데이터와 사례를 사용하며, 분석 결과가 결론과 연계됨.' },
      { level: '보통 (9-12점)', desc: '데이터나 사례를 포함하나 분석 깊이가 부족함.' },
      { level: '미흡 (0-8점)', desc: '데이터나 사례가 없거나 출처가 불명확함.' },
    ],
  },
  {
    item: '발표자료 완성도', score: 15,
    color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-600',
    levels: [
      { level: '우수 (13-15점)', desc: '시각적으로 완성도가 높고, 스토리라인이 명확하며, 발표 흐름이 자연스러움.' },
      { level: '보통 (9-12점)', desc: '내용은 있으나 디자인이나 발표 흐름에 개선이 필요함.' },
      { level: '미흡 (0-8점)', desc: '발표자료가 미완성이거나 구성이 산만함.' },
    ],
  },
  {
    item: '팀 협업 및 성찰', score: 10,
    color: 'bg-rose-50 border-rose-200', badge: 'bg-rose-600',
    levels: [
      { level: '우수 (9-10점)', desc: '역할 분담이 명확하고, 성찰문에서 배움과 한계를 구체적으로 기술함.' },
      { level: '보통 (6-8점)', desc: '협업 과정이 있으나 성찰이 표면적임.' },
      { level: '미흡 (0-5점)', desc: '팀 기여도 차이가 크거나, 성찰이 없음.' },
    ],
  },
]

const SELF_CHECK = [
  '우리 팀의 문제 정의는 고객 인터뷰나 데이터로 뒷받침되고 있는가?',
  '발표에서 사용한 이론은 수업에서 배운 내용과 연결되어 있는가?',
  '사용한 AI 도구와 프롬프트를 보고서에 기록하였는가?',
  'AI가 생성한 내용을 그대로 제출하지 않고 검토·수정하였는가?',
  '사용한 데이터와 사례의 출처를 모두 표기하였는가?',
  '발표 슬라이드는 10장 이내로 간결하게 정리되었는가?',
  '각 팀원의 역할과 기여도를 명확히 서술하였는가?',
  '보고서에 AI 활용 윤리 준수 선언을 포함하였는가?',
  '발표 시간(10분)에 맞게 분량을 조정하였는가?',
  '예상 질문 5개에 대한 답변을 준비하였는가?',
]

const FEEDBACK_PROMPT = `다음 팀 프로젝트 결과물에 대해 교수자 관점의 피드백을 작성해 주세요.

[평가 기준]
- 문제 정의 명확성 (20점): 고객 문제가 구체적이고 검증되었는가?
- 경영학 이론 적용 (20점): 관련 이론을 적절히 활용하였는가?
- AI 도구 활용 적절성 (20점): AI를 비판적으로 활용하였는가?
- 데이터·사례 분석력 (15점): 신뢰할 수 있는 근거를 제시하였는가?
- 발표자료 완성도 (15점): 스토리라인과 시각화가 완성도 있는가?
- 팀 협업 및 성찰 (10점): 역할 분담과 성찰이 충분한가?

[팀 발표 내용을 여기에 붙여넣기]

각 항목별로 점수와 구체적인 개선 제안을 포함한 피드백을 한국어로 작성해 주세요.
마지막에 종합 의견 3문장과 다음 단계 권고사항을 추가해 주세요.`

const USAGE_STEPS = [
  { icon: '📊', text: '루브릭 기준표를 출력하여 팀 프로젝트 시작 시 학생들과 공유합니다.' },
  { icon: '✅', text: '학생용 자기평가 체크리스트를 제출 전 팀이 직접 확인하게 합니다.' },
  { icon: '📋', text: '교수자 피드백 프롬프트를 복사 후 ChatGPT에 팀 발표 내용과 함께 붙여넣습니다.' },
  { icon: '📄', text: 'AI가 생성한 피드백을 교수자가 검토·수정하여 학생들에게 전달합니다.' },
]

export default function Rubric() {
  const [copiedRubric, setCopiedRubric] = useState(false)
  const [copiedFeedback, setCopiedFeedback] = useState(false)
  const [selfCheck, setSelfCheck] = useState({})

  const handleCopyRubric = async () => {
    const text = RUBRIC.map(r =>
      `[${r.item} / ${r.score}점]\n` + r.levels.map(l => `  ${l.level}: ${l.desc}`).join('\n')
    ).join('\n\n')
    await copyToClipboard(text)
    setCopiedRubric(true)
    setTimeout(() => setCopiedRubric(false), 2000)
  }

  const handleCopyFeedback = async () => {
    await copyToClipboard(FEEDBACK_PROMPT)
    setCopiedFeedback(true)
    setTimeout(() => setCopiedFeedback(false), 2000)
  }

  const total = RUBRIC.reduce((sum, r) => sum + r.score, 0)
  const checkedCount = Object.values(selfCheck).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl shadow-sm"><ClipboardList size={22} className="text-amber-700" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">평가 루브릭</h2>
            <p className="text-sm text-gray-500">팀 프로젝트 평가 기준표·자기평가 체크리스트·AI 피드백 프롬프트를 제공합니다.</p>
          </div>
        </div>
        <button onClick={handleCopyRubric} className="btn-secondary text-sm flex-shrink-0">
          {copiedRubric ? <><Check size={15} /> 복사됨!</> : <><Copy size={15} /> 루브릭 복사</>}
        </button>
      </div>

      <UsageGuide steps={USAGE_STEPS} tip="프로젝트 1주차에 루브릭을 학생들에게 공유하면 목표 지향적 학습이 가능합니다." />

      {/* 루브릭 요약 바 */}
      <div className="card !p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-700">총점 구성</span>
          <span className="font-bold text-blue-700">{total}점 만점</span>
        </div>
        <div className="flex gap-1 h-6 rounded-full overflow-hidden">
          {RUBRIC.map((r, i) => {
            const COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
            return (
              <div
                key={r.item}
                className={`${COLORS[i]} flex items-center justify-center text-white text-xs font-bold`}
                style={{ width: `${(r.score / total) * 100}%` }}
                title={`${r.item}: ${r.score}점`}
              >
                {r.score}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {RUBRIC.map((r, i) => {
            const COLORS = ['text-blue-600', 'text-indigo-600', 'text-purple-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600']
            return (
              <span key={r.item} className={`text-xs font-medium ${COLORS[i]}`}>
                {r.item} {r.score}점
              </span>
            )
          })}
        </div>
      </div>

      {/* 루브릭 상세 */}
      <div className="space-y-3">
        {RUBRIC.map(r => (
          <div key={r.item} className={`border rounded-2xl overflow-hidden ${r.color}`}>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className={`${r.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>{r.score}점</span>
              <span className="font-bold text-gray-800">{r.item}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-px bg-gray-200">
              {r.levels.map(l => (
                <div key={l.level} className="bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">{l.level}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{l.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 자기평가 체크리스트 */}
      <div className="card !p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-emerald-700 mb-0">✅ 학생용 자기평가 체크리스트</h3>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            checkedCount === SELF_CHECK.length ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {checkedCount}/{SELF_CHECK.length}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {SELF_CHECK.map((q, i) => (
            <label key={i} className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border transition-colors ${
              selfCheck[i] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
            }`}>
              <input
                type="checkbox"
                checked={!!selfCheck[i]}
                onChange={e => setSelfCheck(prev => ({ ...prev, [i]: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className={`text-xs leading-relaxed ${selfCheck[i] ? 'text-emerald-700' : 'text-gray-700'}`}>
                {q}
              </span>
            </label>
          ))}
        </div>
        {checkedCount === SELF_CHECK.length && (
          <div className="mt-4 bg-emerald-100 border border-emerald-300 rounded-xl p-3 text-center text-emerald-800 font-bold text-sm">
            🎉 모든 항목 완료! 제출 준비가 되었습니다.
          </div>
        )}
      </div>

      {/* 교수자 피드백 프롬프트 */}
      <div className="card !p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title text-blue-700 mb-0">📝 교수자 AI 피드백 생성 프롬프트</h3>
          <button onClick={handleCopyFeedback} className="btn-primary text-sm py-1.5">
            {copiedFeedback ? <><Check size={14} /> 복사됨!</> : <><Copy size={14} /> 복사</>}
          </button>
        </div>
        <div className="prompt-box text-xs">{FEEDBACK_PROMPT}</div>
        <p className="text-xs text-gray-500 mt-2">* ChatGPT 또는 Claude에 이 프롬프트를 붙여넣고, 팀 발표 내용을 함께 입력하면 루브릭 기반 피드백이 생성됩니다.</p>
      </div>
    </div>
  )
}
