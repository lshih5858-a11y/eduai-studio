import { useState } from 'react'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const agents = [
  {
    id: 'tutor', icon: '📖', title: 'AI 튜터 설계',
    purpose: '학생이 수업 주제·개념·과제 유형을 입력하면 개념 설명·사례·퀴즈·과제 방향을 안내',
    inputs: '수업 주제, 모르는 개념, 과제 유형',
    response: '개념 설명 → 실제 사례 → 퀴즈 3개 → 과제 작성 방향 → 참고 AI 도구',
    tools: 'Opal, Gemini, ChatGPT',
    sample: '학생: "블루오션 전략을 설명해 주세요"\n→ AI: 핵심 개념 → 삼성·넷플릭스 사례 → 퀴즈 3개 → 보고서 작성 방향 제시',
    opal: `경영학 수업용 AI 튜터 앱을 만들어 주세요.

학생이 수업 주제, 모르는 개념, 과제 유형을 입력하면
개념 설명, 기업 사례, 퀴즈, 과제 작성 방향, 참고 AI 도구를 안내하는 구조로 설계해 주세요.

화면 구성:
- 입력 폼 (주제·개념·과제 유형 3개 필드)
- 개념 설명 카드 (비유·예시 포함)
- 사례 카드 (국내·글로벌 각 1개)
- 퀴즈 영역 (O/X 3개, 정답 확인 버튼)
- 피드백 영역 (과제 방향 3가지)
디자인: 깔끔한 교육용 앱, 모바일 최적화, 한국어`,

    gemini: `경영학 AI 튜터 역할을 맡아주세요.
학생 입력: "[수업 주제]에 대해 [모르는 개념]을 이해하고 싶어요."

응답 구조:
1. 핵심 개념 설명 (초보자 눈높이, 비유 2개 포함)
2. 실제 기업 사례 (국내 1개·글로벌 1개, 구체적 수치 포함)
3. 이해도 확인 퀴즈 3개 (O/X, 정답·해설 포함)
4. 과제 작성 방향 3가지 접근법
5. 더 공부할 자료 (AI 도구 2개·추천 키워드·논문 검색어)`,

    workflow: `[트리거] 학생 입력 (주제 + 개념 + 과제 유형)
→ [Step 1] GPT/Gemini로 개념 설명 생성
→ [Step 2] 웹 검색으로 최신 국내외 사례 조회
→ [Step 3] 퀴즈 자동 생성 (O/X 3개)
→ [Step 4] 과제 접근법 3가지 제안
→ [출력] 카드형 UI (개념·사례·퀴즈·과제·도구)
→ [피드백] 학생 퀴즈 결과 → 추가 설명 제공`,
  },
  {
    id: 'customer', icon: '🛎️', title: '고객 상담 시뮬레이션',
    purpose: '고객 불만·문의 시나리오를 선택하면 AI가 고객 역할을 하며 상담 응대 실습 제공',
    inputs: '상담 유형, 고객 감정 상태, 문제 상황',
    response: '고객 역할 응답 → 상담 평가 → 개선 포인트 → 모범 응대 스크립트',
    tools: 'ChatGPT, Gemini',
    sample: '상황: 배송 지연 고객 → AI가 화난 고객 역할 → 학생 응대 → 점수·피드백·모범 스크립트',
    opal: `고객 서비스 상담 시뮬레이션 앱을 만들어 주세요.

학생이 상담 유형(반품·불만·문의)과 고객 감정(화남·당황·불안)을 선택하면
AI가 고객 역할을 하는 실습 환경을 구성해 주세요.

기능:
- 시나리오 선택 드롭다운 (10가지)
- 실시간 대화 인터페이스
- 응대 힌트 버튼 (선택 시 -1점)
- 상담 종료 후: 평가 점수(10점), 피드백, 모범 스크립트
디자인: 채팅 앱 스타일, 고객/상담원 구분 말풍선`,

    gemini: `당신은 [배송 지연으로 화가 난] 고객입니다. 다음 상황에서 고객 역할을 맡아주세요.
상황: [학생이 입력한 상황]

역할 수행 규칙:
- 처음에는 감정적으로 반응 (공감 표현 없으면 계속 화남)
- 학생이 공감 + 해결책을 제시하면 점차 진정
- 비현실적 요구도 포함하여 난이도 조절
- 상담 종료 후: 1~5점 평가 + 잘한 점·아쉬운 점 + 모범 응대 스크립트 제공`,

    workflow: `[시나리오 선택] 유형 + 감정 선택
→ [AI 활성화] 고객 역할 GPT 설정
→ [대화 진행] 학생 응대 텍스트 입력
→ [키워드 분석] 공감 표현·해결책 감지
→ [종료] 학생 요청 or 3회 응대 완료
→ [평가] 10점 채점 + 피드백 + 모범 스크립트 출력`,
  },
  {
    id: 'startup', icon: '🚀', title: '창업 아이디어 검증',
    purpose: '창업 아이디어를 입력받아 시장성·실현가능성·경쟁 분석·핵심 가설을 자동 검증',
    inputs: '아이디어 요약, 목표 고객, 수익모델',
    response: '시장성 평가 → SWOT → 경쟁 포지셔닝 → 핵심 가설 → 다음 스텝',
    tools: 'ChatGPT, Gemini, Perplexity',
    sample: '아이디어: "시니어케어 앱" → TAM/SAM/SOM → SWOT → 핵심 가설 3개 → MVP 실험 방법',
    opal: `창업 아이디어 검증 앱을 만들어 주세요.

학생이 아이디어·고객·문제·수익모델을 입력하면
시장성 분석, SWOT, 경쟁 분석, 핵심 가설, 검증 방법을 자동 출력하는 에이전트를 설계해 주세요.

화면: 입력 폼 → 분석 카드 4개 → 피드백 → 다음 액션 버튼
카드: TAM/SAM/SOM · SWOT · 경쟁 포지셔닝 · 핵심 가설`,

    gemini: `스타트업 멘토 역할로 다음 창업 아이디어를 검증해 주세요.
아이디어: [입력] / 고객: [입력] / 수익모델: [입력]

검증 항목:
1. 시장 규모 (TAM·SAM·SOM 추정, 출처 포함)
2. 경쟁 환경 (직접·간접 경쟁자 분석)
3. SWOT 분석 (각 2~3개 항목)
4. 핵심 성공 가설 3개 (고객·솔루션·수익 가설)
5. 최소 검증 실험(MVP) 방법 3가지 (2주 이내 가능한 것)
6. 투자자가 가장 우려할 리스크 3가지`,

    workflow: `[입력] 아이디어 + 고객 + 수익모델
→ [Perplexity] 시장 규모 데이터 검색
→ [GPT] SWOT + 경쟁 분석 생성
→ [Gemini] 최신 유사 사례 탐색
→ [종합] 핵심 가설 + MVP 실험 설계
→ [출력] 검증 리포트 (PDF 다운로드)`,
  },
  {
    id: 'service', icon: '⚡', title: '서비스 실패·회복',
    purpose: '서비스 실패 상황을 입력하면 원인 분석·회복 전략·고객 커뮤니케이션 방안 자동 제안',
    inputs: '서비스 실패 유형, 고객 반응, 기업 규모',
    response: '실패 원인 분석 → 회복 전략 → 사과문 초안 → 재발 방지',
    tools: 'ChatGPT, Gemini',
    sample: '상황: 항공사 지연 → 서비스 회복 역설 설명 → 보상 전략 3가지 → 사과문 작성',
    opal: `서비스 회복 의사결정 훈련 앱을 설계해 주세요.

학생이 서비스 실패 상황(배송 지연·품질 불량·응대 실수)을 선택하면
회복 전략 3가지를 제시하고, 선택에 따른 고객 반응 결과를 시뮬레이션하는 구조.

기능:
- 시나리오 선택 (10가지 실패 상황)
- 전략 3가지 선택 (비용·시간 다른 옵션)
- 선택 결과 → 고객 NPS 변화 시각화
- 정답 해설 + 서비스 마케팅 이론 연결`,

    gemini: `서비스 마케팅 전문가로 다음 서비스 실패 상황을 분석해 주세요.
상황: [입력] / 고객 반응: [입력]

분석:
1. 실패 원인 (직접·간접·시스템 문제 구분)
2. 서비스 회복 역설(Service Recovery Paradox) 적용 가능성
3. 즉각적 회복 전략 3가지 (저비용·중비용·고비용 옵션)
4. 고객 사과문 초안 (3문단)
5. 재발 방지를 위한 프로세스 개선 방안 3가지
6. 이 사례를 수업 사례로 만드는 방법`,

    workflow: `[입력] 실패 유형 + 고객 반응 + 기업 규모
→ [분류] 실패 원인 (프로세스·직원·시스템)
→ [DB 조회] 유사 기업 회복 사례
→ [GPT] 전략 3가지 생성
→ [선택] 학생이 전략 선택
→ [시뮬레이션] 고객 반응 결과 표시
→ [해설] 최적 전략 + 이론 연결 + 사례`,
  },
  {
    id: 'marketing', icon: '📣', title: '마케팅 전략 코치',
    purpose: '제품·서비스 정보를 입력하면 STP·4P·디지털 마케팅·콘텐츠 전략 자동 생성',
    inputs: '제품명, 목표 고객, 예산, 채널',
    response: 'STP → 4P → 디지털 채널 전략 → 콘텐츠 캘린더 → KPI',
    tools: 'ChatGPT, Gemini, Napkin',
    sample: '제품: "헬스케어 앱" → STP 분석 → 4P 전략 → SNS 콘텐츠 30일 캘린더 → KPI 5개',
    opal: `마케팅 전략 수립 도우미 앱을 만들어 주세요.

제품·서비스·고객·예산을 입력하면
STP 분석, 4P 전략, 채널별 전략, 30일 콘텐츠 계획, KPI를 자동 생성하는 에이전트.

화면: 입력 탭 → 전략 카드 → 캘린더 뷰 → KPI 대시보드
내보내기: PDF·PPT 형식 지원`,

    gemini: `마케팅 전략 전문가로 다음 제품의 전략을 수립해 주세요.
제품: [입력] / 고객: [입력] / 예산: [입력] / 채널: [입력]

전략:
1. STP 분석 (Segmentation 3개·Targeting 근거·Positioning 맵)
2. 4P 전략 (각 3~5개 실행 방안)
3. 디지털 채널별 전략 (Instagram·YouTube·블로그·카카오)
4. 30일 콘텐츠 캘린더 (주 3회 기준, 주제·형식·목적 포함)
5. KPI 5개 (측정 방법·목표치·측정 주기 포함)`,

    workflow: `[입력] 제품 + 고객 + 예산 + 채널
→ [STP] 시장 세분화 + 타겟 선정 + 포지셔닝
→ [4P] 전략 초안 자동 생성
→ [채널 매칭] 예산·고객에 맞는 채널 추천
→ [콘텐츠] 30일 캘린더 자동 생성
→ [KPI] 측정 기준 + 대시보드 설계`,
  },
  {
    id: 'finance', icon: '💰', title: '재무 의사결정 시뮬레이터',
    purpose: '가상 기업 재무 상황을 설정하고 투자·비용 절감·가격 전략 의사결정을 시뮬레이션',
    inputs: '기업 유형, 재무 상황, 의사결정 옵션',
    response: '시나리오 분석 → 의사결정 결과 → 재무 지표 변화 → 최적 전략',
    tools: 'ChatGPT, Excel, Python',
    sample: '가상 카페 창업: 가격 전략 선택 → 손익분기 계산 → 3시나리오 비교 → 최적 전략',
    opal: `재무 의사결정 시뮬레이션 앱을 만들어 주세요.

학생이 가상 기업의 재무 상황을 입력하고
투자·절감·가격 전략을 선택하면 3년 후 재무 성과를 시뮬레이션.

기능:
- 기업 기본 정보 입력 (매출·비용·자산)
- 의사결정 3가지 중 선택
- 낙관·기본·비관 시나리오 결과 차트 비교
- 손익분기점 자동 계산
- 재무 전문가 코멘트 자동 생성`,

    gemini: `CFO 역할로 다음 재무 의사결정을 도와주세요.
기업 상황: [입력] / 의사결정 과제: [입력]

분석:
1. 현재 재무 상태 진단 (유동비율·부채비율·ROE 계산)
2. 의사결정 옵션 3가지와 재무 영향 (수치 포함)
3. 낙관·기본·비관 시나리오별 3년 손익 예측
4. 손익분기점(BEP) 분석
5. 위험 요소 3가지와 완화 방안
6. 최적 의사결정 추천 및 근거`,

    workflow: `[입력] 매출·비용·자산 데이터
→ [자동 계산] 핵심 재무 비율 (Excel/Python)
→ [의사결정 선택] 3가지 옵션 제시
→ [시나리오 모델링] 낙관·기본·비관 3개
→ [차트] 3년 손익 예측 시각화
→ [권고] 최적 전략 + 리스크 분석`,
  },
]

export default function AgentBuilder() {
  const [selected, setSelected] = useState(agents[0])
  const [tab, setTab] = useState('opal')

  return (
    <div className="space-y-5">

      <GuideBox
        mode="professor"
        steps={['에이전트 유형 선택', 'Opal·Gemini 프롬프트 복사', '노코드 툴에서 앱 제작', '수업 중 학생과 함께 실행', '결과 공유·평가']}
        tip="Opal 프롬프트를 opal.dev에 붙여 넣으면 노코드로 AI 에이전트 앱을 즉시 제작할 수 있습니다. 제작된 앱 링크를 링크 관리 메뉴에 등록해 수업 중 공유하세요."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl shrink-0">🤖</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">AI 튜터·비즈니스 시뮬레이션 에이전트</h2>
            <p className="text-xs text-slate-500">Opal·Gemini·노코드 툴 기반 경영학 수업용 AI 에이전트 설계 가이드</p>
          </div>
        </div>

        {/* 에이전트 선택 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent)}
              className={`p-3 rounded-2xl border-2 text-center transition-all active:scale-95 ${
                selected.id === agent.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="text-2xl mb-1">{agent.icon}</div>
              <div className="text-xs font-semibold leading-tight">
                {agent.title.split(' ').slice(0, 2).join(' ')}
              </div>
            </button>
          ))}
        </div>

        {/* 선택된 에이전트 상세 */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">{selected.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">{selected.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{selected.purpose}</p>
            </div>
          </div>

          {/* 스펙 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: '📥 사용자 입력', value: selected.inputs },
              { label: '📤 응답 방식', value: selected.response },
              { label: '🛠️ 추천 도구', value: selected.tools },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="text-xs font-bold text-slate-400 mb-1">{item.label}</div>
                <div className="text-xs text-slate-700 leading-relaxed">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 시연 예시 */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-3 mb-5">
            <p className="text-xs font-bold text-indigo-600 mb-1">📺 수업 시연 예시</p>
            <p className="text-xs text-indigo-800 leading-relaxed">{selected.sample}</p>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 bg-slate-200 p-1 rounded-xl mb-4">
            {[
              { key: 'opal', label: '💎 Opal 프롬프트' },
              { key: 'gemini', label: '✨ Gemini 프롬프트' },
              { key: 'workflow', label: '🔄 노코드 워크플로우' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.key ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="prompt-header">
            <span className="text-xs text-slate-500 font-medium">프롬프트 내용</span>
            <CopyButton text={selected[tab]} label="프롬프트 복사" />
          </div>
          <pre className="prompt-box">{selected[tab]}</pre>
        </div>
      </div>

      {/* 향후 API 연동 */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
          <span>🔮</span> 향후 API 연동 확장 가능 (현재: 프롬프트 방식)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '💎', title: 'Opal API', desc: '노코드 앱을 API로 연동하여 실시간 에이전트 실행' },
            { icon: '✨', title: 'Gemini API', desc: 'Google AI Studio를 통해 에이전트 자동화' },
            { icon: '🧠', title: 'OpenAI API', desc: 'Custom GPT 에이전트와 직접 연결' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl p-3 border border-indigo-100">
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
