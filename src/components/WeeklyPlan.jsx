import { Calendar, Download } from 'lucide-react'
import { copyToClipboard } from '../utils/promptTemplates'
import { useState } from 'react'

const WEEKS = [
  { week: 1,  topic: '생성형 AI와 경영학 수업 개요', content: 'AI 개념, 경영학 활용 전망, 윤리 논의', method: 'ChatGPT 소개, 프롬프트 실습', tools: 'ChatGPT, Gemini', output: 'AI 활용 윤리 체크리스트', color: 'bg-blue-50 border-blue-200' },
  { week: 2,  topic: '기업 사례 분석',                content: '경쟁전략, 성공/실패 사례 분석',         method: 'AI 사례 탐색 프롬프트 작성',  tools: 'Gemini, Perplexity',      output: '사례 분석 카드 (5개)',    color: 'bg-indigo-50 border-indigo-200' },
  { week: 3,  topic: '고객 문제 정의',                content: '디자인씽킹, 공감지도, HMW 질문',       method: 'AI 페르소나 생성 실습',       tools: 'GPT, Napkin AI',          output: '문제정의 맵',             color: 'bg-purple-50 border-purple-200' },
  { week: 4,  topic: '시장·경쟁 분석',               content: 'PESTEL, 포터 5Forces, 경쟁 분석',      method: 'AI 시장 리서치 프롬프트',     tools: 'Gemini, Felo',            output: '경쟁 분석표',             color: 'bg-violet-50 border-violet-200' },
  { week: 5,  topic: '프로젝트 아이디어 생성',        content: '브레인스토밍, SCAMPER, 아이디어 발산', method: 'AI 아이디어 발산 실습',       tools: 'GPT',                     output: '아이디어 후보표 (5개)',   color: 'bg-pink-50 border-pink-200' },
  { week: 6,  topic: '비즈니스 모델 설계',            content: '비즈니스 모델 캔버스, 린스타트업',     method: 'AI BMC 자동 생성 실습',       tools: 'GPT, Napkin AI',          output: '비즈니스 모델 캔버스',    color: 'bg-rose-50 border-rose-200' },
  { week: 7,  topic: '설문·인터뷰 설계',              content: '조사 방법론, 질문지 설계, 표본 추출',  method: 'AI 설문 문항 생성 실습',      tools: 'GPT, Genspark',           output: '조사 설계서',             color: 'bg-orange-50 border-orange-200' },
  { week: 8,  topic: '중간 발표',                    content: '발표 구성, 스토리텔링, 피드백 기술',   method: 'Gamma 피치덱 제작 실습',      tools: 'Gamma',                   output: '중간 피치덱 (10슬라이드)', color: 'bg-amber-50 border-amber-200' },
  { week: 9,  topic: '데이터 분석 기초',              content: '기술통계, 상관분석, 시각화 방법',      method: 'Python/Excel 분석 코드 실습', tools: 'GPT, Python, Excel',      output: '분석 결과표 + 시각화',    color: 'bg-yellow-50 border-yellow-200' },
  { week: 10, topic: '마케팅 전략 수립',              content: 'STP, 4P, 디지털 마케팅, 콘텐츠 전략', method: 'AI 마케팅 전략 생성 실습',    tools: 'GPT, Gemini',             output: '마케팅 전략안',           color: 'bg-lime-50 border-lime-200' },
  { week: 11, topic: '서비스 운영·고객경험',          content: '서비스 청사진, 고객여정맵, SERVQUAL', method: 'AI 고객여정맵 생성 실습',     tools: 'GPT, Napkin AI',          output: '고객여정맵',              color: 'bg-green-50 border-green-200' },
  { week: 12, topic: '재무·수익모델 분석',            content: '손익분기점, 수익모델, 재무계획',       method: 'AI 재무 시뮬레이션 실습',     tools: 'GPT, Excel',              output: '수익모델표',              color: 'bg-teal-50 border-teal-200' },
  { week: 13, topic: 'ESG·AI 전환 전략',             content: 'ESG 경영, AI 전환 로드맵, 지속가능경영', method: 'AI ESG 리포트 생성 실습',   tools: 'Gemini, GPT',             output: '전략 보고서',             color: 'bg-cyan-50 border-cyan-200' },
  { week: 14, topic: '피치덱 제작',                  content: '발표자료 구성, 데이터 시각화, 디자인', method: 'Gamma 최종 피치덱 제작',      tools: 'Gamma',                   output: '최종 발표 슬라이드',      color: 'bg-sky-50 border-sky-200' },
  { week: 15, topic: '발표 리허설·AI 피드백',         content: '발표 기술, 청중 질의 대응, 개선',      method: 'AI 발표 피드백 프롬프트',     tools: 'GPT',                     output: '발표 피드백표',           color: 'bg-blue-50 border-blue-200' },
  { week: 16, topic: '최종 발표·성찰',               content: '팀 발표, 동료 평가, 학습 성찰',        method: 'AI 성찰문 작성 가이드',       tools: 'GPT',                     output: '최종보고서 + 성찰문',     color: 'bg-indigo-50 border-indigo-200' },
]

export default function WeeklyPlan() {
  const [copied, setCopied] = useState(false)

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
          <div className="bg-teal-100 p-2 rounded-xl"><Calendar size={22} className="text-teal-700" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">16주차 수업 운영표</h2>
            <p className="text-sm text-gray-500">경영학 AI 활용 수업 16주차 전체 계획표입니다.</p>
          </div>
        </div>
        <button onClick={handleCopy} className="btn-secondary text-sm">
          <Download size={16} />
          {copied ? '복사됨!' : '표 복사'}
        </button>
      </div>

      {/* 모바일: 카드 뷰 */}
      <div className="block lg:hidden space-y-3">
        {WEEKS.map(w => (
          <div key={w.week} className={`border rounded-xl p-4 ${w.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{w.week}주</span>
              <span className="font-bold text-gray-800 text-sm">{w.topic}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div><span className="font-medium">핵심 내용:</span> {w.content}</div>
              <div><span className="font-medium">AI 활용:</span> {w.method}</div>
              <div><span className="font-medium">추천 도구:</span> {w.tools}</div>
              <div><span className="font-medium">산출물:</span> {w.output}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱: 테이블 뷰 */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              {['주차', '주제', '핵심 학습내용', 'AI 활용 방식', '추천 도구', '실습 산출물'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((w, i) => (
              <tr key={w.week} className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{w.week}주</td>
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{w.topic}</td>
                <td className="px-4 py-3 text-gray-600 text-xs leading-relaxed">{w.content}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{w.method}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {w.tools.split(', ').map(t => (
                      <span key={t} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium text-xs">{w.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
