import { ExternalLink, Bot, BookOpen, Info } from "lucide-react";

const GPT_URL = "https://chatgpt.com/g/g-6841183512d481918cbe7a215cdfc926";
const LMS_URL = "https://www.inha.ac.kr/kr/1537/subview.do";

function LinkButton({ url, label }: { url: string; label: string }) {
  const isPlaceholder = !url || url.startsWith("[") || url === "";
  if (isPlaceholder) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200">
        <ExternalLink size={14} />
        링크가 아직 설정되지 않았습니다
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0f2554] text-white hover:bg-[#1e3a8a] transition-colors shadow-sm hover:shadow-md"
    >
      <ExternalLink size={14} />
      {label}
    </a>
  );
}

export function ExternalLinks() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">외부 학습 링크</h2>
        <p className="text-sm text-slate-500">
          서비스경영 수업에서 학생들이 자주 사용하는 GPT 챗봇과 대학 LMS를 한 곳에서 바로 연결합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* 카드 1: 서비스경영 AI 챗봇 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs font-semibold">Custom GPT</p>
                <h3 className="text-white font-bold text-lg leading-tight">서비스경영 AI 챗봇</h3>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              서비스경영 수업의 주차별 개념 설명, Gamma 프롬프트, 퀴즈, 과제 피드백을 받을 수 있는 Custom GPT 챗봇입니다.
            </p>
            <div className="space-y-2 text-xs text-slate-500">
              {["주차별 개념 설명", "발표자료 프롬프트 안내", "퀴즈 생성 및 해설", "과제 작성 방향 피드백", "서비스 사례 분석 지원"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="pt-2">
              <LinkButton url={GPT_URL} label="챗봇 열기" />
            </div>
          </div>
        </div>

        {/* 카드 2: 인하대학교 학생 LMS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-br from-[#0a1a3e] to-[#1e3a8a] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold">인하대학교</p>
                <h3 className="text-white font-bold text-lg leading-tight">학생 LMS</h3>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              학생들이 강의자료, 공지사항, 과제 제출, 평가 안내를 확인할 수 있는 대학 LMS입니다.
            </p>
            <div className="space-y-2 text-xs text-slate-500">
              {["공식 강의자료 확인", "과제 제출", "공지사항 확인", "평가 기준 확인", "교수자 피드백 확인"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="pt-2">
              <LinkButton url={LMS_URL} label="LMS 열기" />
            </div>
          </div>
        </div>

        {/* 카드 3: 학생 이용 안내 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden md:col-span-2 xl:col-span-1">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Info size={24} className="text-white" />
              </div>
              <div>
                <p className="text-amber-100 text-xs font-semibold">이용 방법</p>
                <h3 className="text-white font-bold text-lg leading-tight">학생 이용 안내</h3>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { num: "1", text: "수업 개념이 어려우면 서비스경영 AI 챗봇에서 주차별 개념 설명을 먼저 확인합니다." },
              { num: "2", text: "과제 제출, 공지사항, 성적 확인은 대학 LMS에서 확인합니다." },
              { num: "3", text: "챗봇 답변은 학습 보조용이며, 최종 과제 제출 기준은 교수자의 LMS 공지와 수업 안내를 따릅니다." },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.num}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                ⚠️ AI 챗봇은 학습 보조 도구이며, 과제 제출과 공식 평가는 반드시 LMS 공지를 기준으로 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 링크 바 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-3 text-sm">빠른 바로가기</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={GPT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Bot size={15} />
            서비스경영 AI 챗봇 열기
            <ExternalLink size={12} className="opacity-60" />
          </a>
          <a
            href={LMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
          >
            <BookOpen size={15} />
            인하대학교 LMS 열기
            <ExternalLink size={12} className="opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
