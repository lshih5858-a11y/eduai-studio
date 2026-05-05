import { useState } from 'react'
import CopyButton from './CopyButton'

const agents = [
  {
    id: 'tutor',
    icon: '📖',
    title: 'AI 튜터 설계',
    purpose: '학생이 수업 주제, 모르는 개념, 과제 유형을 입력하면 개념 설명·사례·퀴즈·과제 방향을 안내',
    inputs: '수업 주제, 모르는 개념, 과제 유형',
    response: '개념 설명 → 실제 사례 → 퀴즈 3개 → 과제 작성 방향 → 참고 AI 도구',
    tools: 'Opal, Gemini, ChatGPT',
    opal: `경영학 수업용 AI 튜터 앱을 만들어 주세요.
학생이 수업 주제, 모르는 개념, 과제 유형을 입력하면 개념 설명, 사례, 퀴즈, 과제 작성 방향, 참고 AI 도구를 추천하는 구조로 설계해 주세요.
화면 구성: 입력 폼 → 개념 카드 → 사례 카드 → 퀴즈 영역 → 피드백 영역
디자인: 깔끔한 교육용 앱, 모바일 최적화`,
    gemini: `경영학 AI 튜터 역할을 맡아주세요.
학생: [수업 주제]에 대해 [모르는 개념]을 이해하고 싶어요.
당신의 역할:
1. 핵심 개념 설명 (초보자 눈높이, 비유 포함)
2. 실제 기업 사례 1~2개
3. 이해도 확인 퀴즈 3개 (O/X 또는 단답형)
4. 과제 작성 방향 (3가지 접근법)
5. 더 공부할 참고 자료 (AI 도구, 웹사이트, 논문)`,
    workflow: `트리거: 학생 입력 (주제, 개념, 과제 유형)
→ Step 1: GPT/Gemini로 개념 검색 및 설명 생성
→ Step 2: 웹 검색으로 최신 사례 조회
→ Step 3: 퀴즈 자동 생성
→ Step 4: 과제 템플릿 제공
→ 출력: 카드형 UI로 각 섹션 표시`,
  },
  {
    id: 'customer',
    icon: '🛎️',
    title: '고객 상담 시뮬레이션',
    purpose: '학생이 고객 불만·문의 시나리오를 선택하면 AI가 고객 역할을 하며 상담 응대 실습 제공',
    inputs: '상담 유형, 고객 감정 상태, 문제 상황',
    response: '고객 역할 응답 → 상담 평가 → 개선 포인트 → 모범 응대 스크립트',
    tools: 'ChatGPT, Gemini',
    opal: `고객 서비스 상담 시뮬레이션 앱을 만들어 주세요.
학생이 상담 유형(반품, 불만, 문의 등)과 고객 감정(화남, 당황, 불안)을 선택하면 AI가 고객 역할을 하는 실습 환경을 구성해 주세요.
상담 후 평가 점수, 개선 피드백, 모범 스크립트를 제공하는 기능 포함`,
    gemini: `당신은 [화가 난 / 실망한] 고객입니다. 다음 상황에서 고객 역할을 맡아주세요:
상황: [상담 상황 입력]
규칙:
- 처음에는 감정적으로 반응하고, 학생이 올바른 응대를 하면 점차 진정
- 비현실적 요구를 하며 응대 능력 테스트
- 상담 종료 후 학생의 응대에 1~5점 평가 및 피드백 제공`,
    workflow: `시나리오 선택 → 고객 역할 AI 활성화 → 대화 진행
→ 키워드 분석 (공감 표현, 해결책 제시 여부)
→ 상담 종료 → 점수 + 피드백 + 모범 스크립트 출력`,
  },
  {
    id: 'startup',
    icon: '🚀',
    title: '창업 아이디어 검증 에이전트',
    purpose: '학생의 창업 아이디어를 입력받아 시장성, 실현가능성, 경쟁 분석, 핵심 가설을 자동으로 검증',
    inputs: '아이디어 요약, 목표 고객, 수익모델',
    response: '시장성 평가 → SWOT → 경쟁 포지셔닝 → 핵심 가설 → 다음 스텝',
    tools: 'ChatGPT, Gemini, Perplexity',
    opal: `창업 아이디어 검증 앱을 만들어 주세요.
학생이 아이디어, 고객, 문제, 수익모델을 입력하면 자동으로 시장성 분석, SWOT, 경쟁 분석, 핵심 가설, 검증 방법을 출력하는 에이전트를 설계해 주세요.
단계: 입력 → 분석 카드 → 피드백 → 다음 액션`,
    gemini: `스타트업 멘토 역할로 다음 창업 아이디어를 검증해 주세요:
아이디어: [아이디어 입력]
고객: [고객 입력]
수익모델: [수익모델 입력]

검증 항목:
1. 시장 규모 추정 (TAM/SAM/SOM)
2. 경쟁 환경 분석 (직접/간접 경쟁자)
3. SWOT 분석
4. 핵심 성공 가설 3개
5. 검증을 위한 최소 실험(MVP) 방법 3가지`,
    workflow: `아이디어 입력 → Perplexity로 시장 데이터 검색
→ GPT로 SWOT, 경쟁 분석 생성
→ 핵심 가설 자동 도출
→ 검증 실험 설계 추천 → 결과 리포트 출력`,
  },
  {
    id: 'service',
    icon: '⚡',
    title: '서비스 실패·회복 에이전트',
    purpose: '서비스 실패 상황을 입력하면 원인 분석, 회복 전략, 고객 커뮤니케이션 방안을 자동 제안',
    inputs: '서비스 실패 유형, 고객 반응, 기업 규모',
    response: '실패 원인 분석 → 회복 전략 → 고객 사과문 → 재발 방지 방안',
    tools: 'ChatGPT, Gemini',
    opal: `서비스 회복 의사결정 훈련 앱을 설계해 주세요.
학생이 서비스 실패 상황(배송 지연, 품질 불량, 고객 응대 실수 등)을 선택하면 회복 전략 옵션을 제시하고, 선택에 따른 결과를 시뮬레이션하는 구조로 만들어 주세요.`,
    gemini: `서비스 마케팅 전문가로서 다음 서비스 실패 상황을 분석해 주세요:
상황: [실패 상황 입력]
고객 반응: [고객 반응 입력]

분석 내용:
1. 실패 원인 (직접/간접 원인)
2. 서비스 회복 역설(Service Recovery Paradox) 적용 가능성
3. 즉각적 회복 전략 3가지 (비용 수준별)
4. 고객 사과문 초안
5. 재발 방지를 위한 프로세스 개선 방안`,
    workflow: `실패 상황 입력 → 원인 분류 (프로세스/직원/시스템)
→ 회복 전략 DB 조회 → 옵션 3가지 제시
→ 학생 선택 → 결과 시뮬레이션
→ 최적 전략 해설 + 사례 제공`,
  },
  {
    id: 'marketing',
    icon: '📣',
    title: '마케팅 전략 코치',
    purpose: '제품/서비스 정보를 입력하면 STP 분석, 4P 전략, 디지털 마케팅 계획, 콘텐츠 전략을 자동 생성',
    inputs: '제품명, 목표 고객, 예산, 채널',
    response: 'STP → 4P → 디지털 채널 전략 → 콘텐츠 캘린더 → KPI',
    tools: 'ChatGPT, Gemini, Napkin',
    opal: `마케팅 전략 수립 도우미 앱을 만들어 주세요.
제품/서비스 정보, 목표 고객, 예산을 입력하면 STP 분석, 4P 전략, 디지털 마케팅 채널 추천, 30일 콘텐츠 계획, KPI 목표를 자동으로 생성하는 에이전트를 설계해 주세요.`,
    gemini: `마케팅 전략 전문가로서 다음 제품·서비스의 마케팅 전략을 수립해 주세요:
제품/서비스: [입력]
목표 고객: [입력]
예산: [입력]
채널: [입력]

전략 구성:
1. STP 분석 (Segmentation, Targeting, Positioning)
2. 4P 전략 (Product, Price, Place, Promotion)
3. 디지털 마케팅 채널별 전략
4. 30일 콘텐츠 캘린더
5. 핵심 KPI 5개 (측정 방법 포함)`,
    workflow: `제품 정보 입력 → 시장 세그먼트 분석
→ STP 자동 생성 → 4P 전략 도출
→ 채널별 예산 배분 추천
→ 콘텐츠 캘린더 출력 → KPI 대시보드`,
  },
  {
    id: 'finance',
    icon: '💰',
    title: '재무 의사결정 시뮬레이터',
    purpose: '가상의 기업 재무 상황을 설정하고 투자, 비용 절감, 가격 전략 의사결정을 시뮬레이션',
    inputs: '기업 유형, 재무 상황, 의사결정 옵션',
    response: '시나리오 분석 → 의사결정 결과 → 재무 지표 변화 → 최적 전략',
    tools: 'ChatGPT, Excel, Python',
    opal: `재무 의사결정 시뮬레이션 앱을 만들어 주세요.
학생이 가상 기업의 재무 상황(매출, 비용, 부채 등)을 입력하고 투자/절감/가격 전략을 선택하면, AI가 3년 후 재무 성과를 시뮬레이션하는 교육용 앱을 설계해 주세요.
비교 시나리오(낙관/기본/비관) 3가지를 동시에 표시하는 기능 포함.`,
    gemini: `CFO(최고재무책임자) 역할로 다음 재무 의사결정을 도와주세요:
기업 상황: [입력]
의사결정 과제: [입력]

분석:
1. 현재 재무 상태 진단 (주요 비율 계산)
2. 의사결정 옵션 3가지와 각각의 재무 영향
3. 시나리오별 손익 분기점 분석
4. 위험 요소와 완화 방안
5. 최적 의사결정 추천 및 근거`,
    workflow: `기업 데이터 입력 (매출, 비용, 자산)
→ 의사결정 옵션 선택
→ Excel/Python으로 시나리오 모델링
→ 3가지 시나리오 결과 출력
→ 권고 전략 + 리스크 분석 제공`,
  },
]

export default function AgentBuilder() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [activeTab, setActiveTab] = useState('opal')

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">🤖 AI 튜터·비즈니스 시뮬레이션 에이전트</h2>
        <p className="text-sm text-slate-500">Opal, Gemini, 노코드 툴을 활용하여 경영학 수업용 AI 에이전트를 설계할 수 있습니다.</p>
      </div>

      {/* 에이전트 선택 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedAgent.id === agent.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:shadow-sm'
            }`}
          >
            <div className="text-2xl mb-1">{agent.icon}</div>
            <div className="text-xs font-medium leading-tight">{agent.title.replace(' 에이전트', '').replace(' 설계', '')}</div>
          </button>
        ))}
      </div>

      {/* 선택된 에이전트 상세 */}
      <div className="card">
        <div className="flex items-start gap-3 mb-5">
          <span className="text-3xl">{selectedAgent.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{selectedAgent.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedAgent.purpose}</p>
          </div>
        </div>

        {/* 에이전트 스펙 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-bold text-slate-500 mb-1">📥 사용자 입력값</div>
            <div className="text-sm text-slate-700">{selectedAgent.inputs}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-bold text-slate-500 mb-1">📤 에이전트 응답 방식</div>
            <div className="text-sm text-slate-700">{selectedAgent.response}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 sm:col-span-2">
            <div className="text-xs font-bold text-slate-500 mb-1">🛠️ 추천 도구</div>
            <div className="text-sm text-slate-700">{selectedAgent.tools}</div>
          </div>
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
          {[
            { key: 'opal', label: '💎 Opal 프롬프트' },
            { key: 'gemini', label: '✨ Gemini 프롬프트' },
            { key: 'workflow', label: '🔄 노코드 워크플로우' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.key ? 'bg-white shadow text-indigo-700' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 프롬프트 내용 */}
        <div>
          <div className="flex justify-end mb-2">
            <CopyButton text={selectedAgent[activeTab]} label="프롬프트 복사" />
          </div>
          <pre className="prompt-box">{selectedAgent[activeTab]}</pre>
        </div>
      </div>

      {/* 향후 API 연동 안내 */}
      <div className="card bg-indigo-50 border border-indigo-200">
        <h4 className="font-bold text-indigo-800 mb-2">🔮 향후 API 연동 가능 (현재 프롬프트 방식)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🤖', title: 'Opal API', desc: '노코드 앱을 API로 연동하여 실시간 에이전트 실행' },
            { icon: '✨', title: 'Gemini API', desc: 'Google AI Studio를 통해 Gemini 에이전트 자동화' },
            { icon: '🧠', title: 'ChatGPT API', desc: 'OpenAI API로 커스텀 GPT 에이전트 직접 연결' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-sm font-bold text-indigo-800">{item.title}</div>
              <div className="text-xs text-indigo-600 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
        {/* 향후 API 연동 가능 */}
      </div>
    </div>
  )
}
