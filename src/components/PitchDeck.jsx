import { useState } from 'react'
import CopyButton from './CopyButton'

const initialForm = {
  title: 'SilverCare: AI 기반 독거 노인 생활 지원 플랫폼',
  problem: '65세 이상 독거 노인의 사회적 고립과 응급 상황 대응 부재',
  solution: 'AI 스피커 + 앱 기반 정서 지원, 건강 모니터링, 응급 알림 서비스',
  customer: '65세 이상 독거 노인 및 부모를 걱정하는 40~50대 자녀',
  market: '국내 독거 노인 200만 명, 실버케어 시장 연 10% 성장',
  competitor: '기존 스마트홈 기기 (SKT·KT), 지자체 복지 서비스',
  revenue: '구독형 월정액 (2만원/월), 지자체 B2G 계약, 보험사 제휴',
  expected: '1년 내 시범 서비스 500명, 3년 내 손익분기점 달성',
  duration: '10분',
}

export default function PitchDeck() {
  const [form, setForm] = useState(initialForm)
  const [generated, setGenerated] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const prompts = {
    gamma: `다음 내용을 바탕으로 대학 경영학 팀 프로젝트 발표용 피치덱을 만들어 주세요.
발표 시간: ${form.duration}
슬라이드: 10장 구성

---
프로젝트 제목: ${form.title}
핵심 문제: ${form.problem}
해결 아이디어: ${form.solution}
목표 고객: ${form.customer}
시장 규모: ${form.market}
경쟁자: ${form.competitor}
수익모델: ${form.revenue}
기대효과: ${form.expected}
---

슬라이드 구성:
1. 표지 (프로젝트명, 팀명)
2. 문제 제기 (Why Now?)
3. 고객 분석 (페르소나 포함)
4. 해결 아이디어 및 핵심 기능
5. 비즈니스 모델
6. 시장 분석 및 TAM/SAM/SOM
7. 경쟁 분석 (경쟁 포지셔닝 맵)
8. 실행 전략 및 로드맵
9. 기대효과 및 사회적 가치
10. 결론 및 Q&A

디자인: 깔끔한 비즈니스 컨설팅 스타일, 밝은 배경, 아이콘 활용`,

    report: `다음 팀 프로젝트 내용을 바탕으로 경영학 보고서 형식으로 재구성해 주세요.

프로젝트: ${form.title}
문제: ${form.problem}
해결안: ${form.solution}
고객: ${form.customer}
시장: ${form.market}
경쟁자: ${form.competitor}
수익모델: ${form.revenue}
기대효과: ${form.expected}

보고서 구성:
1. 서론 (연구 배경 및 목적)
2. 문제 정의 (현황 분석, 문제의 심각성)
3. 이론적 배경 (관련 경영학 이론 2~3개 적용)
4. 고객 및 시장 분석
5. 제안 서비스·솔루션 상세
6. 비즈니스 모델 및 수익구조
7. 경쟁 분석
8. 실행 계획 및 기대효과
9. 한계점 및 향후 과제
10. 결론

학술 보고서 문체(3인칭)로 작성하고, 각 섹션은 200~300자 분량으로 작성해 주세요.`,

    script: `다음 피치덱 내용을 바탕으로 ${form.duration} 발표 대본을 작성해 주세요.
프로젝트: ${form.title}

발표 대본 요구사항:
- 슬라이드별 발표 시간 배분 (총 ${form.duration})
- 자연스러운 구어체 문장
- 강조 포인트와 전환 멘트 포함
- 청중의 집중을 유도하는 Hook 문장
- Q&A 예상 질문 5개와 모범 답변 포함
- 발표자 1명 기준으로 작성 (필요시 팀원 역할 분담 포함)`,

    summary: `다음 프로젝트 내용을 1페이지 요약 보고서로 정리해 주세요.

프로젝트: ${form.title}
문제: ${form.problem}
해결안: ${form.solution}
고객: ${form.customer}
수익모델: ${form.revenue}
기대효과: ${form.expected}

A4 1페이지 분량:
- 상단: 프로젝트명, 팀명, 날짜
- Executive Summary (3문장)
- 핵심 지표 (숫자로 표현)
- 차별화 포인트 3가지
- 다음 단계 액션 아이템
- 담당 교수님께 드리는 핵심 질문 2개`,
  }

  const fields = [
    { key: 'title', label: '프로젝트 제목', placeholder: '예: AI 기반 독거 노인 생활 지원 플랫폼' },
    { key: 'problem', label: '핵심 문제', placeholder: '예: 독거 노인의 사회적 고립 및 응급 대응 부재' },
    { key: 'solution', label: '해결 아이디어', placeholder: '예: AI 스피커 + 앱 기반 정서·건강 지원 서비스' },
    { key: 'customer', label: '목표 고객', placeholder: '예: 65세 이상 독거 노인 및 40~50대 자녀' },
    { key: 'market', label: '시장 규모', placeholder: '예: 국내 독거 노인 200만 명, 연 10% 성장' },
    { key: 'competitor', label: '주요 경쟁자', placeholder: '예: SKT 스마트홈, 지자체 복지 서비스' },
    { key: 'revenue', label: '수익모델', placeholder: '예: 월정액 구독, B2G 계약' },
    { key: 'expected', label: '기대효과', placeholder: '예: 1년 내 500명 시범, 3년 내 BEP' },
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">📑 피치덱·보고서 자동화</h2>
        <p className="text-sm text-slate-500 mb-5">프로젝트 정보를 입력하면 Gamma 피치덱, 보고서, 발표 대본, 1페이지 요약을 자동 생성합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.key === 'title' || f.key === 'problem' || f.key === 'solution' ? 'sm:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              <input className="input-field" value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="label">발표 시간</label>
            <select className="input-field" value={form.duration} onChange={e => handleChange('duration', e.target.value)}>
              {['5분', '7분', '10분', '12분', '15분', '20분'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5 w-full sm:w-auto">
          📑 자동화 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'gamma', icon: '🎨', label: 'Gamma', labelColor: 'bg-purple-100 text-purple-700', title: '피치덱 생성 프롬프트 (Gamma용)', prompt: prompts.gamma },
            { key: 'report', icon: '📄', label: '보고서', labelColor: 'bg-blue-100 text-blue-700', title: '경영학 보고서 프롬프트', prompt: prompts.report },
            { key: 'script', icon: '🎤', label: '발표 대본', labelColor: 'bg-green-100 text-green-700', title: '발표 대본 생성 프롬프트', prompt: prompts.script },
            { key: 'summary', icon: '📋', label: '1페이지 요약', labelColor: 'bg-orange-100 text-orange-700', title: '1페이지 요약 보고서 프롬프트', prompt: prompts.summary },
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

          {/* 평가 기준 연결 */}
          <div className="card bg-purple-50 border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3">🎯 발표 평가 체크리스트</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                '✅ 문제 정의가 명확하고 구체적인가?',
                '✅ 고객 분석이 데이터 기반인가?',
                '✅ 해결 방안이 실현 가능한가?',
                '✅ 비즈니스 모델이 수익을 낼 수 있는가?',
                '✅ 경쟁 분석이 객관적인가?',
                '✅ 발표 시간 내에 핵심을 전달하는가?',
                '✅ AI 활용 여부가 명시되었는가?',
                '✅ 팀원 역할 분담이 균형 잡혀 있는가?',
              ].map(item => (
                <div key={item} className="text-xs text-purple-700 flex items-start gap-1">{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
