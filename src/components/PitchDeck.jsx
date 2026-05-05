import { useState } from 'react'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const SAMPLE = {
  title: 'SilverCare: AI 기반 독거 노인 생활 지원 플랫폼',
  problem: '65세 이상 독거 노인의 사회적 고립, 응급 상황 대응 부재, 복지 서비스 접근성 저하',
  solution: 'AI 스피커 + 앱 기반 정서 지원·건강 모니터링·응급 알림·맞춤형 복지 연계 서비스',
  customer: '65세 이상 독거 노인 / 이를 걱정하는 40~50대 자녀 / 지자체 복지 담당자',
  market: '국내 독거 노인 200만 명(2025), 시니어케어 시장 2조 원, 연 10% 성장',
  competitor: 'SKT AI 스피커·KT 시니어폰·지자체 방문 서비스 (AI 통합 미흡)',
  revenue: '월 구독형 2만 원/월 (B2C) + 지자체 B2G 계약 + 보험사 제휴 수수료',
  expected: '1년 시범 500명·NPS 50↑ / 3년 BEP 달성 / 5년 동남아 확장',
  duration: '10분',
}

const fields = [
  { key: 'title',    label: '프로젝트 제목', span: true,  placeholder: '예: AI 기반 독거 노인 생활 지원 플랫폼' },
  { key: 'problem',  label: '핵심 문제',     span: true,  placeholder: '예: 독거 노인의 고립·응급 대응 부재' },
  { key: 'solution', label: '해결 아이디어', span: true,  placeholder: '예: AI 스피커+앱 기반 정서·건강 서비스' },
  { key: 'customer', label: '목표 고객',     span: false, placeholder: '예: 65세 이상 독거 노인, 40~50대 자녀' },
  { key: 'market',   label: '시장 규모',     span: false, placeholder: '예: 시니어케어 시장 2조 원, 연 10% 성장' },
  { key: 'competitor',label: '주요 경쟁자', span: false, placeholder: '예: SKT 스마트홈, 지자체 복지 서비스' },
  { key: 'revenue',  label: '수익모델',      span: false, placeholder: '예: 월정액 구독, B2G 계약' },
  { key: 'expected', label: '기대효과',      span: true,  placeholder: '예: 1년 내 500명 시범, 3년 내 BEP' },
]

export default function PitchDeck() {
  const [form, setForm] = useState(SAMPLE)
  const [generated, setGenerated] = useState(false)

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const prompts = {
    gamma: `다음 내용으로 대학 경영학 팀 프로젝트 발표용 피치덱을 만들어 주세요.
발표 시간: ${form.duration} / 슬라이드: 10장

━━ 프로젝트 정보 ━━
제목: ${form.title}
문제: ${form.problem}
솔루션: ${form.solution}
고객: ${form.customer}
시장: ${form.market}
경쟁: ${form.competitor}
수익: ${form.revenue}
기대효과: ${form.expected}
━━━━━━━━━━━━━━

슬라이드 구성:
1. 표지 (프로젝트명·팀명·날짜)
2. 문제 제기 (Why Now? 데이터 포함)
3. 고객 분석 (페르소나 카드)
4. 솔루션 및 핵심 기능
5. 비즈니스 모델 (수익 구조)
6. 시장 분석 (TAM·SAM·SOM)
7. 경쟁 분석 (포지셔닝 맵)
8. 실행 전략 및 로드맵
9. 기대효과 및 사회적 가치
10. 결론 및 Q&A

디자인: 깔끔한 컨설팅 스타일, 밝은 배경, 아이콘 활용, 데이터 시각화 강조`,

    report: `다음 팀 프로젝트를 경영학 학술 보고서 형식으로 재구성해 주세요.

프로젝트: ${form.title}
문제: ${form.problem} / 솔루션: ${form.solution}
고객: ${form.customer} / 시장: ${form.market}
수익: ${form.revenue} / 기대효과: ${form.expected}

보고서 구성 (각 섹션 300~500자):
1. 서론 (연구 배경·목적·필요성)
2. 문제 정의 (현황 분석·문제의 심각성·통계)
3. 이론적 배경 (관련 경영학 이론 2~3개 적용)
4. 고객 및 시장 분석 (페르소나·시장 규모)
5. 제안 서비스·솔루션 상세 (기능·차별점)
6. 비즈니스 모델 및 수익구조
7. 경쟁 분석 (경쟁 우위 포함)
8. 실행 계획 및 기대효과
9. 한계점 및 향후 과제
10. 결론
학술 보고서 문체(3인칭·수동태)로 작성해 주세요.`,

    script: `다음 피치덱 내용의 ${form.duration} 발표 대본을 작성해 주세요.
프로젝트: ${form.title}

대본 요구사항:
- 슬라이드별 발표 시간 배분 (총 ${form.duration})
- 자연스러운 구어체 (학술 발표용)
- 각 슬라이드 전환 멘트 포함
- 청중 집중 유도 Hook 문장 (도입부)
- 핵심 메시지 3회 반복 구조
- 예상 Q&A 5개 + 모범 답변 포함
- 발표자 교체 지점 표시 (${form.duration === '10분' ? '2' : '3'}명 기준)`,

    summary: `다음 프로젝트를 A4 1페이지 요약 보고서로 정리해 주세요.

프로젝트: ${form.title}
문제: ${form.problem} / 솔루션: ${form.solution}
고객: ${form.customer} / 수익: ${form.revenue}
기대효과: ${form.expected}

구성:
- 상단: 프로젝트명·팀명·날짜·담당 교수
- Executive Summary (3문장, 핵심만)
- 핵심 지표 (숫자 3~5개로 임팩트 표현)
- 차별화 포인트 3가지 (경쟁과의 비교)
- 다음 단계 액션 아이템 3개
- 교수자에게 드리는 핵심 피드백 요청 2개`,
  }

  const checklist = [
    '문제 정의가 데이터로 뒷받침되는가?', '고객 분석이 페르소나와 함께 제시되는가?',
    '해결 방안이 실현 가능하고 차별적인가?', 'BMC 9개 블록이 완성되어 있는가?',
    '경쟁 분석이 객관적이고 포지셔닝이 명확한가?', `${form.duration} 발표 시간에 맞게 구성되었는가?`,
    'AI 활용 여부가 명시되었는가?', '팀원 역할 분담이 균형적인가?',
  ]

  return (
    <div className="space-y-5">

      <GuideBox
        mode="both"
        steps={['프로젝트 정보 입력', 'Gamma 프롬프트 복사', 'Gamma에서 피치덱 자동 생성', '보고서·대본 프롬프트 활용', '교수자 제출']}
        tip="Gamma(gamma.app)에 피치덱 프롬프트를 붙여 넣으면 10장 슬라이드가 자동으로 생성됩니다. 생성 후 Gamma 에디터에서 디자인과 내용을 수정하세요."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0">📑</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">피치덱·보고서 자동화</h2>
            <p className="text-xs text-slate-500">프로젝트 정보 입력 → Gamma 피치덱·보고서·대본·1페이지 요약 프롬프트 생성</p>
          </div>
          <button
            onClick={() => setForm(SAMPLE)}
            className="ml-auto text-xs text-slate-400 hover:text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
          >
            📋 샘플 불러오기
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              <input className="input-field" value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="label">발표 시간</label>
            <select className="input-field" value={form.duration} onChange={e => update('duration', e.target.value)}>
              {['5분', '7분', '10분', '12분', '15분', '20분'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5">
          📑 자동화 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'gamma',   icon: '🎨', badge: 'Gamma',      badgeColor: 'bg-purple-100 text-purple-800', title: '피치덱 생성 프롬프트' },
            { key: 'report',  icon: '📄', badge: '보고서',      badgeColor: 'bg-blue-100 text-blue-800',    title: '경영학 보고서 프롬프트' },
            { key: 'script',  icon: '🎤', badge: '발표 대본',   badgeColor: 'bg-green-100 text-green-800',  title: '발표 대본 생성 프롬프트' },
            { key: 'summary', icon: '📋', badge: '1페이지 요약', badgeColor: 'bg-orange-100 text-orange-800', title: '1페이지 요약 보고서 프롬프트' },
          ].map(({ key, icon, badge, badgeColor, title }) => (
            <div key={key} className="card">
              <div className="prompt-header">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span>{icon}</span>
                  <span className={`badge ${badgeColor}`}>{badge}</span>
                  {title}
                </h3>
                <CopyButton text={prompts[key]} label="복사" />
              </div>
              <pre className="prompt-box">{prompts[key]}</pre>
            </div>
          ))}

          <div className="card bg-purple-50 border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3 text-sm">🎯 발표 평가 체크리스트</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-purple-600 shrink-0" />
                  <span className="text-xs text-purple-700 group-hover:text-purple-900">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
