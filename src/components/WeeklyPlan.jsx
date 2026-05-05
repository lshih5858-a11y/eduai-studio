import CopyButton from './CopyButton'

const weeklyData = [
  { week: 1, topic: '생성형 AI와 경영학 개요', content: 'AI 도구 소개, 프롬프트 엔지니어링 기초, AI 윤리', ai: 'ChatGPT 기초 실습', tools: 'ChatGPT, Claude', output: 'AI 활용 윤리 체크리스트', type: 'intro' },
  { week: 2, topic: '기업 사례 분석', content: '사례 분석 프레임워크, AI 기반 사례 수집', ai: 'AI로 사례 탐색·검증', tools: 'Gemini, Perplexity', output: '사례 분석 카드', type: 'research' },
  { week: 3, topic: '고객 문제 정의', content: 'HMW 방법론, 페르소나, 공감 지도', ai: 'AI 인터뷰 질문 생성', tools: 'ChatGPT, Napkin', output: '문제정의 맵', type: 'research' },
  { week: 4, topic: '시장·경쟁 분석', content: 'PEST, 포터의 5Forces, 경쟁 포지셔닝', ai: 'AI 경쟁사 분석', tools: 'Gemini, Felo', output: '경쟁 분석표', type: 'analysis' },
  { week: 5, topic: '프로젝트 아이디어 생성', content: 'SCAMPER, 브레인스토밍, 아이디어 평가', ai: 'AI 아이디어 발산·수렴', tools: 'ChatGPT, Gamma', output: '아이디어 후보표', type: 'ideation' },
  { week: 6, topic: '비즈니스 모델 설계', content: 'BMC, 가치 제안 캔버스, 수익모델', ai: 'AI BMC 초안 작성', tools: 'ChatGPT, Napkin', output: '비즈니스 모델 캔버스', type: 'planning' },
  { week: 7, topic: '설문·인터뷰 설계', content: '정성·정량 조사 설계, Likert 척도', ai: 'AI 설문 문항 생성·검토', tools: 'ChatGPT, Genspark', output: '조사 설계서', type: 'research' },
  { week: 8, topic: '중간 발표', content: '피치덱 구성, 발표 기술, Q&A 대응', ai: 'Gamma로 슬라이드 제작', tools: 'Gamma, ChatGPT', output: '중간 피치덱', type: 'presentation', highlight: true },
  { week: 9, topic: '데이터 분석 기초', content: '기술통계, 상관분석, 데이터 시각화', ai: 'Python/Excel 코드 생성', tools: 'ChatGPT, Python, Excel', output: '분석 결과표', type: 'analysis' },
  { week: 10, topic: '마케팅 전략 수립', content: 'STP, 4P, 디지털 마케팅, 콘텐츠 전략', ai: 'AI 마케팅 전략 수립', tools: 'ChatGPT, Gemini', output: '마케팅 전략안', type: 'planning' },
  { week: 11, topic: '서비스 운영·고객경험', content: '고객 여정, 서비스 청사진, 터치포인트', ai: 'AI 고객 여정 설계', tools: 'ChatGPT, Napkin', output: '고객여정맵', type: 'planning' },
  { week: 12, topic: '재무·수익모델 분석', content: '손익분기, 현금흐름, 재무 예측', ai: 'AI 재무 모델링 보조', tools: 'ChatGPT, Excel', output: '수익모델표', type: 'analysis' },
  { week: 13, topic: 'ESG·AI 전환 전략', content: 'ESG 경영, AI 도입 전략, 지속가능성', ai: 'AI ESG 전략 분석', tools: 'Gemini, ChatGPT', output: '전략 보고서', type: 'analysis' },
  { week: 14, topic: '피치덱 제작', content: '스토리텔링, 시각 디자인, 데이터 시각화', ai: 'Gamma 최종 피치덱 제작', tools: 'Gamma, Napkin', output: '발표 슬라이드', type: 'presentation' },
  { week: 15, topic: '발표 리허설·AI 피드백', content: '발표 기술, 질의응답 대비, 팀 피드백', ai: 'AI 발표 스크립트 검토', tools: 'ChatGPT, Gemini', output: '발표 피드백표', type: 'presentation' },
  { week: 16, topic: '최종 발표·성찰', content: '최종 발표, 동료 평가, 학습 성찰', ai: 'AI 성찰 문장 작성 보조', tools: 'ChatGPT', output: '최종보고서·성찰문', type: 'final', highlight: true },
]

const typeColors = {
  intro: 'bg-slate-100 text-slate-700',
  research: 'bg-blue-100 text-blue-700',
  analysis: 'bg-orange-100 text-orange-800',
  ideation: 'bg-emerald-100 text-emerald-700',
  planning: 'bg-purple-100 text-purple-700',
  presentation: 'bg-pink-100 text-pink-700',
  final: 'bg-red-100 text-red-700',
}

const typeLabels = {
  intro: '오리엔테이션', research: '조사', analysis: '분석', ideation: '아이디어', planning: '기획', presentation: '발표', final: '최종',
}

export default function WeeklyPlan() {
  const tableText = weeklyData.map(w =>
    `${w.week}주차 | ${w.topic} | ${w.content} | ${w.ai} | ${w.tools} | ${w.output}`
  ).join('\n')

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title mb-0">📅 16주차 수업 운영표</h2>
          <CopyButton text={tableText} label="전체 표 복사" />
        </div>
        <p className="text-sm text-slate-500">경영학 AI 활용 수업 16주 운영 계획표입니다. 수업 상황에 맞게 조정하여 활용하세요.</p>
      </div>

      {/* 범례 */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeLabels).map(([key, label]) => (
            <span key={key} className={`badge ${typeColors[key]}`}>{label}</span>
          ))}
          <span className="badge bg-yellow-100 text-yellow-800">⭐ 주요 발표</span>
        </div>
      </div>

      {/* 모바일: 카드 형태 */}
      <div className="block lg:hidden space-y-3">
        {weeklyData.map(w => (
          <div key={w.week} className={`card border-l-4 ${w.highlight ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">{w.week}주차: {w.topic}</span>
              {w.highlight && <span className="badge bg-yellow-100 text-yellow-800">⭐ 발표</span>}
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div><span className="font-medium">내용:</span> {w.content}</div>
              <div><span className="font-medium">AI 활용:</span> {w.ai}</div>
              <div><span className="font-medium">도구:</span> {w.tools}</div>
              <div><span className="font-medium">산출물:</span> <span className="text-blue-700 font-medium">{w.output}</span></div>
            </div>
            <span className={`badge ${typeColors[w.type]} mt-2`}>{typeLabels[w.type]}</span>
          </div>
        ))}
      </div>

      {/* 데스크탑: 테이블 형태 */}
      <div className="hidden lg:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-3 py-3 text-left w-16">주차</th>
                <th className="px-3 py-3 text-left w-36">주제</th>
                <th className="px-3 py-3 text-left">핵심 학습내용</th>
                <th className="px-3 py-3 text-left">AI 활용 방식</th>
                <th className="px-3 py-3 text-left w-36">추천 도구</th>
                <th className="px-3 py-3 text-left w-36">실습 산출물</th>
                <th className="px-3 py-3 text-left w-24">유형</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((w, i) => (
                <tr
                  key={w.week}
                  className={`border-b border-slate-100 ${
                    w.highlight ? 'bg-yellow-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-3 py-3 font-bold text-slate-700">
                    {w.week}주차
                    {w.highlight && <span className="ml-1 text-yellow-500">⭐</span>}
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">{w.topic}</td>
                  <td className="px-3 py-3 text-slate-600">{w.content}</td>
                  <td className="px-3 py-3 text-slate-600">{w.ai}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.tools.split(', ').map(t => (
                        <span key={t} className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-blue-700 font-medium text-xs">{w.output}</td>
                  <td className="px-3 py-3">
                    <span className={`badge text-xs ${typeColors[w.type]}`}>{typeLabels[w.type]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 운영 팁 */}
      <div className="card bg-blue-50 border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-3">💡 수업 운영 팁</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: '팀 구성', desc: '3~5주차에 팀 구성 완료, 8주차 중간 발표 전 1회 중간 점검 진행' },
            { icon: '🤖', title: 'AI 도구 소개', desc: '매 주차 새로운 AI 도구를 실습으로 소개하여 학생들의 디지털 역량 강화' },
            { icon: '📊', title: '평가 투명성', desc: '1주차에 루브릭 공개, 각 산출물 제출 시 AI 활용 여부 명시 요구' },
            { icon: '🔄', title: '피드백 사이클', desc: '8주차, 15주차에 교수자 피드백 + AI 피드백 병행하여 학습 효과 극대화' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-2">
              <span className="text-xl">{tip.icon}</span>
              <div>
                <div className="text-sm font-bold text-blue-800">{tip.title}</div>
                <div className="text-xs text-blue-600">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
