import {
  BookOpen, Lightbulb, BarChart2, Presentation, Users, Bot,
  AlertTriangle, Info, Sparkles, CheckCircle
} from 'lucide-react'

const OUTPUT_ITEMS = [
  '강의안', '기업 사례', '아이디어 후보', '분석표', 'Python 코드', '피치덱', '보고서', '팀 피드백'
]

const TOOL_CARDS = [
  { name: 'ChatGPT', desc: '강의안·사례·코딩 보조', color: 'bg-green-50 border-green-200 text-green-800', url: 'https://chat.openai.com' },
  { name: 'Gemini', desc: '최신 사례 탐색·분석', color: 'bg-blue-50 border-blue-200 text-blue-800', url: 'https://gemini.google.com' },
  { name: 'Gamma', desc: '피치덱·발표자료 제작', color: 'bg-purple-50 border-purple-200 text-purple-800', url: 'https://gamma.app' },
  { name: 'Perplexity', desc: '사례 검증·리서치', color: 'bg-orange-50 border-orange-200 text-orange-800', url: 'https://perplexity.ai' },
  { name: 'Napkin AI', desc: '다이어그램·인포그래픽', color: 'bg-pink-50 border-pink-200 text-pink-800', url: 'https://napkin.ai' },
  { name: 'Google Colab', desc: 'Python 데이터 분석', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', url: 'https://colab.research.google.com' },
]

const FEATURE_CARDS = [
  { id: 'lecture',   icon: BookOpen,      label: '강의안·사례 발굴',     desc: '교수자용 강의안과 최신 기업 사례를 자동으로 생성합니다.',  color: 'from-blue-500 to-blue-600' },
  { id: 'project',   icon: Lightbulb,     label: '프로젝트 아이디어',    desc: '팀 프로젝트 주제 발굴과 비즈니스 모델 설계를 지원합니다.', color: 'from-amber-500 to-orange-500' },
  { id: 'data',      icon: BarChart2,     label: '데이터 분석·코딩',     desc: '설문·매출·고객만족 데이터 분석 프롬프트를 생성합니다.',     color: 'from-emerald-500 to-teal-600' },
  { id: 'pitchdeck', icon: Presentation,  label: '피치덱·보고서 자동화', desc: 'Gamma, 보고서, 발표 대본을 자동 생성합니다.',              color: 'from-purple-500 to-purple-600' },
  { id: 'coaching',  icon: Users,         label: '팀 프로젝트 코칭',     desc: 'AI 코칭 프롬프트와 팀 회의 질문을 제공합니다.',            color: 'from-rose-500 to-pink-600' },
  { id: 'agent',     icon: Bot,           label: 'AI 튜터·시뮬레이션',  desc: 'Opal·Gemini 기반 AI 에이전트 설계를 지원합니다.',          color: 'from-indigo-500 to-violet-600' },
]

export default function Dashboard({ onNavigate, mode }) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="space-y-6">
      {/* 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-xl p-3">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">경영학 AI 수업 실습 플랫폼에 오신 것을 환영합니다</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              이 플랫폼은 경영학 수업에서 생성형 AI를 강의 준비, 사례 발굴, 데이터 분석,
              프로젝트 코칭, 발표자료 제작에 활용하도록 설계되었습니다.
            </p>
            <p className="text-blue-200 text-xs mt-2">📅 {today}</p>
          </div>
        </div>
      </div>

      {/* 경고 박스 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="warning-box">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold">생성형 AI 활용 주의사항</p>
            <p>AI가 생성한 모든 결과물은 교수자 검토 후 수업에 활용해야 합니다. 사실 확인, 출처 검증, 저작권 준수가 필요합니다.</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
          <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
          <div>
            <p className="font-semibold">AI 윤리 안내</p>
            <p>표절, 허위 정보 생성, 개인정보 입력을 금지합니다. AI는 보조 도구로만 활용하세요.</p>
          </div>
        </div>
      </div>

      {/* 기능 카드 */}
      <div>
        <h3 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-blue-600" />
          핵심 기능 바로가기
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURE_CARDS.map(({ id, icon: Icon, label, desc, color }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="card hover:shadow-md transition-all duration-200 text-left group hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 생성 가능 산출물 */}
      <div className="card">
        <h3 className="text-base font-bold text-gray-700 mb-3">생성 가능한 산출물</h3>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_ITEMS.map(item => (
            <span key={item} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200">
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      {/* 추천 AI 도구 */}
      <div>
        <h3 className="text-base font-bold text-gray-700 mb-3">추천 AI 도구</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TOOL_CARDS.map(({ name, desc, color }) => (
            <div key={name} className={`border rounded-xl p-3 ${color}`}>
              <p className="font-bold text-sm">{name}</p>
              <p className="text-xs mt-0.5 opacity-80">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 모드별 안내 */}
      {mode === 'professor' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-bold text-blue-800 mb-2 text-sm">👨‍🏫 교수자 모드 안내</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 강의안·사례 발굴 메뉴에서 수업 주제를 입력하면 강의안과 프롬프트를 생성합니다.</li>
            <li>• 16주차 수업 운영표에서 전체 강의 계획을 확인할 수 있습니다.</li>
            <li>• 평가 루브릭에서 팀 프로젝트 평가 기준을 출력할 수 있습니다.</li>
          </ul>
        </div>
      )}
      {mode === 'student' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="font-bold text-emerald-800 mb-2 text-sm">🎓 학생 모드 안내</p>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• 프로젝트 아이디어 메뉴에서 팀 프로젝트 주제를 발굴하세요.</li>
            <li>• 데이터 분석 메뉴에서 분석 코드와 Excel 가이드를 받을 수 있습니다.</li>
            <li>• 피치덱 메뉴에서 발표자료와 보고서 초안을 만들 수 있습니다.</li>
          </ul>
        </div>
      )}
      {mode === 'team' && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="font-bold text-purple-800 mb-2 text-sm">👥 팀 프로젝트 모드 안내</p>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 팀 프로젝트 코칭 메뉴에서 현재 단계에 맞는 AI 코칭을 받으세요.</li>
            <li>• 발표 전 점검표와 교수자 피드백 요청 문장을 생성할 수 있습니다.</li>
            <li>• LMS·링크 관리 메뉴에서 팀 공유 자료를 정리하세요.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
