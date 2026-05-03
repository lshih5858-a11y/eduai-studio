import { useState } from "react";
import { Sidebar, type MenuKey } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { WeeklyPlan } from "./components/WeeklyPlan";
import { ToolMapping } from "./components/ToolMapping";
import { MissionBoard } from "./components/MissionBoard";
import { StudentTutor } from "./components/StudentTutor";
import { QuizGenerator } from "./components/QuizGenerator";
import { RubricBoard } from "./components/RubricBoard";
import { TeacherExports } from "./components/TeacherExports";
import { Menu, X, Search } from "lucide-react";
import { weeklyPlan } from "./data/weeklyPlan";
import { aiTools } from "./data/aiTools";

const menuLabels: Record<MenuKey, string> = {
  dashboard: "홈 대시보드",
  weekly: "16주차 수업설계",
  tools: "AI 도구 매핑",
  missions: "주차별 실습 미션",
  tutor: "학생용 AI 튜터",
  quiz: "퀴즈 생성기",
  rubric: "평가 루브릭",
  exports: "교수자 출력자료",
};

interface SearchResult {
  type: string;
  title: string;
  desc: string;
  key: MenuKey;
}

function globalSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  weeklyPlan.forEach((w) => {
    if (
      w.topic.includes(query) ||
      w.concepts.some((c) => c.includes(query)) ||
      w.tools.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        type: "주차",
        title: `${w.week}주차: ${w.topic}`,
        desc: w.objective,
        key: "weekly",
      });
    }
  });

  aiTools.forEach((t) => {
    if (t.name.toLowerCase().includes(q) || t.role.includes(query)) {
      results.push({
        type: "AI 도구",
        title: t.name,
        desc: t.role,
        key: "tools",
      });
    }
  });

  return results.slice(0, 6);
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSearchResults(globalSearch(q));
  };

  const handleSearchSelect = (result: SearchResult) => {
    setActiveMenu(result.key);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard": return <Dashboard onNavigate={setActiveMenu} />;
      case "weekly": return <WeeklyPlan />;
      case "tools": return <ToolMapping />;
      case "missions": return <MissionBoard />;
      case "tutor": return <StudentTutor />;
      case "quiz": return <QuizGenerator />;
      case "rubric": return <RubricBoard />;
      case "exports": return <TeacherExports />;
      default: return <Dashboard onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 사이드바 */}
      <Sidebar
        active={activeMenu}
        onSelect={setActiveMenu}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <span className="text-xs text-slate-400">EduAI Studio</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="text-sm font-semibold text-slate-700">{menuLabels[activeMenu]}</span>
          </div>

          {/* 검색 */}
          <div className="flex-1 max-w-md ml-auto relative">
            {showSearch ? (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="주제, 개념, AI 도구 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={() => setTimeout(() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }, 200)}
                  className="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSelect(r)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-0"
                      >
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">{r.type}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{r.title}</p>
                          <p className="text-xs text-slate-500 truncate">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <Search size={14} />
                <span className="hidden sm:inline">검색...</span>
              </button>
            )}
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
            {renderContent()}
          </div>

          {/* 푸터 */}
          <footer className="border-t border-slate-200 bg-white mt-8">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-slate-500 font-medium">
                EduAI Studio 연구소 | 전공 맞춤형 AI 수업설계 플랫폼
              </p>
              <p className="text-xs text-slate-400 text-center sm:text-right">
                서비스경영 과목을 위한 AI 기반 16주차 수업설계·실습·챗봇·평가 통합 플랫폼
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
