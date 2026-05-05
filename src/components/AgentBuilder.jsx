import { useState } from 'react'
import { Bot, ChevronDown, ChevronRight } from 'lucide-react'
import PromptCard from './PromptCard'

const AGENTS = [
  {
    id: 'tutor',
    label: 'A. AI 튜터 설계',
    emoji: '🎓',
    purpose: '학생이 경영학 개념, 과제, 시험을 AI로 학습할 수 있도록 돕는 튜터',
    inputs: '수업 주제, 모르는 개념, 과제 유형, 학습 목표',
    response: '개념 설명, 사례, 퀴즈 3문제, 과제 작성 방향, 참고 AI 도구 추천',
    tools: 'Opal, Gamma, ChatGPT Custom GPT',
    opal: `경영학 수업용 AI 튜터 앱을 만들어 주세요. 학생이 수업 주제, 모르는 개념, 과제 유형을 입력하면 ① 핵심 개념 설명(3문장), ② 실제 기업 사례 2개, ③ 퀴즈 3문제, ④ 과제 작성 방향, ⑤ 추천 AI 도구를 출력하는 앱을 설계해 주세요. 화면은 입력 폼, 결과 카드 4개, 퀴즈 영역, 피드백 버튼으로 구성해 주세요. 디자인은 대학생이 선호하는 깔끔한 스타일로 해 주세요.`,
    gemini: `You are an expert business management tutor. When a student inputs: (1) course topic, (2) confusing concept, (3) assignment type - respond with: a clear 3-sentence explanation, 2 real company examples with lessons, 3 quiz questions with answers, step-by-step assignment guidance, and 3 recommended AI tools. Use Korean. Keep responses concise and student-friendly.`,
    workflow: '입력 폼 → GPT/Gemini API 호출 → 결과 카드 4개 출력 → 퀴즈 인터랙션 → 피드백 저장',
  },
  {
    id: 'customer',
    label: 'B. 고객 상담 시뮬레이션',
    emoji: '💬',
    purpose: '학생이 가상 고객 컴플레인 상황을 체험하고 서비스 회복 전략을 연습',
    inputs: '산업 유형, 고객 불만 유형, 난이도 선택 (초급/중급/고급)',
    response: '가상 고객 시나리오, 고객 대화 흐름, 모범 답변, 서비스 회복 전략 평가',
    tools: 'Opal, ChatGPT, Claude',
    opal: `고객 서비스 시뮬레이션 앱을 만들어 주세요. 학생이 산업(카페/항공/쇼핑몰/병원 등)과 고객 불만 유형을 선택하면, AI가 화난 고객 역할을 하며 대화를 진행합니다. 학생의 응대 방식에 따라 고객 만족도가 변하고, 대화 종료 후 서비스 회복 전략 점수와 피드백을 제공합니다. SERVQUAL 모델 기반으로 평가해 주세요.`,
    gemini: `You are an angry customer simulation agent. Based on the selected industry and complaint type, roleplay as a frustrated customer. After the student responds, evaluate their service recovery using SERVQUAL dimensions (Reliability, Assurance, Tangibles, Empathy, Responsiveness) and provide detailed feedback in Korean.`,
    workflow: '산업·난이도 선택 → 고객 역할 AI 대화 → 학생 응대 입력 → SERVQUAL 평가 → 피드백 카드 출력',
  },
  {
    id: 'startup',
    label: 'C. 창업 아이디어 검증 에이전트',
    emoji: '🚀',
    purpose: '학생의 창업 아이디어를 체계적으로 검증하고 개선 방향을 제시',
    inputs: '아이디어 설명, 목표 고객, 시장 규모 추정, 경쟁자',
    response: 'SWOT 분석, 고객 가설 3개, MVP 아이디어, 검증 방법, 투자자 질문 5개',
    tools: 'ChatGPT, Gemini, Perplexity',
    opal: `창업 아이디어 검증 에이전트를 만들어 주세요. 학생이 아이디어를 입력하면 ① SWOT 분석, ② 고객 가설 3개, ③ 린 캔버스 초안, ④ 가장 위험한 가설, ⑤ MVP 설계안, ⑥ 예상 투자자 질문 5개를 출력합니다. Y Combinator 방식의 직설적인 피드백 스타일로 작성해 주세요.`,
    gemini: `Act as a startup mentor with Y Combinator experience. Evaluate the student's business idea with: 1) Honest SWOT analysis, 2) 3 customer hypotheses to validate, 3) Lean Canvas outline, 4) The riskiest assumption, 5) MVP recommendation, 6) 5 tough investor questions. Be direct and constructive. Respond in Korean.`,
    workflow: '아이디어 입력 → SWOT 자동 생성 → 린 캔버스 → 가설 검증 방법 → 투자자 Q&A 준비',
  },
  {
    id: 'service',
    label: 'D. 서비스 실패·회복 에이전트',
    emoji: '🔧',
    purpose: '서비스 실패 시나리오를 분석하고 최적의 회복 전략을 학습',
    inputs: '서비스 실패 유형, 고객 반응, 기업 대응 방식',
    response: '실패 원인 분석, 회복 전략 3가지, 예방 방안, 서비스 청사진 개선안',
    tools: 'ChatGPT, Notion AI',
    opal: `서비스 실패·회복 학습 에이전트를 설계해 주세요. 학생이 서비스 실패 사례(예: 배달 지연, 품질 불량, 직원 무례)를 입력하면 ① 실패 원인 분석(인적/시스템/프로세스), ② 즉각적 회복 전략, ③ 장기적 재발 방지 방안, ④ 유사 기업 사례 2개, ⑤ 수정된 서비스 청사진을 출력합니다.`,
    gemini: `You are a service quality expert specializing in service recovery. Analyze the given service failure scenario using the Service Recovery Paradox theory and Justice Theory (distributive, procedural, interactional). Provide recovery strategies ranked by effectiveness. Include real company examples. Respond in Korean with structured output.`,
    workflow: '실패 시나리오 입력 → 원인 분류 → 회복 전략 랭킹 → 서비스 청사진 개선 → 교훈 정리',
  },
  {
    id: 'marketing',
    label: 'E. 마케팅 전략 코치',
    emoji: '📣',
    purpose: '학생 팀의 마케팅 전략을 체계적으로 수립하고 최적화',
    inputs: '제품/서비스, 목표 고객, 예산, 채널 우선순위',
    response: 'STP 분석, 4P 전략, 콘텐츠 캘린더, KPI 설정, 경쟁 포지셔닝 맵',
    tools: 'ChatGPT, Gemini, Canva AI',
    opal: `마케팅 전략 코치 앱을 만들어 주세요. 제품/서비스, 타겟 고객, 예산을 입력하면 ① STP 분석, ② 4P 전략 상세, ③ 4주 콘텐츠 캘린더, ④ 채널별 KPI, ⑤ 경쟁자 대비 포지셔닝 맵, ⑥ 초저예산 마케팅 아이디어 5개를 출력합니다. 각 전략에는 예상 효과와 비용을 포함해 주세요.`,
    gemini: `You are a CMO-level marketing strategist. Create a comprehensive marketing strategy including STP analysis, 4P framework, content calendar for 4 weeks, channel-specific KPIs, and positioning map. Focus on digital marketing and cost-effectiveness for student startups. Respond in Korean with actionable recommendations.`,
    workflow: '제품·예산 입력 → STP 분석 → 4P 전략 → 콘텐츠 캘린더 생성 → KPI 대시보드',
  },
  {
    id: 'finance',
    label: 'F. 재무 의사결정 시뮬레이터',
    emoji: '💰',
    purpose: '가상 기업의 재무 시나리오에서 의사결정을 연습하고 결과를 시뮬레이션',
    inputs: '기업 규모, 재무 상황, 의사결정 옵션 선택',
    response: '재무 지표 변화, 리스크 분석, 최적 전략, 손익분기점 분석',
    tools: 'ChatGPT, Excel, Google Colab',
    opal: `재무 의사결정 시뮬레이터를 만들어 주세요. 학생이 가상 기업(연매출, 비용구조, 부채비율)을 설정하고 ① 신규 투자, ② 인력 감축, ③ 가격 인상, ④ 차입 확대 중 하나를 선택하면 3년간 재무 지표 변화(매출, 영업이익률, ROE, 현금흐름)를 시뮬레이션하고 시각화합니다. 각 시나리오의 리스크 레벨도 표시해 주세요.`,
    gemini: `You are a CFO simulator. Given a virtual company's financial situation, simulate the financial impact of different strategic decisions over 3 years. Show changes in revenue, operating margin, ROE, and cash flow. Include risk assessment (Low/Medium/High) and break-even analysis. Present results in a table format. Respond in Korean.`,
    workflow: '기업 재무 설정 → 의사결정 옵션 선택 → 3년 시뮬레이션 → 차트 시각화 → 전략 권고',
  },
]

export default function AgentBuilder() {
  const [expanded, setExpanded] = useState('tutor')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-xl"><Bot size={22} className="text-indigo-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">AI 튜터·비즈니스 시뮬레이션 에이전트</h2>
          <p className="text-sm text-gray-500">Opal, Gemini, 노코드 툴을 활용한 AI 에이전트 설계 프롬프트를 제공합니다.</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        <p className="font-bold mb-1">🔧 에이전트 제작 도구 안내</p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs mt-2">
          <div className="bg-white rounded-lg p-2 border border-indigo-100">
            <p className="font-semibold">Opal</p>
            <p className="text-indigo-600">노코드 AI 앱 빌더. 입력 폼 + AI 응답 구조 설계에 최적</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-indigo-100">
            <p className="font-semibold">Gemini (System Prompt)</p>
            <p className="text-indigo-600">역할 기반 AI 에이전트 설계. Google AI Studio에서 테스트</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-indigo-100">
            <p className="font-semibold">Custom GPT</p>
            <p className="text-indigo-600">ChatGPT Plus에서 맞춤 GPT 생성. 수업 전용 챗봇 제작</p>
          </div>
        </div>
      </div>

      {/* 에이전트 아코디언 */}
      <div className="space-y-3">
        {AGENTS.map(agent => (
          <div key={agent.id} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="font-bold text-gray-800">{agent.label}</p>
                  <p className="text-xs text-gray-500">{agent.purpose}</p>
                </div>
              </div>
              {expanded === agent.id
                ? <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                : <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
              }
            </button>

            {expanded === agent.id && (
              <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
                {/* 에이전트 정보 */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">사용자 입력값</p>
                    <p className="text-gray-700">{agent.inputs}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">에이전트 응답 방식</p>
                    <p className="text-gray-700">{agent.response}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 sm:col-span-2">
                    <p className="text-xs font-semibold text-blue-600 mb-1">노코드 워크플로우</p>
                    <p className="text-blue-800 text-xs font-mono">{agent.workflow}</p>
                  </div>
                </div>

                <PromptCard title="🔵 Opal 앱 제작용 프롬프트" prompt={agent.opal} color="indigo" />
                <PromptCard title="✨ Gemini System Prompt" prompt={agent.gemini} color="blue" />

                {/* 추천 도구 */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-semibold">추천 도구:</span>
                  {agent.tools.split(', ').map(t => (
                    <span key={t} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
