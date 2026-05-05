import { Calendar, Download } from 'lucide-react'
import { copyToClipboard } from '../utils/promptTemplates'
import { useState } from 'react'
import UsageGuide from './UsageGuide'

const WEEKS = [
  {
    week: 1, topic: '생성형 AI와 경영학 수업 개요',
    content: 'AI 개념·경영학 활용 전망·프롬프트 기초·윤리 논의',
    method: 'ChatGPT 프롬프트 실습, AI 도구 계정 생성',
    tools: 'ChatGPT, Gemini',
    output: 'AI 활용 윤리 서약서 + 도구별 계정 설정 완료 체크리스트',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    week: 2, topic: '기업 사례 분석',
    content: '경쟁전략 이론, 성공·실패 사례 분석 방법론',
    method: 'AI 사례 탐색 프롬프트 작성 및 사례 카드 제작',
    tools: 'Gemini, Perplexity',
    output: '국내·글로벌 기업 사례 분석 카드 5개 (기업명·전략·시사점·출처)',
    color: 'bg-indigo-50 border-indigo-200',
  },
  {
    week: 3, topic: '고객 문제 정의',
    content: '디자인씽킹 5단계, 공감지도, HMW 질문법',
    method: 'AI 페르소나·공감지도 생성 실습',
    tools: 'ChatGPT, Napkin AI',
    output: '고객 페르소나 2개 + HMW 질문 10개 + 공감지도 초안',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    week: 4, topic: '시장·경쟁 분석',
    content: 'PESTEL, 포터 5Forces, 경쟁 포지셔닝',
    method: 'AI 시장 리서치·경쟁분석 프롬프트 실습',
    tools: 'Gemini, Felo',
    output: 'PESTEL 분석표 + 경쟁사 비교표 (5개사) + 포지셔닝 맵',
    color: 'bg-violet-50 border-violet-200',
  },
  {
    week: 5, topic: '프로젝트 아이디어 생성',
    content: '브레인스토밍, SCAMPER 기법, 아이디어 수렴·발산',
    method: 'AI 아이디어 발산 실습, 투표로 주제 선정',
    tools: 'ChatGPT',
    output: '아이디어 후보표 10개 → 최종 주제 1개 + 선정 근거서',
    color: 'bg-pink-50 border-pink-200',
  },
  {
    week: 6, topic: '비즈니스 모델 설계',
    content: '비즈니스 모델 캔버스(BMC) 9블록, 린스타트업',
    method: 'AI BMC 자동 생성 후 팀 수정·보완 실습',
    tools: 'ChatGPT, Napkin AI',
    output: '팀 비즈니스 모델 캔버스 완성본 + 핵심 가설 3개',
    color: 'bg-rose-50 border-rose-200',
  },
  {
    week: 7, topic: '설문·인터뷰 설계',
    content: '조사 방법론, Likert 척도, 표본 추출 기준',
    method: 'AI 설문 문항 생성 실습 (30문항 설계)',
    tools: 'ChatGPT, Google Forms',
    output: '설문 설계서 (목적·대상·문항 구성) + 구글 폼 링크 + 인터뷰 가이드',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    week: 8, topic: '중간 발표',
    content: '발표 구성법, 스토리텔링, 청중 피드백 기술',
    method: 'Gamma로 10장 피치덱 제작 후 팀 발표 (5분/팀)',
    tools: 'Gamma',
    output: '중간 피치덱 10슬라이드 + 교수자 피드백 체크리스트',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    week: 9, topic: '데이터 분석 기초',
    content: '기술통계·상관분석·시각화 방법론',
    method: 'Python/Excel 분석 코드 실습 (Google Colab)',
    tools: 'ChatGPT, Python, Excel',
    output: '설문 데이터 기술통계표 + 상관분석 결과 + 시각화 그래프 3종',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    week: 10, topic: '마케팅 전략 수립',
    content: 'STP 분석, 4P 전략, 콘텐츠·디지털 마케팅',
    method: 'AI 마케팅 전략 자동 생성 후 팀 수정 실습',
    tools: 'ChatGPT, Gemini',
    output: 'STP 분석서 + 4P 전략안 + 4주 콘텐츠 캘린더 + KPI 설정표',
    color: 'bg-lime-50 border-lime-200',
  },
  {
    week: 11, topic: '서비스 운영·고객경험',
    content: '서비스 청사진, 고객여정맵, SERVQUAL 5차원',
    method: 'AI 고객여정맵·서비스 청사진 생성 실습',
    tools: 'ChatGPT, Napkin AI',
    output: '고객여정맵 (6단계) + 서비스 청사진 + 고객 접점 개선 제안서',
    color: 'bg-green-50 border-green-200',
  },
  {
    week: 12, topic: '재무·수익모델 분석',
    content: '손익분기점, 수익모델 유형, 3년 재무 계획',
    method: 'AI 재무 시뮬레이션 + Excel 수익 모델링 실습',
    tools: 'ChatGPT, Excel',
    output: '수익모델 상세표 + 손익분기점 계산표 + 3년 매출 추정 시나리오',
    color: 'bg-teal-50 border-teal-200',
  },
  {
    week: 13, topic: 'ESG·AI 전환 전략',
    content: 'ESG 경영 프레임워크, AI 전환 로드맵, 지속가능경영',
    method: 'AI ESG 리포트 자동 생성 실습',
    tools: 'Gemini, ChatGPT',
    output: 'ESG 전략 보고서 (E·S·G 항목별 2페이지) + AI 전환 로드맵',
    color: 'bg-cyan-50 border-cyan-200',
  },
  {
    week: 14, topic: '피치덱 제작',
    content: '최종 발표자료 구성, 데이터 시각화, 디자인 원칙',
    method: 'Gamma 최종 피치덱 10장 제작 + 발표 대본 작성',
    tools: 'Gamma, ChatGPT',
    output: '최종 피치덱 10슬라이드 (Gamma) + 발표 대본 + 예상 Q&A 5쌍',
    color: 'bg-sky-50 border-sky-200',
  },
  {
    week: 15, topic: '발표 리허설·AI 피드백',
    content: '발표 기술, 청중 질의 대응, 리허설 피드백',
    method: 'AI 발표 피드백 프롬프트 실습 + 팀 간 교차 피드백',
    tools: 'ChatGPT',
    output: '발표 피드백표 (논리·자료·발표력·시간) + 개선 반영 내역서',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    week: 16, topic: '최종 발표·성찰',
    content: '팀 발표 (10분), 동료 평가, 학습 성찰 작성',
    method: 'AI 성찰문 작성 가이드 + 동료 평가 루브릭 활용',
    tools: 'ChatGPT',
    output: '최종 발표자료 + 최종보고서 (10페이지) + 개인 성찰문 (A4 1장)',
    color: 'bg-indigo-50 border-indigo-200',
  },
]

const USAGE_STEPS = [
  { icon: '📅', text: '16주차 전체 수업 운영 계획을 한눈에 확인할 수 있습니다.' },
  { icon: '🎯', text: '각 주차별 핵심 학습내용·AI 활용 방식·추천 도구·실습 산출물을 확인합니다.' },
  { icon: '📋', text: '"표 복사" 버튼으로 전체 운영표를 복사해 LMS·강의계획서에 붙여넣을 수 있습니다.' },
  { icon: '🖥️', text: '빔프로젝터 수업 중 해당 주차 행을 가리키며 오늘 수업을 소개하세요.' },
]

export default function WeeklyPlan() {
  const [copied, setCopied] = useState(false)
  const [highlight, setHighlight] = useState(null)

  const tableText = WEEKS.map(w =>
    `${w.week}주차\t${w.topic}\t${w.content}\t${w.method}\t${w.tools}\t${w.output}`
  ).join('\n')

  const handleCopy = async () => {
    await copyToClipboard(tableText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2.5 rounded-xl shadow-sm"><Calendar size={22} className="text-teal-700" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">16주차 수업 운영표</h2>
            <p className="text-sm text-gray-500">경영학 AI 활용 수업 16주차 전체 계획표 — 각 주차별 실습 산출물을 구체화했습니다.</p>
          </div>
        </div>
        <button onClick={handleCopy} className="btn-secondary text-sm flex-shrink-0">
          <Download size={16} />
          {copied ? '복사됨!' : '표 복사'}
        </button>
      </div>

      <UsageGuide steps={USAGE_STEPS} tip="각 행을 클릭하면 해당 주차가 강조 표시됩니다. 빔프로젝터로 오늘 주차를 바로 찾을 수 있습니다." />

      {/* 모바일: 카드 뷰 */}
      <div className="block lg:hidden space-y-3">
        {WEEKS.map(w => (
          <div key={w.week} className={`border rounded-xl p-4 ${w.color} cursor-pointer transition-all ${highlight === w.week ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setHighlight(highlight === w.week ? null : w.week)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{w.week}주</span>
              <span className="font-bold text-gray-800 text-sm">{w.topic}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
              <div><span className="font-semibold text-gray-700">핵심 내용: </span>{w.content}</div>
              <div><span className="font-semibold text-gray-700">AI 활용: </span>{w.method}</div>
              <div><span className="font-semibold text-gray-700">추천 도구: </span>{w.tools}</div>
              <div className="bg-emerald-50 rounded-lg p-2 mt-1 border border-emerald-100">
                <span className="font-semibold text-emerald-700">📦 산출물: </span>
                <span className="text-emerald-800">{w.output}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱: 테이블 뷰 */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200 shadow-md">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              {['주차', '주제', '핵심 학습내용', 'AI 활용 방식', '추천 도구', '실습 산출물'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left font-semibold text-sm whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((w, i) => (
              <tr
                key={w.week}
                onClick={() => setHighlight(highlight === w.week ? null : w.week)}
                className={`border-b border-gray-100 cursor-pointer transition-all ${
                  highlight === w.week
                    ? 'bg-blue-50 border-blue-200'
                    : i % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-gray-50/60 hover:bg-slate-100/60'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`font-bold text-sm px-2.5 py-1 rounded-full ${
                    highlight === w.week ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>{w.week}주</span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{w.topic}</td>
                <td className="px-4 py-3 text-gray-600 text-xs leading-relaxed max-w-[180px]">{w.content}</td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px]">{w.method}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {w.tools.split(', ').map(t => (
                      <span key={t} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs max-w-[200px]">
                  <span className="text-emerald-700 font-medium leading-relaxed">{w.output}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 text-center">* 행 클릭 시 해당 주차 강조 표시 | 빔프로젝터 시연 시 활용하세요</p>
    </div>
  )
}
