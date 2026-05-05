import { useState } from 'react'
import CopyButton from './CopyButton'

const stages = ['주제 선정', '자료 조사', '아이디어 도출', '분석', '발표자료 제작', '리허설']
const feedbackTypes = ['논리성', '창의성', '실현가능성', '발표력', '자료 구성', '팀워크']

export default function TeamCoaching() {
  const [stage, setStage] = useState('아이디어 도출')
  const [difficulty, setDifficulty] = useState('아이디어가 너무 막연하고 시장성이 불분명합니다')
  const [roles, setRoles] = useState('팀장, 조사 담당, 기획 담당, 발표 담당, AI 활용 담당')
  const [deadline, setDeadline] = useState('3주 후')
  const [feedbackType, setFeedbackType] = useState(['논리성', '실현가능성'])
  const [generated, setGenerated] = useState(false)

  const toggleFeedback = (f) => {
    setFeedbackType(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const feedbackStr = feedbackType.join(', ')

  const prompts = {
    coaching: `우리 팀은 현재 [${stage}] 단계에 있습니다.
어려운 점: ${difficulty}
팀원 역할: ${roles}
제출 마감: ${deadline}
원하는 피드백: ${feedbackStr}

경영학 교수자의 관점에서 우리 프로젝트를 다음 기준으로 피드백해 주세요:
1. ${feedbackStr} 측면에서의 현재 수준 진단
2. 각 측면별 개선 방향 (구체적 조언 포함)
3. 다음 단계로 넘어가기 위한 실행 과제 5개
4. 현재 단계에서 자주 하는 실수와 예방법
5. 유사 성공 프로젝트 사례 1~2개 소개`,

    meeting: `경영학 팀 프로젝트 회의를 위한 구조화된 질문 목록을 만들어 주세요.
현재 단계: ${stage}
어려운 점: ${difficulty}

다음을 포함해 주세요:
1. 회의 시작 Check-in 질문 (5분)
2. 현재 상황 점검 질문 (10분)
3. 문제 해결을 위한 핵심 논의 질문 3개 (20분)
4. 역할 분담 확인 질문 (5분)
5. 다음 회의까지 각 팀원 실행 과제 확인
회의 시간: 45분 기준으로 타임 배분도 포함해 주세요.`,

    tasks: `다음 상황의 경영학 팀에게 우선순위별 실행 과제를 제안해 주세요.
현재 단계: ${stage}
어려운 점: ${difficulty}
마감: ${deadline}

제안 형식:
📌 오늘 당장 (24시간 이내)
📅 이번 주 내 (7일 이내)
📆 다음 주까지 (14일 이내)
각 기간별로 3~5개 과제를 구체적인 행동 동사로 작성해 주세요.
AI 도구 활용 방법도 각 과제에 포함해 주세요.`,

    checklist: `경영학 팀 프로젝트 최종 발표 전 점검표를 만들어 주세요.
발표까지 남은 기간: ${deadline}
팀 구성: ${roles}

점검표 구성:
1. 내용 완성도 체크 (10항목)
2. 발표 자료 품질 체크 (8항목)
3. 팀원 역할 준비 상태 (5항목)
4. AI 활용 적절성 (5항목)
5. 교수자 예상 질문 대비 (10개)
각 항목은 □ 체크박스 형식으로 작성해 주세요.`,

    conflict: `경영학 팀 프로젝트에서 발생한 팀 갈등 상황을 해결하는 방법을 제안해 주세요.
상황: ${difficulty}
팀 구성: ${roles}

갈등 해결 가이드:
1. 갈등의 근본 원인 분석
2. 건설적 대화를 위한 프레임워크
3. 역할 재조정 방안
4. 팀 분위기 회복 활동
5. 앞으로 갈등을 예방하는 팀 규칙 5개 제안`,

    feedback: `경영학 팀 프로젝트 발표 리허설 피드백 프롬프트입니다.
[여기에 팀의 발표 스크립트 또는 발표 내용 요약을 붙여 넣어 주세요]

다음 기준으로 피드백해 주세요:
1. 논리 구조 (도입→전개→결론 흐름)
2. 핵심 메시지 명확성
3. 데이터·근거 적절성
4. 발표 시간 배분
5. Q&A 대비 수준
각 항목별 점수(10점 만점)와 개선 방향을 구체적으로 제시해 주세요.`,
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">🤝 팀 프로젝트 코칭 에이전트</h2>
        <p className="text-sm text-slate-500 mb-5">팀 진행 상황을 입력하면 AI 코칭 프롬프트, 회의 질문, 실행 과제, 발표 점검표를 생성합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">현재 단계</label>
            <div className="flex flex-wrap gap-2">
              {stages.map(s => (
                <button key={s} onClick={() => setStage(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    stage === s ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-600 border-slate-300 hover:border-pink-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">어려운 점 / 막히는 부분</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              placeholder="예: 아이디어가 너무 많아 방향을 못 잡고 있습니다"
            />
          </div>
          <div>
            <label className="label">팀원 역할</label>
            <input className="input-field" value={roles} onChange={e => setRoles(e.target.value)} placeholder="예: 팀장, 조사 담당, 발표 담당" />
          </div>
          <div>
            <label className="label">제출 마감일</label>
            <input className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="예: 2주 후, 12월 15일" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 피드백 유형 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {feedbackTypes.map(f => (
                <button key={f} onClick={() => toggleFeedback(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    feedbackType.includes(f) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5 w-full sm:w-auto">
          🤝 코칭 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'coaching', icon: '🎯', label: 'AI 코칭', labelColor: 'bg-pink-100 text-pink-700', title: 'AI 코칭 프롬프트', prompt: prompts.coaching },
            { key: 'meeting', icon: '💬', label: '팀 회의', labelColor: 'bg-blue-100 text-blue-700', title: '팀 회의 질문 생성', prompt: prompts.meeting },
            { key: 'tasks', icon: '📌', label: '실행 과제', labelColor: 'bg-emerald-100 text-emerald-700', title: '다음 실행 과제 목록', prompt: prompts.tasks },
            { key: 'checklist', icon: '✅', label: '발표 점검표', labelColor: 'bg-orange-100 text-orange-700', title: '발표 전 점검표', prompt: prompts.checklist },
            { key: 'conflict', icon: '🕊️', label: '갈등 조정', labelColor: 'bg-yellow-100 text-yellow-800', title: '팀 갈등 조정 프롬프트', prompt: prompts.conflict },
            { key: 'feedback', icon: '🎤', label: '리허설 피드백', labelColor: 'bg-purple-100 text-purple-700', title: '발표 리허설 피드백 프롬프트', prompt: prompts.feedback },
          ].map(({ key, icon, label, labelColor, title, prompt }) => (
            <div key={key} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{icon}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${labelColor}`}>{label}</span>
                  {title}
                </h3>
                <CopyButton text={prompt} label="복사" />
              </div>
              <pre className="prompt-box">{prompt}</pre>
            </div>
          ))}

          {/* 교수자 피드백 요청 문장 */}
          <div className="card bg-indigo-50 border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-3">👨‍🏫 교수자 피드백 요청 문장 예시</h4>
            <div className="space-y-2">
              {[
                `"교수님, 저희 팀은 현재 ${stage} 단계에 있습니다. ${difficulty} 부분에서 어려움을 겪고 있는데, ${feedbackStr} 측면에서 방향 조언을 부탁드립니다."`,
                `"교수님, 다음 주 ${deadline}까지 [제출물]을 완성해야 하는데, 저희 접근 방법이 올바른지 10분 정도 피드백을 받을 수 있을까요?"`,
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-indigo-200">
                  <p className="text-sm text-indigo-700 italic">{s}</p>
                  <CopyButton text={s} label="복사" className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
