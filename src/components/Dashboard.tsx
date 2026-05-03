import { BookOpen, Wrench, Users, ClipboardList, TrendingUp, Award, Zap, Globe } from "lucide-react";
import type { MenuKey } from "./Sidebar";

interface DashboardProps {
  onNavigate: (key: MenuKey) => void;
}

const stats = [
  { label: "총 주차", value: "16주", icon: <BookOpen size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "활용 AI 도구", value: "6개", icon: <Zap size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "실습 미션", value: "16개", icon: <Target size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "기본 루브릭", value: "4종", icon: <Award size={20} />, color: "text-orange-600", bg: "bg-orange-50" },
];

function Target({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

const cards = [
  {
    key: "weekly" as MenuKey,
    title: "16주차 수업 자동 구성",
    desc: "서비스경영 주차별 주제, 학습목표, 실습, 과제를 확인",
    icon: <BookOpen size={24} />,
    color: "from-blue-500 to-blue-700",
    badge: "수업설계",
  },
  {
    key: "tools" as MenuKey,
    title: "AI 도구 매핑",
    desc: "GPT, Gamma, Napkin, Felo, Genspark, Geminiami를 주차별로 배치",
    icon: <Wrench size={24} />,
    color: "from-purple-500 to-purple-700",
    badge: "AI 도구",
  },
  {
    key: "missions" as MenuKey,
    title: "학생 실습 지원",
    desc: "고객여정맵, 서비스 블루프린트, 고객불만 대응, 서비스 혁신 과제 지원",
    icon: <Users size={24} />,
    color: "from-emerald-500 to-emerald-700",
    badge: "실습",
  },
  {
    key: "rubric" as MenuKey,
    title: "평가 루브릭",
    desc: "발표, 과제, 실습보고서, 팀 프로젝트 평가 기준 제공",
    icon: <ClipboardList size={24} />,
    color: "from-orange-500 to-orange-600",
    badge: "평가",
  },
];

const features = [
  { icon: <TrendingUp size={16} />, text: "16주 전체 수업계획 자동 구성" },
  { icon: <Zap size={16} />, text: "6가지 AI 도구 주차별 매핑" },
  { icon: <Globe size={16} />, text: "학생용 AI 튜터 예시 답변 제공" },
  { icon: <Award size={16} />, text: "4종 평가 루브릭 복사 지원" },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-[#0f2554] via-[#1e3a8a] to-[#1d4ed8] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-sky-300 transform translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sky-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              EduAI Studio 연구소
            </span>
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">
              서비스경영 전용
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">서비스경영 AI 수업설계 통합 플랫폼</h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            EduAI Studio 연구소의 하이브리드 AI 교수설계 모델을 기반으로 서비스경영 과목의 16주차 수업,
            AI 도구 활용, 실습, 평가, 챗봇 자료를 통합 관리합니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-white/15 text-xs text-blue-100 px-3 py-1 rounded-full">
                {f.icon}
                {f.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`${s.bg} ${s.color} p-2 rounded-lg`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 기능 카드 */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-3">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl text-white flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{card.title}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{card.badge}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm leading-relaxed">
          <span className="font-semibold">⚠️ 사용 안내</span>
          {" "}본 프로그램은 서비스경영 수업설계와 학습지원을 위한 교육용 도구입니다.
          실제 기관 컨설팅이나 고객 데이터 분석에 적용할 경우 교수자의 검토가 필요합니다.
        </p>
      </div>
    </div>
  );
}
