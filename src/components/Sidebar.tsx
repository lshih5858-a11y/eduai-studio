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
}

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "홈 대시보드", icon: <LayoutDashboard size={18} /> },
  { key: "weekly", label: "16주차 수업설계", icon: <CalendarDays size={18} /> },
  { key: "tools", label: "AI 도구 매핑", icon: <Wrench size={18} /> },
  { key: "missions", label: "주차별 실습 미션", icon: <Target size={18} /> },
  { key: "tutor", label: "학생용 AI 튜터", icon: <MessageSquare size={18} /> },
  { key: "quiz", label: "퀴즈 생성기", icon: <HelpCircle size={18} /> },
  { key: "rubric", label: "평가 루브릭", icon: <ClipboardList size={18} /> },
  { key: "exports", label: "교수자 출력자료", icon: <FileOutput size={18} /> },
];

interface SidebarProps {
  active: MenuKey;
  onSelect: (key: MenuKey) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onSelect, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f2554] z-30 flex flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* 로고 영역 */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              EA
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">EduAI Studio</p>
              <p className="text-sky-300 text-xs">서비스경영 AI 설계</p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onSelect(item.key); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                active === item.key
                  ? "bg-sky-500 text-white"
                  : "text-blue-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={active === item.key ? "text-white" : "text-sky-300"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-white/10">
          <p className="text-blue-200/60 text-xs text-center leading-relaxed">
            EduAI Studio 연구소
            <br />
            전공 맞춤형 AI 수업설계 플랫폼
          </p>
        </div>
      </aside>
    </>
  );
}
