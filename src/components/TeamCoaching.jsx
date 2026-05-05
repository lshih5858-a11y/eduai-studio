import { useState } from 'react'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const stages = ['주제 선정', '자료 조사', '아이디어 도출', '분석', '발표자료 제작', '리허설']
const feedbackTypes = ['논리성', '창의성', '실현가능성', '발표력', '자료 구성', '팀워크']

const SAMPLE = {
  stage: '아이디어 도출',
  difficulty: '아이디어가 너무 많고 방향이 정해지지 않았습니다. 어떤 아이디어가 실현 가능한지 판단하기 어렵습니다.',
  roles: '팀장(기획), 조사 담당 2명, 발표 담당, AI 활용 담당',
  deadline: '3주 후 (12월 15일)',
  feedbackType: ['논리성', '실현가능성'],
}

export default function TeamCoaching() {
  const [form, setForm] = useState(SAMPLE)
  const [generated, setGenerated] = useState(false)

  const update = (patch) => setForm(prev => ({ ...prev, ...patch }))
  const toggleFeedback = (f) => update({ feedbackType: form.feedbackType.includes(f) ? form.feedbackType.filter(x => x !== f) : [...form.feedbackType, f] })
  const feedbackStr = form.feedbackType.join(', ')

  const prompts = {
    coaching: `우리 팀은 현재 [${form.stage}] 단계에 있습니다.
어려운 점: ${form.difficulty}
팀원 역할: ${form.roles}
제출 마감: ${form.deadline}
원하는 피드백: ${feedbackStr}

경영학 교수자 관점에서 다음을 포함하여 피드백해 주세요:
1. ${feedbackStr} 측면 현재 수준 진단 (5점 척도)
2. 각 측면별 구체적 개선 방향 (사례 포함)
3. 다음 단계 진입을 위한 실행 과제 5개 (우선순위 포함)
4. [${form.stage}] 단계에서 팀들이 자주 하는 실수와 예방법
5. 유사 성공 프로젝트 사례 1~2개 소개`,

    meeting: `경영학 팀 프로젝트 회의를 위한 구조화된 질문 목록 (총 45분 기준)
현재 단계: ${form.stage} / 어려운 점: ${form.difficulty}

1. 회의 시작 Check-in 질문 (5분)
   - 이번 주 각 팀원 기여도 자기 평가 (1~5점)
   - 이번 회의에서 꼭 해결해야 할 것은?

2. 현재 상황 점검 (10분)
   - 지난 회의 실행 과제 완료 여부
   - 새롭게 발견한 문제나 기회

3. 핵심 논의 (20분)
   - ${form.difficulty}를 해결하기 위한 구체적 방안은?
   - 우리 아이디어의 가장 큰 위험 요소는 무엇인가?
   - 교수자 피드백을 어떻게 반영할 것인가?

4. 역할·과제 확인 (10분)
   - 다음 회의까지 각 팀원 할 일 (이름 + 과제 + 마감)
   - 다음 회의 일정 및 아젠다 결정`,

    tasks: `다음 팀의 우선순위별 실행 과제를 제안해 주세요.
현재 단계: ${form.stage} / 어려운 점: ${form.difficulty}
마감: ${form.deadline}

📌 오늘 당장 (24시간 이내, 각 팀원 단독 가능)
→ 구체적인 행동 동사로 3가지 + AI 도구 활용법 포함

📅 이번 주 내 (7일, 팀 협업 필요)
→ 구체적인 행동 동사로 3가지 + 협업 방법 포함

📆 다음 주까지 (14일, 완성해야 할 산출물)
→ 구체적인 결과물 3가지 + 교수자 제출 여부 포함

⚠️ 주의: 각 과제에 완료 확인 방법도 포함해 주세요.`,

    checklist: `경영학 팀 프로젝트 최종 발표 점검표를 만들어 주세요.
마감: ${form.deadline} / 팀 구성: ${form.roles}

□ 내용 완성도 체크 (10항목)
□ 발표 자료 품질 체크 (8항목)
□ 팀원 역할 준비 체크 (5항목)
□ AI 활용 적절성 체크 (5항목)
   - AI 활용 여부 명시 여부
   - AI 결과 검토·수정 여부
   - 출처 표기 여부
□ 교수자 예상 질문 10개 + 모범 답변

각 항목은 □ 체크박스 형식으로 작성해 주세요.`,

    conflict: `경영학 팀 프로젝트 팀 갈등 해결 가이드를 작성해 주세요.
상황: ${form.difficulty}
팀 구성: ${form.roles}

1. 갈등 근본 원인 분석 (역할·목표·소통 문제 구분)
2. 건설적 대화를 위한 프레임워크 (NVC 대화법 기반)
3. 역할 재조정 방안 (구체적 재분배안 포함)
4. 팀 분위기 회복 활동 2가지
5. 앞으로의 팀 규칙 5가지 (의사결정·마감·소통 기준)`,

    feedback: `경영학 팀 프로젝트 발표 리허설 피드백 프롬프트입니다.

[여기에 팀의 발표 스크립트 또는 슬라이드 내용 요약을 붙여 넣으세요]

다음 기준으로 10점 만점 평가 + 개선 방향:
1. 논리 구조 (도입→전개→결론 흐름)
2. 핵심 메시지 명확성
3. 데이터·근거 적절성
4. 시각 자료 완성도
5. 예상 발표 시간 내 완료 가능성
6. Q&A 대비 수준

최종: 발표 전 반드시 고쳐야 할 3가지 + 잘한 점 3가지`,
  }

  const feedbackRequest = `"교수님, 저희 팀은 현재 ${form.stage} 단계에 있습니다. ${form.difficulty} 부분에서 어려움을 겪고 있는데, ${feedbackStr} 측면에서 방향 조언을 부탁드립니다. 가능하시면 이번 주 중 10분 정도 면담을 요청드려도 될까요?"`

  return (
    <div className="space-y-5">

      <GuideBox
        mode="student"
        steps={['현재 단계 선택', '어려운 점 입력', '코칭 프롬프트 실행', 'AI 피드백 팀 공유', '다음 과제 실행']}
        tip="막막할 때 AI 코칭 프롬프트를 ChatGPT에 실행하면, 경험 많은 교수자 시각의 피드백을 즉시 받을 수 있습니다. 교수자 면담 전 예습 자료로도 활용하세요."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl shrink-0">🤝</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">팀 프로젝트 코칭 에이전트</h2>
            <p className="text-xs text-slate-500">진행 상황 입력 → AI 코칭·회의 질문·실행 과제·점검표 생성</p>
          </div>
          <button
            onClick={() => setForm(SAMPLE)}
            className="ml-auto text-xs text-slate-400 hover:text-pink-600 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
          >
            📋 샘플 불러오기
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">현재 단계</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {stages.map(s => (
                <button key={s} onClick={() => update({ stage: s })}
                  className={`chip ${form.stage === s ? 'bg-pink-600 text-white border-pink-600' : 'chip-inactive'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">어려운 점 / 막히는 부분</label>
            <textarea className="input-field min-h-[80px] resize-y" value={form.difficulty} onChange={e => update({ difficulty: e.target.value })} placeholder="예: 아이디어가 너무 많아 방향을 못 잡고 있습니다" />
          </div>
          <div>
            <label className="label">팀원 역할</label>
            <input className="input-field" value={form.roles} onChange={e => update({ roles: e.target.value })} placeholder="예: 팀장, 조사 담당, 발표 담당" />
          </div>
          <div>
            <label className="label">제출 마감일</label>
            <input className="input-field" value={form.deadline} onChange={e => update({ deadline: e.target.value })} placeholder="예: 2주 후, 12월 15일" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 피드백 유형 (복수 선택)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {feedbackTypes.map(f => (
                <button key={f} onClick={() => toggleFeedback(f)}
                  className={`chip ${form.feedbackType.includes(f) ? 'bg-indigo-600 text-white border-indigo-600' : 'chip-inactive'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5">
          🤝 코칭 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'coaching',  icon: '🎯', badge: 'AI 코칭',    badgeColor: 'bg-pink-100 text-pink-800' },
            { key: 'meeting',   icon: '💬', badge: '팀 회의',    badgeColor: 'bg-blue-100 text-blue-800' },
            { key: 'tasks',     icon: '📌', badge: '실행 과제',  badgeColor: 'bg-emerald-100 text-emerald-800' },
            { key: 'checklist', icon: '✅', badge: '발표 점검표', badgeColor: 'bg-orange-100 text-orange-800' },
            { key: 'conflict',  icon: '🕊️', badge: '갈등 조정',  badgeColor: 'bg-yellow-100 text-yellow-800' },
            { key: 'feedback',  icon: '🎤', badge: '리허설',     badgeColor: 'bg-purple-100 text-purple-800' },
          ].map(({ key, icon, badge, badgeColor }) => (
            <div key={key} className="card">
              <div className="prompt-header">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span>{icon}</span>
                  <span className={`badge ${badgeColor}`}>{badge}</span>
                  {badge} 프롬프트
                </h3>
                <CopyButton text={prompts[key]} label="복사" />
              </div>
              <pre className="prompt-box">{prompts[key]}</pre>
            </div>
          ))}

          <div className="card bg-indigo-50 border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-3 text-sm">👨‍🏫 교수자 피드백 요청 문장</h4>
            <div className="bg-white rounded-xl p-4 border border-indigo-200">
              <p className="text-sm text-slate-700 italic leading-relaxed">"{feedbackRequest}"</p>
            </div>
            <CopyButton text={feedbackRequest} label="문장 복사" className="mt-3" />
          </div>
        </div>
      )}
    </div>
  )
}
