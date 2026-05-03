import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Target,
  MessageSquare,
  HelpCircle,
  ClipboardList,
  FileOutput,
} from "lucide-react";
import type { UserRole } from "../App";

export type MenuKey =
  | "dashboard"
  | "weekly"
  | "tools"
  | "missions"
  | "tutor"
  | "quiz"
  | "rubric"
  | "exports";

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: React.ReactNode;
  audience: "both" | "instructor" | "student";
  badge?: string;
}

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "홈 대시보드", icon: <LayoutDashboard size={17} />, audience: "both" },
  { key: "weekly", label: "16주차 수업설계", icon: <CalendarDays size={17} />, audience: "instructor", badge: "교수" },
  { key: "tools", label: "AI 도구 매핑", icon: <Wrench size={17} />, audience: "both" },
  { key: "missions", label: "주차별 실습 미션", icon: <Target size={17} />, audience: "both" },
  { key: "tutor", label: "학생용 AI 튜터", icon: <MessageSquare size={17} />, audience: "student", badge: "학생" },
  { key: "quiz", label: "퀴즈 생성기", icon: <HelpCircle size={17} />, audience: "both" },
  { key: "rubric", label: "평가 루브릭", icon: <ClipboardList size={17} />, audience: "instructor", badge: "교수" },
  { key: "exports", label: "교수자 출력자료", icon: <FileOutput size={17} />, audience: "instructor", badge: "교수" },
];

interface SidebarProps {
  active: MenuKey;
  onSelect: (key: MenuKey) => void;
  role: UserRole;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onSelect, role, mobileOpen, onClose }: SidebarProps) {
  const visibleItems = menuItems.filter(
    (item) => item.audience === "both" || item.audience === (role === "instructor" ? "instructor" : "student")
  );

  const instructorItems = visibleItems.filter(
    (i) => i.audience === "instructor" || (i.audience === "both" && role === "instructor")
  );
  const studentItems = visibleItems.filter(
    (i) => i.audience === "student" || (i.audience === "both" && role === "student")
  );
  const sharedItems = visibleItems.filter((i) => i.audience === "both");

  const groupedItems =
    role === "instructor"
      ? [
          { label: null, items: [menuItems[0]] },
          { label: "수업 설계", items: [menuItems[1], menuItems[2], menuItems[3]] },
          { label: "평가 & 자료", items: [menuItems[5], menuItems[6], menuItems[7]] },
        ]
      : [
          { label: null, items: [menuItems[0]] },
          { label: "학습 도구", items: [menuItems[2], menuItems[3], menuItems[4], menuItems[5]] },
        ];

  void instructorItems;
  void studentItems;
  void sharedItems;

  const badgeColors: Record<string, string> = {
    교수: "bg-blue-500/20 text-blue-200",
    학생: "bg-teal-500/20 text-teal-200",
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0a1a3e] z-30 flex flex-col transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* 로고 */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              EA
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight tracking-wide">EduAI Studio</p>
              <p className="text-sky-400/80 text-xs mt-0.5">서비스경영 AI 설계</p>
            </div>
          </div>
        </div>

        {/* 역할 표시 */}
        <div className="px-4 py-3 border-b border-white/10">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              role === "instructor"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-teal-500/20 text-teal-300"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${role === "instructor" ? "bg-blue-400" : "bg-teal-400"} animate-pulse`} />
            {role === "instructor" ? "교수자 모드" : "학생 모드"}
          </div>
        </div>

        {/* 메뉴 그룹 */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1">
          {groupedItems.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { onSelect(item.key); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 rounded-none ${
                    active === item.key
                      ? "bg-blue-600/90 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white/90"
                  }`}
                >
                  <span className={`flex-shrink-0 ${active === item.key ? "text-white" : "text-sky-400/70"}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${badgeColors[item.badge] || ""}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-[10px] text-center leading-relaxed">
              EduAI Studio 연구소
              <br />
              전공 맞춤형 AI 수업설계 플랫폼
              <br />
              <span className="text-white/20">v2.0 — 서비스경영 전용</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
