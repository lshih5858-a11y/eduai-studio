const professorSteps = [
  { step: '01', icon: '📝', label: '수업 주제 입력', desc: '과목명·주차·대상 학생 입력', color: 'from-blue-500 to-blue-600' },
  { step: '02', icon: '🛠️', label: 'AI 도구 선택', desc: 'GPT·Gemini·Gamma 선택', color: 'from-indigo-500 to-indigo-600' },
  { step: '03', icon: '⚡', label: '프롬프트 생성', desc: '맞춤 프롬프트 자동 완성', color: 'from-violet-500 to-violet-600' },
  { step: '04', icon: '🎓', label: '학생 실습 진행', desc: 'AI 결과 기반 팀 활동', color: 'from-emerald-500 to-emerald-600' },
  { step: '05', icon: '✅', label: '산출물 평가', desc: '루브릭 기반 성과 피드백', color: 'from-orange-500 to-orange-600' },
]

const studentSteps = [
  { step: '01', icon: '🔍', label: '문제 이해', desc: '수업 주제·과제 파악', color: 'from-teal-500 to-teal-600' },
  { step: '02', icon: '🤖', label: 'AI 프롬프트 실행', desc: '생성 프롬프트 AI에 입력', color: 'from-blue-500 to-blue-600' },
  { step: '03', icon: '🔎', label: '결과 검토', desc: 'AI 출력 비판적 검토·수정', color: 'from-amber-500 to-amber-600' },
  { step: '04', icon: '📦', label: '제출', desc: '보고서·발표자료 완성 제출', color: 'from-rose-500 to-rose-600' },
]

const quickMenus = [
  { icon: '📚', title: '강의안·사례 발굴', desc: '주제 입력 → GPT·Gemini 프롬프트 즉시 생성', menu: 'lecture', tag: '교수자', tagColor: 'bg-blue-100 text-blue-700', border: 'border-t-blue-500' },
  { icon: '💡', title: '프로젝트 아이디어', desc: '산업·문제 입력 → 아이디어 5개·BMC 자동 생성', menu: 'project', tag: '학생·팀', tagColor: 'bg-emerald-100 text-emerald-700', border: 'border-t-emerald-500' },
  { icon: '📊', title: '데이터 분석·코딩', desc: 'Excel·Python 분석 프롬프트 즉시 제공', menu: 'data', tag: '학생', tagColor: 'bg-orange-100 text-orange-700', border: 'border-t-orange-500' },
  { icon: '📑', title: '피치덱·보고서', desc: 'Gamma 프롬프트·발표 대본·1페이지 요약 자동화', menu: 'pitch', tag: '팀', tagColor: 'bg-purple-100 text-purple-700', border: 'border-t-purple-500' },
  { icon: '🤝', title: '팀 코칭 에이전트', desc: '진행 단계별 코칭·갈등 조정·점검표', menu: 'coaching', tag: '팀', tagColor: 'bg-pink-100 text-pink-700', border: 'border-t-pink-500' },
  { icon: '🤖', title: 'AI 튜터·시뮬레이션', desc: 'Opal·Gemini 기반 에이전트 설계 가이드', menu: 'agent', tag: '고급', tagColor: 'bg-indigo-100 text-indigo-700', border: 'border-t-indigo-500' },
]

const tools = [
  { name: 'ChatGPT', icon: '🧠', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Gemini', icon: '✨', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Gamma', icon: '🎨', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Perplexity', icon: '🔍', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Napkin AI', icon: '📐', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Python·Colab', icon: '🐍', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Opal', icon: '💎', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Felo', icon: '🌐', color: 'bg-red-50 text-red-700 border-red-200' },
]

const outputs = ['강의안', '기업 사례', '아이디어 후보', 'Python 코드', '피치덱', '보고서', '코칭 피드백', '루브릭', '안내문']

export default function Dashboard({ mode, setActive }) {
  return (
    <div className="space-y-6">

      {/* 히어로 배너 */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)' }}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
                <span className="text-xs font-bold tracking-widest text-blue-300 uppercase">EduAI Studio</span>
                <span className="text-blue-300/60 text-xs">|</span>
                <span className="text-xs text-blue-200/80">경영학 AI 수업 운영 플랫폼</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                Business AI Class Studio
              </h2>
              <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed max-w-xl">
                경영학 수업에서 생성형 AI를 강의 준비, 사례 발굴, 데이터 분석,<br className="hidden sm:block" />
                프로젝트 코칭, 발표자료 제작에 즉시 활용하는 실습 플랫폼입니다.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['⚠️ AI 결과 교수자 검토 필수', '🔒 개인정보 미저장', '📋 AI 윤리 준수'].map(t => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/20">{t}</span>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white/10 border border-white/20 shrink-0">
              <span className="text-4xl">🎓</span>
              <span className="text-white/60 text-xs mt-1 font-medium">v2.0</span>
            </div>
          </div>
        </div>

        {/* 생성 가능한 산출물 바 */}
        <div className="bg-white/5 border-t border-white/10 px-6 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/50 font-semibold uppercase tracking-wide shrink-0">생성 가능:</span>
          {outputs.map(o => (
            <span key={o} className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-medium">{o}</span>
          ))}
        </div>
      </div>

      {/* 모드별 안내 배너 */}
      {mode === 'professor' && (
        <div className="card border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
            <span className="text-lg">👨‍🏫</span>
            <span><strong>교수자 모드</strong> — 강의안 생성, 사례 발굴, 평가 루브릭, 16주차 수업 운영표를 활용하여 수업을 설계하세요.</span>
          </p>
        </div>
      )}
      {mode === 'student' && (
        <div className="card border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
          <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span><strong>학생 모드</strong> — 프로젝트 아이디어, 데이터 분석, 피치덱 자동화로 과제를 완성하세요.</span>
          </p>
        </div>
      )}
      {mode === 'team' && (
        <div className="card border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white">
          <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span><strong>팀 프로젝트 모드</strong> — 팀 코칭 에이전트, 역할 분담, 발표자료 제작을 함께 활용하세요.</span>
          </p>
        </div>
      )}

      {/* 수업 흐름 - 2열 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 교수자 사용 흐름 - 5단계 */}
        <div className="card-elevated">
          <h3 className="section-title text-base">
            <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-base shrink-0">👨‍🏫</span>
            교수자 사용 흐름 (5단계)
          </h3>
          <div className="space-y-2">
            {professorSteps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-3 group">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm`}>
                  {s.step}
                </div>
                <div className={`flex-1 flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all`}>
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
                {i < professorSteps.length - 1 && (
                  <span className="text-slate-300 text-xs absolute ml-[15px] mt-9">▼</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setActive('lecture')}
            className="btn-primary w-full mt-4 text-sm"
          >
            강의안 생성 시작하기 →
          </button>
        </div>

        {/* 학생 실습 흐름 - 4단계 */}
        <div className="card-elevated">
          <h3 className="section-title text-base">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-base shrink-0">🎓</span>
            학생 실습 흐름 (4단계)
          </h3>
          <div className="space-y-2 mb-4">
            {studentSteps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-3 group">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm`}>
                  {s.step}
                </div>
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50/50 transition-all">
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 오늘의 수업 정보 카드 */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">📅 오늘 수업 정보</p>
            <div className="space-y-1.5">
              {[
                { label: '수업 주제', value: 'AI 기반 비즈니스 모델 설계' },
                { label: '이번 주 목표', value: 'GPT로 아이디어 검증하기' },
                { label: '추천 도구', value: 'ChatGPT · Gamma · Napkin' },
                { label: '프로젝트 단계', value: '아이디어 도출 → 검증' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xs text-emerald-500 w-20 shrink-0">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActive('project')}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
          >
            프로젝트 아이디어 시작하기 →
          </button>
        </div>
      </div>

      {/* 주요 기능 카드 6개 */}
      <div>
        <h3 className="section-title">⚡ 기능 바로가기</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickMenus.map(item => (
            <button
              key={item.menu}
              onClick={() => setActive(item.menu)}
              className={`card border-t-4 ${item.border} text-left hover:shadow-md transition-all group active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{item.icon}</span>
                <span className={`badge ${item.tagColor} text-xs`}>{item.tag}</span>
              </div>
              <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              <div className="mt-3 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                바로가기 →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI 도구 + 윤리 안내 가로 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="section-title text-base">🛠️ 수업 활용 AI 도구</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tools.map(t => (
              <div key={t.name} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${t.color}`}>
                <span className="text-base">{t.icon}</span>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">※ 각 도구의 이용약관·저작권 정책을 확인하여 활용하세요.</p>
        </div>

        <div className="card bg-amber-50 border border-amber-200">
          <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3 text-base">⚖️ AI 활용 윤리 안내</h3>
          <ul className="space-y-2">
            {[
              'AI 생성 결과물은 반드시 Fact-check 후 사용',
              'AI 작성 보고서·발표에 AI 활용 여부 명시',
              '타인 개인정보·기업 기밀을 AI에 입력 금지',
              'AI 이미지·텍스트 저작권 귀속 확인',
              '표절 방지 — AI 내용 그대로 제출 금지',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 추가 메뉴 바로가기 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📅', label: '16주차 운영표', menu: 'weekly', color: 'bg-slate-800 text-white hover:bg-slate-700' },
          { icon: '✅', label: '평가 루브릭', menu: 'rubric', color: 'bg-slate-800 text-white hover:bg-slate-700' },
          { icon: '🔗', label: 'LMS·링크 관리', menu: 'links', color: 'bg-slate-800 text-white hover:bg-slate-700' },
          { icon: '🤖', label: 'AI 에이전트 설계', menu: 'agent', color: 'bg-slate-800 text-white hover:bg-slate-700' },
        ].map(item => (
          <button
            key={item.menu}
            onClick={() => setActive(item.menu)}
            className={`${item.color} rounded-xl py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
