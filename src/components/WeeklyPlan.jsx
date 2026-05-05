import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const weeklyData = [
  {
    week: 1, topic: '생성형 AI와 경영학 개요', content: 'AI 도구 소개, 프롬프트 엔지니어링 기초, AI 윤리',
    ai: 'ChatGPT 기초 실습', tools: 'ChatGPT, Claude',
    output: 'AI 활용 윤리 체크리스트', outputDetail: '① AI 도구별 이용약관 정리표 ② 수업 AI 활용 서약서 ③ 프롬프트 기초 연습장',
    type: 'intro'
  },
  {
    week: 2, topic: '기업 사례 분석', content: '사례 분석 프레임워크(5W1H·SWOT), AI 기반 사례 수집',
    ai: 'Gemini·Perplexity로 사례 탐색·검증', tools: 'Gemini, Perplexity',
    output: '사례 분석 카드', outputDetail: '① 기업 개요 1장 ② SWOT 분석표 ③ 수업 시사점 3가지 ④ 출처 목록',
    type: 'research'
  },
  {
    week: 3, topic: '고객 문제 정의', content: 'HMW 방법론, 고객 페르소나, 공감 지도',
    ai: 'AI 인터뷰 질문·페르소나 생성', tools: 'ChatGPT, Napkin',
    output: '문제정의 맵', outputDetail: '① HMW 문장 3개 ② 페르소나 카드 2개 ③ 공감지도 초안 ④ 조사 설계 방향',
    type: 'research'
  },
  {
    week: 4, topic: '시장·경쟁 분석', content: 'PEST 분석, 포터의 5Forces, 경쟁 포지셔닝',
    ai: 'AI 경쟁사 분석·시장 데이터 수집', tools: 'Gemini, Felo',
    output: '경쟁 분석표', outputDetail: '① PEST 분석표 ② 5Forces 다이어그램 ③ 경쟁 포지셔닝 맵 ④ 시장 규모 추정',
    type: 'analysis'
  },
  {
    week: 5, topic: '프로젝트 아이디어 생성', content: 'SCAMPER·브레인스토밍·아이디어 평가 기준',
    ai: 'GPT로 아이디어 발산·수렴', tools: 'ChatGPT, Gamma',
    output: '아이디어 후보표', outputDetail: '① 주제 후보 5개 표 ② 평가 기준 스코어카드 ③ 선정 아이디어 1개 요약 ④ 팀원 합의서',
    type: 'ideation'
  },
  {
    week: 6, topic: '비즈니스 모델 설계', content: '비즈니스 모델 캔버스(BMC), 가치 제안 캔버스, 수익모델',
    ai: 'AI BMC 초안 작성·수익모델 생성', tools: 'ChatGPT, Napkin',
    output: '비즈니스 모델 캔버스', outputDetail: '① 완성된 BMC (9블록) ② 가치 제안 캔버스 ③ 수익모델 3가지 비교 ④ Napkin 시각화',
    type: 'planning'
  },
  {
    week: 7, topic: '설문·인터뷰 설계', content: '정성·정량 조사 설계, Likert 척도, 표본 추출',
    ai: 'AI 설문 문항 생성·사전 검토', tools: 'ChatGPT, Genspark',
    output: '조사 설계서', outputDetail: '① 설문지 (20문항 이상) ② 인터뷰 가이드 (10질문) ③ 표본 수·방법 계획 ④ 조사 일정표',
    type: 'research'
  },
  {
    week: 8, topic: '중간 발표', content: '피치덱 구성, 발표 기술, Q&A 대응, 동료 피드백',
    ai: 'Gamma로 피치덱 제작', tools: 'Gamma, ChatGPT',
    output: '중간 피치덱', outputDetail: '① Gamma 피치덱 10장 ② 발표 대본 ③ 동료 피드백 수렴 표 ④ 교수자 피드백 반영 계획',
    type: 'presentation', highlight: true
  },
  {
    week: 9, topic: '데이터 분석 기초', content: '기술통계, 상관분석, 회귀분석, 데이터 시각화',
    ai: 'GPT·Colab으로 Python·Excel 코드 생성', tools: 'ChatGPT, Python, Excel',
    output: '분석 결과표', outputDetail: '① 설문 데이터 정제 결과 ② 기술통계 요약표 ③ 상관분석 히트맵 ④ 핵심 발견사항 3개',
    type: 'analysis'
  },
  {
    week: 10, topic: '마케팅 전략 수립', content: 'STP 분석, 4P 전략, 디지털 마케팅, 콘텐츠 전략',
    ai: 'AI STP·4P 전략 수립', tools: 'ChatGPT, Gemini',
    output: '마케팅 전략안', outputDetail: '① STP 분석 문서 ② 4P 전략 슬라이드 ③ SNS 30일 콘텐츠 캘린더 ④ KPI 5개 설정',
    type: 'planning'
  },
  {
    week: 11, topic: '서비스 운영·고객경험', content: '고객 여정 지도, 서비스 청사진, 터치포인트',
    ai: 'AI 고객 여정 설계·서비스 청사진 생성', tools: 'ChatGPT, Napkin',
    output: '고객여정맵', outputDetail: '① 고객 여정 지도 (5단계) ② 서비스 청사진 ③ 페인포인트·기회 분석 ④ 개선 우선순위 매트릭스',
    type: 'planning'
  },
  {
    week: 12, topic: '재무·수익모델 분석', content: '손익분기점, 현금흐름, 재무 예측, 투자 타당성',
    ai: 'AI 재무 모델링·시나리오 분석', tools: 'ChatGPT, Excel',
    output: '수익모델표', outputDetail: '① 손익분기점 계산 시트 ② 3년 수익 예측 (낙관·기본·비관) ③ 초기 투자 비용표 ④ 재무 요약 슬라이드',
    type: 'analysis'
  },
  {
    week: 13, topic: 'ESG·AI 전환 전략', content: 'ESG 경영, AI 도입 전략, 지속가능성, 디지털 전환',
    ai: 'Gemini로 ESG·AI 전략 분석', tools: 'Gemini, ChatGPT',
    output: '전략 보고서', outputDetail: '① ESG 자체 평가 체크리스트 ② AI 전환 로드맵 ③ 지속가능성 전략 3가지 ④ KPI 및 측정 방법',
    type: 'analysis'
  },
  {
    week: 14, topic: '피치덱 최종 제작', content: '스토리텔링, 시각 디자인, 데이터 시각화, 디자인 시스템',
    ai: 'Gamma로 최종 피치덱 완성', tools: 'Gamma, Napkin',
    output: '최종 발표 슬라이드', outputDetail: '① Gamma 최종 피치덱 12장 ② Napkin 시각화 3개 이상 ③ 발표 대본 완성본 ④ 예상 Q&A 10개',
    type: 'presentation'
  },
  {
    week: 15, topic: '발표 리허설·AI 피드백', content: '발표 기술, 시간 관리, 질의응답 대비, 팀 피드백',
    ai: 'AI 발표 스크립트·피드백 생성', tools: 'ChatGPT, Gemini',
    output: '발표 피드백표', outputDetail: '① 리허설 자기 평가표 ② 동료 피드백 수렴 결과 ③ AI 피드백 반영 수정본 ④ 최종 점검 체크리스트',
    type: 'presentation'
  },
  {
    week: 16, topic: '최종 발표·성찰', content: '최종 발표, 동료 평가, 학습 성찰, 포트폴리오',
    ai: 'AI 성찰 문장·포트폴리오 작성 보조', tools: 'ChatGPT',
    output: '최종보고서·성찰문', outputDetail: '① 최종 보고서 (20페이지 내외) ② 팀 성찰 문장 (AI 활용 포함) ③ 개인 포트폴리오 1페이지 ④ 수업 전체 AI 활용 일지',
    type: 'final', highlight: true
  },
]

const typeColors = {
  intro:        { badge: 'bg-slate-100 text-slate-600',     row: '' },
  research:     { badge: 'bg-blue-100 text-blue-700',       row: 'bg-blue-50/30' },
  analysis:     { badge: 'bg-orange-100 text-orange-700',   row: 'bg-orange-50/30' },
  ideation:     { badge: 'bg-emerald-100 text-emerald-700', row: 'bg-emerald-50/30' },
  planning:     { badge: 'bg-purple-100 text-purple-700',   row: 'bg-purple-50/30' },
  presentation: { badge: 'bg-pink-100 text-pink-700',       row: 'bg-pink-50/30' },
  final:        { badge: 'bg-red-100 text-red-700',         row: 'bg-red-50/20' },
}

const typeLabels = {
  intro: '오리엔테이션', research: '조사', analysis: '분석',
  ideation: '아이디어', planning: '기획', presentation: '발표', final: '최종',
}

export default function WeeklyPlan() {
  const tableText = weeklyData.map(w =>
    `${w.week}주차 | ${w.topic} | ${w.content} | ${w.ai} | ${w.tools} | ${w.output}\n산출물 세부: ${w.outputDetail}`
  ).join('\n\n')

  return (
    <div className="space-y-5">

      <GuideBox
        mode="professor"
        steps={['운영표 확인', '주차별 AI 도구 사전 준비', '수업 전 프롬프트 테스트', '학생 실습 진행', '산출물 수합·평가']}
        tip="매 주차 수업 전날 해당 주차의 'AI 활용 방식'을 확인하고, 추천 AI 도구에서 프롬프트를 미리 테스트해 두세요. 8·16주차 발표 주는 충분한 준비 시간을 확보하세요."
      />

      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">📅</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">16주차 수업 운영표</h2>
              <p className="text-xs text-slate-500">경영학 AI 활용 수업 16주 전체 계획 — 주차별 산출물 세부 안내 포함</p>
            </div>
          </div>
          <CopyButton text={tableText} label="전체 복사" />
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-500 font-semibold self-center">유형:</span>
          {Object.entries(typeLabels).map(([key, label]) => (
            <span key={key} className={`badge ${typeColors[key].badge}`}>{label}</span>
          ))}
          <span className="badge bg-yellow-100 text-yellow-700">⭐ 주요 발표</span>
        </div>
      </div>

      {/* 모바일: 카드 */}
      <div className="block lg:hidden space-y-3">
        {weeklyData.map(w => (
          <div key={w.week} className={`card border-l-4 ${w.highlight ? 'border-yellow-400 bg-yellow-50/50' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${w.highlight ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                {w.week}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{w.topic}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`badge ${typeColors[w.type].badge} text-xs`}>{typeLabels[w.type]}</span>
                  {w.highlight && <span className="text-yellow-500 text-xs">⭐ 발표</span>}
                </div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-600 mb-3">
              <div><span className="font-semibold text-slate-500">내용:</span> {w.content}</div>
              <div><span className="font-semibold text-slate-500">AI 활용:</span> {w.ai}</div>
              <div><span className="font-semibold text-slate-500">도구:</span> {w.tools}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">📦 산출물: {w.output}</p>
              <div className="grid grid-cols-2 gap-1">
                {w.outputDetail.split(' ② ').map((item, i) => (
                  <div key={i} className="text-xs text-blue-600">
                    {i === 0 ? item : `② ${item}`}
                  </div>
                )).slice(0, 4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크탑: 테이블 */}
      <div className="hidden lg:block card p-0 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }} className="text-white">
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide w-16">주차</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide w-32">주제</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide">핵심 학습내용</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide">AI 활용 방식</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide w-28">도구</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide w-28">산출물</th>
                <th className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide w-52">산출물 세부 내용</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((w, i) => (
                <tr
                  key={w.week}
                  className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${
                    w.highlight ? 'bg-yellow-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } ${typeColors[w.type].row}`}
                >
                  <td className="px-3 py-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black ${
                      w.highlight ? 'bg-yellow-500' : 'bg-slate-700'
                    }`}>
                      {w.week}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-slate-800 text-xs leading-tight">{w.topic}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`badge ${typeColors[w.type].badge} text-xs`}>{typeLabels[w.type]}</span>
                      {w.highlight && <span className="text-yellow-500 text-xs">⭐</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600 leading-relaxed">{w.content}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{w.ai}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.tools.split(', ').map(t => (
                        <span key={t} className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-medium">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">{w.output}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed">
                      {w.outputDetail.split(' ② ').map((item, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-slate-400 shrink-0">{i === 0 ? '①' : `②`}</span>
                          <span>{i === 0 ? item.replace('① ', '') : item}</span>
                        </div>
                      )).slice(0, 2)}
                      {w.outputDetail.split(' ② ').length > 2 && (
                        <div className="text-slate-400">+{w.outputDetail.split(' ② ').length - 2}개 더</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 운영 팁 */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
          <span>💡</span> EduAI Studio 수업 운영 팁
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: '팀 구성', desc: '3~5주차에 팀 구성 완료, 팀당 5명·역할 분담표 제출 요구' },
            { icon: '🤖', title: 'AI 도구 로테이션', desc: '매 주차 새 AI 도구를 소개, ChatGPT→Gemini→Gamma→Napkin 순환 활용' },
            { icon: '📊', title: '루브릭 공개', desc: '1주차에 평가 루브릭 공개, 각 산출물 제출 시 AI 활용 여부 의무 명시' },
            { icon: '🔄', title: '이중 피드백', desc: '8·15주차에 AI 피드백 + 교수자 피드백 병행, 수정 의무 부여' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-3 bg-white/60 rounded-xl p-3 border border-blue-100">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <p className="text-sm font-bold text-blue-800">{tip.title}</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
