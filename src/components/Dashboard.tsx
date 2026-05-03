import {
  BookOpen,
  Wrench,
  Users,
  ClipboardList,
  Zap,
  Award,
  TrendingUp,
  Globe,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { MenuKey } from "./Sidebar";
import type { UserRole } from "../App";

interface DashboardProps {
  onNavigate: (key: MenuKey) => void;
  role: UserRole;
}

const stats = [
  {
    label: "총 수업 주차",
    value: "16",
    unit: "주",
    icon: <BookOpen size={18} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    trend: "+100%",
  },
  {
    label: "활용 AI 도구",
    value: "6",
    unit: "개",
    icon: <Zap size={18} />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    trend: "GPT·Gamma·Napkin·Felo·Genspark·Geminiami",
  },
  {
    label: "실습 미션",
    value: "16",
    unit: "개",
    icon: <TrendingUp size={18} />,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    trend: "주차별 1개",
  },
  {
    label: "평가 루브릭",
    value: "4",
    unit: "종",
    icon: <Award size={18} />,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    trend: "총 100점 기준",
  },
];

const instructorCards = [
  {
    key: "weekly" as MenuKey,
    title: "16주차 수업 자동 구성",
    desc: "주차별 주제·학습목표·실습·AI 도구·과제·Gamma 프롬프트를 카드 및 표 형태로 확인",
    icon: <BookOpen size={22} />,
    gradient: "from-blue-600 to-blue-800",
    lightBg: "bg-blue-50",
    tags: ["수업설계", "Gamma 프롬프트"],
  },
  {
    key: "tools" as MenuKey,
    title: "AI 도구 매핑",
    desc: "GPT·Gamma·Napkin·Felo·Genspark·Geminiami의 역할과 주차별 활용 전략을 한눈에",
    icon: <Wrench size={22} />,
    gradient: "from-violet-600 to-violet-800",
    lightBg: "bg-violet-50",
    tags: ["6가지 도구", "주차별 매핑"],
  },
  {
    key: "rubric" as MenuKey,
    title: "평가 루브릭 4종",
    desc: "사례분석 보고서·고객여정맵·서비스 회복 시나리오·팀 발표의 100점 기준 루브릭",
    icon: <ClipboardList size={22} />,
    gradient: "from-orange-500 to-orange-700",
    lightBg: "bg-orange-50",
    tags: ["4종 루브릭", "100점 기준"],
  },
  {
    key: "exports" as MenuKey,
    title: "교수자 출력자료",
    desc: "수업계획서·미션 카드·Custom GPT JSON·퀴즈 예시 등 8개 항목 일괄 복사",
    icon: <Globe size={22} />,
    gradient: "from-slate-600 to-slate-800",
    lightBg: "bg-slate-50",
    tags: ["8항목", "Custom GPT JSON"],
  },
];

const studentCards = [
  {
    key: "tutor" as MenuKey,
    title: "학생용 AI 튜터",
    desc: "주차와 질문 유형을 선택하면 개념 설명·발표 프롬프트·실습 안내·퀴즈를 즉시 생성",
    icon: <Sparkles size={22} />,
    gradient: "from-teal-500 to-teal-700",
    lightBg: "bg-teal-50",
    tags: ["8가지 질문 유형", "메모 저장"],
  },
  {
    key: "missions" as MenuKey,
    title: "주차별 실습 미션",
    desc: "고객여정맵·서비스 블루프린트·고객불만 대응·혁신 제안서 등 16개 미션",
    icon: <Users size={22} />,
    gradient: "from-emerald-500 to-emerald-700",
    lightBg: "bg-emerald-50",
    tags: ["16개 미션", "추천 프롬프트"],
  },
  {
    key: "quiz" as MenuKey,
    title: "퀴즈 생성기",
    desc: "OX·객관식·단답형·사례형으로 주차별 복습, 중간·기말고사 대비 퀴즈 제공",
    icon: <Award size={22} />,
    gradient: "from-sky-500 to-sky-700",
    lightBg: "bg-sky-50",
    tags: ["4가지 유형", "정답·해설 제공"],
  },
  {
    key: "tools" as MenuKey,
    title: "AI 도구 활용 가이드",
    desc: "어떤 AI 도구를 언제 어떻게 쓸지 주차·과제별 가이드와 예시 프롬프트 제공",
    icon: <Zap size={22} />,
    gradient: "from-violet-500 to-violet-700",
    lightBg: "bg-violet-50",
    tags: ["6가지 도구", "프롬프트 복사"],
  },
];

const weekHighlights = [
  { week: 3, topic: "고객 경험 관리", tool: "고객여정맵", color: "bg-blue-100 text-blue-700" },
  { week: 7, topic: "서비스 마케팅 전략", tool: "7P 분석", color: "bg-violet-100 text-violet-700" },
  { week: 11, topic: "서비스 실패와 회복", tool: "불만 대응 시나리오", color: "bg-orange-100 text-orange-700" },
  { week: 14, topic: "서비스 혁신과 창의성", tool: "디자인씽킹", color: "bg-teal-100 text-teal-700" },
  { week: 15, topic: "팀 프로젝트 발표", tool: "Gamma 슬라이드", color: "bg-sky-100 text-sky-700" },
];

export function Dashboard({ onNavigate, role }: DashboardProps) {
  const featureCards = role === "instructor" ? instructorCards : studentCards;

  return (
    <div className="space-y-7">
      {/* ── 히어로 배너 ── */}
      <div className="relative bg-gradient-to-br from-[#0a1a3e] via-[#0f2554] to-[#1a3a6e] rounded-2xl overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl" />
          {/* 그리드 패턴 */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-sky-400/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-400/30">
                  <Sparkles size={10} />
                  EduAI Studio 연구소
                </span>
                <span className="bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/10">
                  서비스경영 전용
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                    role === "instructor"
                      ? "bg-blue-400/20 text-blue-300 border-blue-400/30"
                      : "bg-teal-400/20 text-teal-300 border-teal-400/30"
                  }`}
                >
                  {role === "instructor" ? "교수자 모드" : "학생 모드"}
                </span>
              </div>

              <h1 className="text-white text-2xl lg:text-3xl font-bold leading-tight mb-2">
                서비스경영 AI 수업설계
                <br />
                <span className="text-sky-300">통합 플랫폼</span>
              </h1>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-xl">
                EduAI Studio 연구소의 하이브리드 AI 교수설계 모델을 기반으로
                서비스경영 과목의 16주차 수업, AI 도구 활용, 실습, 평가, 챗봇 자료를 통합 관리합니다.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "16주 수업계획 자동 구성",
                  "6가지 AI 도구 주차별 매핑",
                  "학생용 AI 튜터 즉시 사용",
                  "평가 루브릭 4종 제공",
                ].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* 오른쪽: 주요 주차 하이라이트 */}
            <div className="lg:w-64 flex-shrink-0">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">주요 실습 주차</p>
              <div className="space-y-2">
                {weekHighlights.map((h) => (
                  <button
                    key={h.week}
                    onClick={() => onNavigate("weekly")}
                    className="w-full flex items-center gap-3 bg-white/8 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2.5 transition-all group"
                  >
                    <span className="w-7 h-7 bg-white/10 text-white text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                      {h.week}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white/90 text-xs font-semibold truncate">{h.topic}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${h.color}`}>{h.tool}</span>
                    </div>
                    <ChevronRight size={12} className="text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl p-4 border ${s.border} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`${s.bg} ${s.color} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="flex items-end gap-0.5 mb-0.5">
              <span className="text-2xl font-bold text-slate-800">{s.value}</span>
              <span className="text-sm font-semibold text-slate-400 mb-0.5">{s.unit}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* ── 기능 카드 ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            {role === "instructor" ? "교수자 주요 기능" : "학생 주요 기능"}
          </h2>
          <span className="text-xs text-slate-400">
            {role === "instructor" ? "수업설계·평가·출력 도구" : "학습·실습·복습 도구"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map((card) => (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 flex items-start gap-4"
            >
              <div
                className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl text-white flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-sm`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-slate-800 leading-tight">{card.title}</span>
                  <ArrowRight
                    size={14}
                    className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">{card.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── AI 도구 미리보기 ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">활용 AI 도구 한눈에 보기</h3>
          <button
            onClick={() => onNavigate("tools")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            자세히 보기 <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "GPT", icon: "🤖", color: "bg-emerald-50 border-emerald-200 text-emerald-700", desc: "개념·전략·피드백" },
            { name: "Gamma", icon: "🎨", color: "bg-violet-50 border-violet-200 text-violet-700", desc: "발표자료 생성" },
            { name: "Napkin", icon: "📊", color: "bg-orange-50 border-orange-200 text-orange-700", desc: "프로세스 시각화" },
            { name: "Felo", icon: "🎭", color: "bg-blue-50 border-blue-200 text-blue-700", desc: "고객 시뮬레이션" },
            { name: "Genspark", icon: "💡", color: "bg-pink-50 border-pink-200 text-pink-700", desc: "인터뷰·시나리오" },
            { name: "Geminiami", icon: "📝", color: "bg-indigo-50 border-indigo-200 text-indigo-700", desc: "퀴즈·평가 문항" },
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => onNavigate("tools")}
              className={`rounded-xl border p-3 text-center hover:shadow-sm transition-all ${t.color} hover:scale-102`}
            >
              <div className="text-2xl mb-1.5">{t.icon}</div>
              <p className="text-xs font-bold">{t.name}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── 안내 배너 ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-0.5">사용 안내</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            본 프로그램은 서비스경영 수업설계와 학습지원을 위한 교육용 도구입니다.
            실제 기관 컨설팅이나 고객 데이터 분석에 적용할 경우 교수자의 검토가 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
