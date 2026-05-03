import { useState } from "react";
import { aiTools } from "../data/aiTools";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";

const toolAccent: Record<string, { border: string; headerBg: string; dot: string }> = {
  gpt: { border: "border-t-emerald-500", headerBg: "bg-emerald-50", dot: "bg-emerald-500" },
  gamma: { border: "border-t-violet-500", headerBg: "bg-violet-50", dot: "bg-violet-500" },
  napkin: { border: "border-t-orange-500", headerBg: "bg-orange-50", dot: "bg-orange-500" },
  felo: { border: "border-t-blue-500", headerBg: "bg-blue-50", dot: "bg-blue-500" },
  genspark: { border: "border-t-pink-500", headerBg: "bg-pink-50", dot: "bg-pink-500" },
  geminiami: { border: "border-t-indigo-500", headerBg: "bg-indigo-50", dot: "bg-indigo-500" },
};

const weeklyToolMap: Record<string, string[]> = {};
weeklyPlan.forEach((w) => {
  w.tools.forEach((t) => {
    if (!weeklyToolMap[t]) weeklyToolMap[t] = [];
    weeklyToolMap[t].push(`${w.week}주`);
  });
});

export function ToolMapping() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI 도구 매핑</h2>
        <p className="text-sm text-slate-500">서비스경영 수업에서 활용하는 6가지 AI 도구의 역할과 주차별 적용 방법을 확인하세요.</p>
      </div>

      {/* 도구 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {aiTools.map((tool) => {
          const accent = toolAccent[tool.id] || { border: "border-t-gray-400", headerBg: "bg-gray-50", dot: "bg-gray-400" };
          const isSelected = selected === tool.id;
          const weekTags = weeklyToolMap[tool.name] || [];

          return (
            <div
              key={tool.id}
              className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden border-t-4 ${accent.border} transition-all duration-200 ${isSelected ? "ring-2 ring-blue-300 shadow-md" : "hover:shadow-md"}`}
            >
              {/* 도구 헤더 */}
              <div className={`${accent.headerBg} px-5 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <h3 className={`font-bold text-lg ${tool.color}`}>{tool.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
                        <span className="text-xs text-slate-500">AI 수업 도구</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(isSelected ? null : tool.id)}
                    className="text-xs text-slate-500 hover:text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                  >
                    {isSelected ? "접기" : "상세"}
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* 주요 역할 */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">주요 역할</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{tool.role}</p>
                </div>

                {/* 적용 주차 태그 */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">적용 주차</p>
                  <div className="flex flex-wrap gap-1.5">
                    {weekTags.length > 12 ? (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tool.bgColor} ${tool.color} border ${tool.borderColor}`}>
                        전 주차 (1~16주) 공통 활용
                      </span>
                    ) : (
                      weekTags.map((tag) => {
                        const weekNum = parseInt(tag);
                        const weekData = weeklyPlan.find((w) => w.week === weekNum);
                        return (
                          <div
                            key={tag}
                            className={`group relative`}
                            title={weekData ? weekData.topic : ""}
                          >
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tool.bgColor} ${tool.color} border ${tool.borderColor} cursor-default`}>
                              {tag}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {weekTags.length <= 12 && weekTags.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {weekTags.map((tag) => {
                        const weekNum = parseInt(tag);
                        const weekData = weeklyPlan.find((w) => w.week === weekNum);
                        return weekData ? (
                          <p key={tag} className="text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-500">{tag}</span> — {weekData.topic}
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* 예시 프롬프트 */}
                <div className={`${tool.bgColor} rounded-xl p-3 border ${tool.borderColor}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-600">예시 프롬프트</p>
                    <CopyButton text={tool.examplePrompt} />
                  </div>
                  <p className={`text-sm ${tool.color} leading-relaxed`}>"{tool.examplePrompt}"</p>
                </div>

                {/* 상세 기능 (펼침 시) */}
                {isSelected && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">세부 활용 기능</p>
                      <ul className="space-y-1.5">
                        {tool.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">💡 활용 팁</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{tool.tips}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 주차 × 도구 매핑 매트릭스 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">주차별 AI 도구 활용 매트릭스</h3>
          <p className="text-xs text-slate-500 mt-0.5">● 표시된 주차에서 해당 도구를 활용합니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0f2554]">
                <th className="px-4 py-3 text-left text-xs font-bold text-white/80 w-28">AI 도구</th>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                  <th key={w} className="px-2 py-3 text-center text-xs font-semibold text-white/60 min-w-8">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiTools.map((tool, i) => (
                <tr key={tool.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                  <td className={`px-4 py-2.5 font-bold text-sm ${tool.color} whitespace-nowrap`}>
                    <span className="mr-1.5">{tool.icon}</span>
                    {tool.name}
                  </td>
                  {Array.from({ length: 16 }, (_, j) => j + 1).map((w) => (
                    <td key={w} className="px-2 py-2.5 text-center">
                      {tool.applicableWeeks.includes(w) ? (
                        <span className={`inline-block w-5 h-5 rounded text-[10px] font-bold ${tool.bgColor} ${tool.color} flex items-center justify-center`}>
                          ●
                        </span>
                      ) : (
                        <span className="text-slate-200 text-xs">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 도구별 주차 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {aiTools.map((tool) => {
          const weeks = weeklyToolMap[tool.name] || [];
          return (
            <div key={tool.id} className={`bg-white border ${tool.borderColor} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{tool.icon}</span>
                <span className={`font-bold text-sm ${tool.color}`}>{tool.name}</span>
                <span className={`ml-auto text-xs ${tool.bgColor} ${tool.color} px-2 py-0.5 rounded-full font-semibold border ${tool.borderColor}`}>
                  {weeks.length}주차 활용
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {weeks.map((w) => (
                  <span key={w} className={`text-[10px] px-1.5 py-0.5 rounded ${tool.bgColor} ${tool.color} font-semibold`}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
