import { aiTools } from "../data/aiTools";
import { CopyButton } from "./CopyButton";

const toolBorderColors: Record<string, string> = {
  gpt: "border-t-emerald-500",
  gamma: "border-t-purple-500",
  napkin: "border-t-orange-500",
  felo: "border-t-blue-500",
  genspark: "border-t-pink-500",
  geminiami: "border-t-indigo-500",
};

export function ToolMapping() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI 도구 매핑</h2>
        <p className="text-sm text-slate-500">서비스경영 수업에서 활용하는 6가지 AI 도구와 주차별 적용 방법을 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {aiTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden border-t-4 ${toolBorderColors[tool.id]}`}
          >
            <div className={`${tool.bgColor} px-5 py-4`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className={`font-bold text-lg ${tool.color}`}>{tool.name}</h3>
                  <p className="text-xs text-slate-500">AI 수업 도구</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 역할 */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">주요 기능</p>
                <p className="text-sm text-slate-700 leading-relaxed">{tool.role}</p>
              </div>

              {/* 세부 기능 */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">활용 영역</p>
                <ul className="space-y-1">
                  {tool.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${tool.bgColor.replace("bg-", "bg-").replace("-50", "-400")}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 적용 주차 태그 */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">추천 주차</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.applicableWeeks.length > 8 ? (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">전 주차 (1~16주)</span>
                  ) : (
                    tool.applicableWeeks.map((w) => (
                      <span key={w} className={`text-xs px-2 py-0.5 rounded-full ${tool.bgColor} ${tool.color} border ${tool.borderColor}`}>
                        {w}주
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* 예시 프롬프트 */}
              <div className={`${tool.bgColor} rounded-lg p-3 border ${tool.borderColor}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-600">예시 프롬프트</p>
                  <CopyButton text={tool.examplePrompt} />
                </div>
                <p className={`text-sm ${tool.color} leading-relaxed`}>"{tool.examplePrompt}"</p>
              </div>

              {/* 팁 */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-1">💡 활용 팁</p>
                <p className="text-xs text-slate-600 leading-relaxed">{tool.tips}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 도구별 주차 매핑 요약 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">도구별 주차 활용 요약</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs">AI 도구</th>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                  <th key={w} className="px-2 py-3 text-center font-semibold text-slate-500 text-xs">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiTools.map((tool, i) => (
                <tr key={tool.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className={`px-4 py-2 font-semibold text-sm ${tool.color}`}>{tool.name}</td>
                  {Array.from({ length: 16 }, (_, j) => j + 1).map((w) => (
                    <td key={w} className="px-2 py-2 text-center">
                      {tool.applicableWeeks.includes(w) ? (
                        <span className={`inline-block w-5 h-5 rounded text-xs font-bold ${tool.bgColor} ${tool.color} flex items-center justify-center`}>●</span>
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
    </div>
  );
}
