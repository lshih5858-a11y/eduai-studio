import { useState, useCallback } from "react";
import { Sidebar, type MenuKey } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { WeeklyPlan } from "./components/WeeklyPlan";
import { ToolMapping } from "./components/ToolMapping";
import { MissionBoard } from "./components/MissionBoard";
import { StudentTutor } from "./components/StudentTutor";
import { QuizGenerator } from "./components/QuizGenerator";
import { RubricBoard } from "./components/RubricBoard";
import { TeacherExports } from "./components/TeacherExports";
import { ExternalLinks } from "./components/ExternalLinks";
import { Menu, Search, X, GraduationCap, BookOpen } from "lucide-react";
import { weeklyPlan } from "./data/weeklyPlan";
import { aiTools } from "./data/aiTools";

export type UserRole = "instructor" | "student";

const menuLabels: Record<MenuKey, string> = {
  dashboard: "홈 대시보드",
  weekly: "16주차 수업설계",
  tools: "AI 도구 매핑",
  missions: "주차별 실습 미션",
  tutor: "학생용 AI 튜터",
  quiz: "퀴즈 생성기",
  rubric: "평가 루브릭",
  exports: "교수자 출력자료",
  links: "외부 학습 링크",
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
        type: "수업",
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

  const linkKeywords = ["챗봇", "gpt", "lms", "인하대", "인하대학교", "외부 링크", "바로가기"];
  if (linkKeywords.some((kw) => q.includes(kw) || kw.includes(q))) {
    results.push({
      type: "외부 링크",
      title: "외부 학습 링크",
      desc: "서비스경영 AI 챗봇 · 인하대학교 LMS 바로가기",
      key: "links",
    });
  }

  return results.slice(0, 8);
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("dashboard");
  const [role, setRole] = useState<UserRole>("instructor");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setSearchResults(globalSearch(q));
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    setActiveMenu(result.key);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleNavigate = useCallback((key: MenuKey) => {
    setActiveMenu(key);
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard": return <Dashboard onNavigate={handleNavigate} role={role} />;
      case "weekly": return <WeeklyPlan />;
      case "tools": return <ToolMapping />;
      case "missions": return <MissionBoard />;
      case "tutor": return <StudentTutor />;
      case "quiz": return <QuizGenerator />;
      case "rubric": return <RubricBoard />;
      case "exports": return <TeacherExports />;
      case "links": return <ExternalLinks />;
      default: return <Dashboard onNavigate={handleNavigate} role={role} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active={activeMenu}
        onSelect={setActiveMenu}
        role={role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0 z-10 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="메뉴 열기"
          >
            <Menu size={20} />
          </button>

          {/* 브레드크럼 */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">EduAI Studio</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-700">{menuLabels[activeMenu]}</span>
          </div>

          {/* 역할 전환 토글 */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 ml-auto">
            <button
              onClick={() => setRole("instructor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                role === "instructor"
                  ? "bg-[#0f2554] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BookOpen size={12} />
              <span className="hidden sm:inline">교수자</span>
            </button>
            <button
              onClick={() => setRole("student")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                role === "student"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap size={12} />
              <span className="hidden sm:inline">학생</span>
            </button>
          </div>

          {/* 검색 */}
          <div className="relative">
            {showSearch ? (
              <div className="relative w-56 sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="주제, 개념, AI 도구 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={() =>
                    setTimeout(() => {
                      setShowSearch(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }, 200)
                  }
                  className="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSelect(r)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                          {r.type}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
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
                aria-label="검색"
              >
                <Search size={14} />
                <span className="hidden sm:inline text-xs">검색</span>
              </button>
            )}
          </div>
        </header>

        {/* 역할 안내 배너 */}
        <div
          className={`px-4 lg:px-6 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
            role === "instructor"
              ? "bg-blue-50 text-blue-700 border-b border-blue-100"
              : "bg-teal-50 text-teal-700 border-b border-teal-100"
          }`}
        >
          {role === "instructor" ? (
            <>
              <BookOpen size={12} />
              교수자 모드 — 수업설계, AI 도구 매핑, 평가 루브릭, 출력자료를 모두 이용할 수 있습니다.
            </>
          ) : (
            <>
              <GraduationCap size={12} />
              학생 모드 — AI 튜터, 퀴즈, 실습 미션에 집중할 수 있습니다.
            </>
          )}
        </div>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
            {renderContent()}
          </div>

          {/* 푸터 */}
          <footer className="border-t border-slate-200 bg-white mt-4">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-slate-500 font-semibold">
                EduAI Studio 연구소 | 전공 맞춤형 AI 수업설계 플랫폼
              </p>
              <p className="text-xs text-slate-400 text-center sm:text-right leading-relaxed">
                본 프로그램은 서비스경영 수업설계와 학습지원을 위한 교육용 도구입니다.
                <br className="hidden sm:block" />
                실제 기관 컨설팅이나 고객 데이터 분석에 적용 시 교수자의 검토가 필요합니다.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
