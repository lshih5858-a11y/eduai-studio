import { useState } from 'react'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const rubricData = [
  {
    category: '문제 정의 명확성', weight: 20, icon: '🎯', color: 'blue',
    criteria: [
      { level: '우수 (18–20점)', tag: '우수', desc: '문제가 데이터·사례로 뒷받침되며 고객 관점에서 구체적으로 정의됨. HMW 형식 등 구조화된 방법 활용.' },
      { level: '보통 (12–17점)', tag: '보통', desc: '문제를 인식하고 있으나 근거가 다소 부족하거나 범위가 불명확함.' },
      { level: '미흡 (0–11점)',  tag: '미흡', desc: '문제 정의가 모호하거나 경영학적 관점이 결여됨.' },
    ]
  },
  {
    category: '경영학 이론 적용', weight: 20, icon: '📖', color: 'purple',
    criteria: [
      { level: '우수 (18–20점)', tag: '우수', desc: 'STP·SWOT·BMC·5Forces 등 이론을 정확히 적용하고 프로젝트와 유기적으로 연결.' },
      { level: '보통 (12–17점)', tag: '보통', desc: '이론을 언급하나 적용이 피상적이거나 프로젝트와 연결이 약함.' },
      { level: '미흡 (0–11점)',  tag: '미흡', desc: '이론 적용이 없거나 잘못 적용됨.' },
    ]
  },
  {
    category: 'AI 도구 활용 적절성', weight: 20, icon: '🤖', color: 'emerald',
    criteria: [
      { level: '우수 (18–20점)', tag: '우수', desc: 'AI 도구를 목적에 맞게 선택하고 결과를 비판적으로 검토하여 활용. AI 활용 과정 투명하게 명시.' },
      { level: '보통 (12–17점)', tag: '보통', desc: 'AI를 활용하였으나 무비판적으로 사용하거나 활용 방식이 불명확함.' },
      { level: '미흡 (0–11점)',  tag: '미흡', desc: 'AI 미활용 또는 표절성 사용 (AI 결과 그대로 제출).' },
    ]
  },
  {
    category: '데이터·사례 분석력', weight: 15, icon: '📊', color: 'orange',
    criteria: [
      { level: '우수 (13–15점)', tag: '우수', desc: '신뢰할 수 있는 데이터·사례를 수집하여 통계적 방법으로 분석, 결과 해석이 정확함.' },
      { level: '보통 (8–12점)',  tag: '보통', desc: '데이터·사례를 제시하나 분석 방법이 단순하거나 해석이 미흡함.' },
      { level: '미흡 (0–7점)',   tag: '미흡', desc: '데이터 없이 주관적 주장만 제시하거나 사례 근거 부족.' },
    ]
  },
  {
    category: '발표자료 완성도', weight: 15, icon: '📑', color: 'pink',
    criteria: [
      { level: '우수 (13–15점)', tag: '우수', desc: '구조가 명확하고, 시각화가 효과적이며, 발표 흐름이 자연스러움. Gamma·Napkin 활용 고품질 자료.' },
      { level: '보통 (8–12점)',  tag: '보통', desc: '발표 자료는 있으나 구성이 불균형하거나 시각적 완성도가 낮음.' },
      { level: '미흡 (0–7점)',   tag: '미흡', desc: '발표 자료 미흡, 오류 다수, 시간 초과 또는 미달.' },
    ]
  },
  {
    category: '팀 협업 및 성찰', weight: 10, icon: '🤝', color: 'indigo',
    criteria: [
      { level: '우수 (9–10점)', tag: '우수', desc: '역할 분담 균형적, 팀원 모두 발표 기여. 성찰 문장이 구체적이고 학습 내용 반영.' },
      { level: '보통 (5–8점)',  tag: '보통', desc: '팀 협업은 이루어졌으나 기여도 불균형 또는 성찰이 형식적.' },
      { level: '미흡 (0–4점)',  tag: '미흡', desc: '팀 협업 흔적이 없거나 성찰 미제출.' },
    ]
  },
]

const colorMap = {
  blue:    { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100', badge: 'bg-blue-100 text-blue-800', good: 'bg-blue-50 border-blue-200' },
  purple:  { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100', badge: 'bg-purple-100 text-purple-800', good: 'bg-purple-50 border-purple-200' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-800', good: 'bg-emerald-50 border-emerald-200' },
  orange:  { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-100', badge: 'bg-orange-100 text-orange-800', good: 'bg-orange-50 border-orange-200' },
  pink:    { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100', badge: 'bg-pink-100 text-pink-800', good: 'bg-pink-50 border-pink-200' },
  indigo:  { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100', badge: 'bg-indigo-100 text-indigo-800', good: 'bg-indigo-50 border-indigo-200' },
}

const selfCheckItems = [
  '우리 팀의 문제 정의는 데이터와 사례로 뒷받침되는가?',
  '경영학 이론을 최소 2개 이상 프로젝트에 적용하였는가?',
  'AI 도구 활용 방식과 사용한 AI 결과물을 보고서에 명시하였는가?',
  'AI 생성 내용을 그대로 제출하지 않고 검토·수정하였는가?',
  '신뢰할 수 있는 데이터(설문·통계·논문)를 분석에 활용하였는가?',
  '발표 자료는 정해진 발표 시간에 맞게 구성되었는가?',
  '팀원 모두 발표에 공정하게 기여하였는가?',
  '성찰 문장에 이번 프로젝트 배운 점을 구체적으로 작성하였는가?',
  '참고 자료 출처(AI 포함)를 모두 명시하였는가?',
  '교수자 피드백을 최종본에 반영하였는가?',
]

export default function Rubric() {
  const [projectName, setProjectName] = useState('SilverCare: AI 기반 독거 노인 생활 지원 플랫폼')
  const [teamName, setTeamName] = useState('헬스케어 혁신 팀 (A조)')
  const [scores, setScores] = useState({})

  const setScore = (category, score) => setScores(prev => ({ ...prev, [category]: score }))
  const totalScore = Object.values(scores).reduce((s, v) => s + Number(v), 0)

  const rubricText = rubricData.map(r =>
    `[${r.category} - ${r.weight}점]\n` + r.criteria.map(c => `  ${c.level}: ${c.desc}`).join('\n')
  ).join('\n\n')

  const feedbackPrompt = `경영학 팀 프로젝트 평가 피드백을 작성해 주세요.
팀명: ${teamName}
프로젝트: ${projectName}

[항목별 점수 입력]
- 문제 정의 명확성 (20점): ${scores['문제 정의 명확성'] || '_'}/20
- 경영학 이론 적용 (20점): ${scores['경영학 이론 적용'] || '_'}/20
- AI 도구 활용 적절성 (20점): ${scores['AI 도구 활용 적절성'] || '_'}/20
- 데이터·사례 분석력 (15점): ${scores['데이터·사례 분석력'] || '_'}/15
- 발표자료 완성도 (15점): ${scores['발표자료 완성도'] || '_'}/15
- 팀 협업 및 성찰 (10점): ${scores['팀 협업 및 성찰'] || '_'}/10

위 점수를 기반으로:
1. 잘한 점 3가지 (구체적 내용 포함)
2. 개선이 필요한 점 2가지 (건설적 제안 포함)
3. AI 활용 측면의 특이 사항
4. 향후 학습 방향 제안
5. 격려 메시지 1문장
교수자 피드백 문체(존댓말, 건설적 톤)로 작성해 주세요.`

  return (
    <div className="space-y-5">

      <GuideBox
        mode="professor"
        steps={['1주차에 루브릭 공개', 'AI 도구 활용 기준 안내', '중간·최종 발표 평가 적용', '피드백 프롬프트 실행', '학생 자기평가 제출 요구']}
        tip="1주차 첫 수업에서 이 루브릭을 빔프로젝터로 보여 주세요. 특히 'AI 도구 활용 적절성' 항목을 강조하여 AI 결과를 검토 없이 제출하는 행위를 사전에 예방하세요."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">✅</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">평가 루브릭</h2>
            <p className="text-xs text-slate-500">경영학 팀 프로젝트 평가 기준 — 1주차에 학생들에게 공개하여 목표 지향적 학습 유도</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="label">프로젝트명</label>
            <input className="input-field" value={projectName} onChange={e => setProjectName(e.target.value)} />
          </div>
          <div>
            <label className="label">팀명</label>
            <input className="input-field" value={teamName} onChange={e => setTeamName(e.target.value)} />
          </div>
        </div>

        {/* 총점 요약 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {rubricData.map(r => (
            <div key={r.category} className={`text-center p-3 rounded-2xl border ${colorMap[r.color].border} ${colorMap[r.color].bg}`}>
              <div className="text-xl mb-1">{r.icon}</div>
              <div className="text-xs font-bold text-slate-600 leading-tight" style={{ fontSize: '0.65rem' }}>
                {r.category}
              </div>
              <div className={`text-lg font-black mt-1 ${colorMap[r.color].badge.split(' ')[1]}`}>{r.weight}점</div>
            </div>
          ))}
        </div>

        {totalScore > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">{teamName} 합산 점수</p>
              <p className="text-xs text-blue-200 mt-0.5">{projectName}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black">{totalScore}</p>
              <p className="text-blue-200 text-sm">/ 100점</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <CopyButton text={rubricText} label="루브릭 전체 복사" />
        </div>
      </div>

      {/* 루브릭 상세 */}
      <div className="space-y-4">
        {rubricData.map(r => {
          const c = colorMap[r.color]
          return (
            <div key={r.category} className={`card border ${c.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center text-xl`}>{r.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-800">{r.category}</h3>
                    <p className="text-xs text-slate-500">배점 {r.weight}점</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">점수 입력:</label>
                  <input
                    type="number"
                    min="0" max={r.weight}
                    value={scores[r.category] || ''}
                    onChange={e => setScore(r.category, e.target.value)}
                    className="w-16 input-field text-center py-1.5 text-sm font-bold"
                    placeholder={`/${r.weight}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {r.criteria.map((c2, i) => (
                  <div key={i} className={`rounded-xl p-3 border ${
                    i === 0 ? `${c.good}` : i === 1 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                      i === 0 ? 'bg-white text-slate-700' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-red-200 text-red-700'
                    }`}>
                      {i === 0 ? '✨' : i === 1 ? '📝' : '⚠️'} {c2.tag}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">{c2.level}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{c2.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* 자기평가 체크리스트 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0 text-base">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm shrink-0">📋</span>
            학생용 자기평가 체크리스트
          </h3>
          <CopyButton text={selfCheckItems.map((item, i) => `${i + 1}. □ ${item}`).join('\n')} label="체크리스트 복사" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {selfCheckItems.map((item, i) => (
            <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group border border-transparent hover:border-slate-200 transition-all">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0" />
              <span className="text-sm text-slate-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 피드백 프롬프트 */}
      <div className="card">
        <div className="prompt-header">
          <h3 className="section-title mb-0 text-base">
            <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm shrink-0">👨‍🏫</span>
            교수자 피드백 생성 프롬프트
          </h3>
          <CopyButton text={feedbackPrompt} label="프롬프트 복사" />
        </div>
        <pre className="prompt-box">{feedbackPrompt}</pre>
        <p className="text-xs text-slate-400 mt-3">
          ※ 위 프롬프트를 ChatGPT에 붙여 넣고 각 항목의 점수를 채우면 팀별 피드백 문장을 자동 생성합니다.
        </p>
      </div>
    </div>
  )
}
