import {
  BookOpen, Lightbulb, BarChart2, Presentation, Users, Bot,
  AlertTriangle, Info, Sparkles, CheckCircle, ArrowRight,
  FileText, Search, Cpu, ClipboardCheck, Send,
  Eye, PlayCircle, FolderOpen, Upload
} from 'lucide-react'

const OUTPUT_ITEMS = [
  { label: '강의안',    color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: '기업 사례', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: '아이디어 후보', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: '분석표',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Python 코드', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { label: '피치덱',    color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: '보고서',    color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: '팀 피드백', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { label: '루브릭',    color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { label: '성찰문',    color: 'bg-violet-100 text-violet-800 border-violet-200' },
]

const TOOL_CARDS = [
  { name: 'ChatGPT',      desc: '강의안·사례·코딩 보조',  color: 'bg-green-50 border-green-200 text-green-800',   dot: 'bg-green-500' },
  { name: 'Gemini',       desc: '최신 사례 탐색·분석',    color: 'bg-blue-50 border-blue-200 text-blue-800',      dot: 'bg-blue-500' },
  { name: 'Gamma',        desc: '피치덱·발표자료 제작',   color: 'bg-purple-50 border-purple-200 text-purple-800', dot: 'bg-purple-500' },
  { name: 'Perplexity',   desc: '사례 검증·리서치',       color: 'bg-orange-50 border-orange-200 text-orange-800', dot: 'bg-orange-500' },
  { name: 'Napkin AI',    desc: '다이어그램·인포그래픽',  color: 'bg-pink-50 border-pink-200 text-pink-800',       dot: 'bg-pink-500' },
  { name: 'Google Colab', desc: 'Python 데이터 분석',     color: 'bg-yellow-50 border-yellow-200 text-yellow-800', dot: 'bg-yellow-500' },
]

const FEATURE_CARDS = [
  { id: 'lecture',   icon: BookOpen,     label: '강의안·사례 발굴',    desc: '수업 주제 입력 → 강의안·프롬프트 자동 생성', color: 'from-blue-500 to-blue-600',    light: 'bg-blue-50' },
  { id: 'project',   icon: Lightbulb,    label: '프로젝트 아이디어',   desc: '팀 주제 발굴 → 비즈니스 모델 설계 지원',   color: 'from-amber-500 to-orange-500', light: 'bg-amber-50' },
  { id: 'data',      icon: BarChart2,    label: '데이터 분석·코딩',    desc: '설문·매출 데이터 → 분석 코드 자동 생성',   color: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50' },
  { id: 'pitchdeck', icon: Presentation, label: '피치덱·보고서 자동화', desc: 'Gamma·보고서·발표 대본 프롬프트 생성',     color: 'from-purple-500 to-purple-600', light: 'bg-purple-50' },
  { id: 'coaching',  icon: Users,        label: '팀 프로젝트 코칭',    desc: 'AI 코칭 프롬프트·팀 회의 질문 생성',       color: 'from-rose-500 to-pink-600',    light: 'bg-rose-50' },
  { id: 'agent',     icon: Bot,          label: 'AI 튜터·시뮬레이션', desc: 'Opal·Gemini AI 에이전트 설계 지원',        color: 'from-indigo-500 to-violet-600', light: 'bg-indigo-50' },
]

const PROFESSOR_STEPS = [
  { icon: FileText,     label: '수업 주제 입력',  desc: '과목명·주차·주제를 입력합니다.',           color: 'bg-blue-500' },
  { icon: Search,       label: 'AI 도구 선택',    desc: 'GPT / Gemini / Perplexity를 선택합니다.',  color: 'bg-indigo-500' },
  { icon: Cpu,          label: '프롬프트 생성',   desc: '버튼 클릭으로 프롬프트를 자동 생성합니다.', color: 'bg-violet-500' },
  { icon: PlayCircle,   label: '학생 실습 진행',  desc: '생성된 프롬프트로 팀별 AI 실습을 진행합니다.', color: 'bg-purple-500' },
  { icon: ClipboardCheck, label: '산출물 평가',  desc: '루브릭 기준으로 팀 결과물을 평가합니다.',   color: 'bg-pink-500' },
]

const STUDENT_STEPS = [
  { icon: Eye,        label: '문제 이해',          desc: '교수자가 제시한 오늘의 수업 과제를 확인합니다.',       color: 'bg-emerald-500' },
  { icon: PlayCircle, label: 'AI 프롬프트 실행',   desc: '플랫폼에서 복사한 프롬프트를 AI 도구에 실행합니다.',  color: 'bg-teal-500' },
  { icon: CheckCircle,label: '결과 검토',          desc: 'AI 결과를 팀원과 함께 비판적으로 검토·수정합니다.',   color: 'bg-cyan-500' },
  { icon: Upload,     label: '보고서·발표자료 제출', desc: 'Gamma 피치덱·보고서를 완성하여 LMS에 제출합니다.',  color: 'bg-blue-500' },
]

export default function Dashboard({ onNavigate, mode }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <div className="space-y-7">

      {/* ── 히어로 배너 ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="bg-white/20 border border-white/30 rounded-2xl p-4 flex-shrink-0 shadow-lg">
            <Sparkles size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                EduAI Studio
              </span>
              <span className="text-blue-200 text-xs">경영학 AI 수업 운영 플랫폼</span>
            </div>
            <h2 className="text-2xl font-extrabold mb-2 leading-tight">
              경영학 AI 수업 실습 플랫폼에<br className="hidden sm:block" /> 오신 것을 환영합니다
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-2xl">
              생성형 AI를 활용한 강의 준비, 사례 발굴, 데이터 분석, 프로젝트 코칭,
              발표자료 제작까지 — 모든 수업 활동을 하나의 플랫폼에서 지원합니다.
            </p>
            <p className="text-blue-300 text-xs mt-3">📅 {today}</p>
          </div>
        </div>
      </div>

      {/* ── 교수자 5단계 흐름 ── */}
      <div className="card !p-6">
        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-5">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">교수자</span>
          수업 운영 5단계 흐름
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-2">
          {PROFESSOR_STEPS.map(({ icon: Icon, label, desc, color }, i) => (
            <div key={i} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 flex-1 relative">
              <div className={`${color} rounded-xl p-2.5 shadow-md flex-shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="sm:text-center">
                <p className="font-semibold text-sm text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
              </div>
              {/* 화살표 (마지막 제외) */}
              {i < PROFESSOR_STEPS.length - 1 && (
                <ArrowRight
                  size={16}
                  className="text-gray-300 absolute right-0 top-3 hidden sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 학생 4단계 흐름 ── */}
      <div className="card !p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-5">
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">학생</span>
          실습 4단계 흐름
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STUDENT_STEPS.map(({ icon: Icon, label, desc, color }, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm text-center">
              <div className={`${color} rounded-xl p-2.5 shadow-sm w-fit mx-auto mb-2`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-2">
                {i + 1}
              </div>
              <p className="font-semibold text-sm text-gray-800 mb-1">{label}</p>
              <p className="text-xs text-gray-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 경고 / 윤리 박스 ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-1">생성형 AI 활용 주의사항</p>
            <p className="text-xs leading-relaxed">AI가 생성한 모든 결과물은 교수자 검토 후 수업에 활용해야 합니다. 사실 확인, 출처 검증, 저작권 준수가 필요합니다.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">AI 윤리 안내</p>
            <p className="text-xs leading-relaxed">표절·허위 정보 생성·개인정보 입력을 금지합니다. AI는 보조 도구로만 활용하고, 최종 판단은 반드시 사람이 해야 합니다.</p>
          </div>
        </div>
      </div>

      {/* ── 핵심 기능 바로가기 ── */}
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-700 mb-4">
          <CheckCircle size={18} className="text-blue-600" />
          핵심 기능 바로가기
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURE_CARDS.map(({ id, icon: Icon, label, desc, color, light }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`${light} border border-gray-100 rounded-2xl p-5 text-left group hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">{label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                <span>시작하기</span>
                <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 생성 가능 산출물 ── */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">생성 가능한 산출물</h3>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_ITEMS.map(({ label, color }) => (
            <span key={label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}>
              ✓ {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 추천 AI 도구 ── */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">추천 AI 도구</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TOOL_CARDS.map(({ name, desc, color, dot }) => (
            <div key={name} className={`border rounded-xl p-3.5 ${color} flex items-start gap-3`}>
              <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0 mt-1.5`} />
              <div>
                <p className="font-bold text-sm">{name}</p>
                <p className="text-xs mt-0.5 opacity-80">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 모드별 안내 ── */}
      {mode === 'professor' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5">
          <p className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <BookOpen size={16} /> 교수자 모드 — 오늘 수업 준비 체크리스트
          </p>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-500" /> 강의안·사례 발굴 메뉴에서 오늘 수업 주제를 입력하고 GPT·Gemini용 프롬프트를 생성합니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-500" /> 16주차 수업 운영표에서 오늘 주차의 산출물과 추천 도구를 확인합니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-500" /> LMS·링크 관리 메뉴에서 수업 링크를 정리하고 학생 안내문을 복사합니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-500" /> 평가 루브릭을 출력하여 팀 프로젝트 평가 기준을 학생들과 공유합니다.</li>
          </ul>
        </div>
      )}
      {mode === 'student' && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-5">
          <p className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <FolderOpen size={16} /> 학생 모드 — 오늘 실습 시작하기
          </p>
          <ul className="text-sm text-emerald-700 space-y-2">
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-emerald-500" /> 프로젝트 아이디어 메뉴에서 팀 프로젝트 주제와 비즈니스 모델을 발굴합니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-emerald-500" /> 데이터 분석 메뉴에서 설문 데이터 분석 코드와 Excel 가이드를 받습니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-emerald-500" /> 피치덱 메뉴에서 Gamma용 발표자료 프롬프트와 보고서 초안을 만듭니다.</li>
          </ul>
        </div>
      )}
      {mode === 'team' && (
        <div className="bg-violet-50 border-l-4 border-violet-500 rounded-xl p-5">
          <p className="font-bold text-violet-800 mb-3 flex items-center gap-2">
            <Users size={16} /> 팀 프로젝트 모드 — 오늘 팀 작업 가이드
          </p>
          <ul className="text-sm text-violet-700 space-y-2">
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-violet-500" /> 팀 프로젝트 코칭 메뉴에서 현재 단계와 어려운 점을 입력하고 AI 코칭을 받습니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-violet-500" /> 발표 전 점검표와 교수자 피드백 요청 문장을 생성합니다.</li>
            <li className="flex items-start gap-2"><CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-violet-500" /> LMS·링크 관리 메뉴에서 팀 공유 자료와 제출함 링크를 확인합니다.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
