export default function Dashboard({ mode, setActive }) {
  const cards = [
    { icon: '📚', title: '강의안·사례 발굴', desc: '수업 주제 입력 → 강의안, 사례, 토론 질문 자동 생성', menu: 'lecture', color: 'border-blue-400 bg-blue-50', badge: '교수자' },
    { icon: '💡', title: '프로젝트 아이디어', desc: '산업·문제 입력 → 주제 후보, 페르소나, 역할 분담', menu: 'project', color: 'border-emerald-400 bg-emerald-50', badge: '학생/팀' },
    { icon: '📊', title: '데이터 분석·코딩', desc: '데이터 유형 선택 → Excel/Python 분석 프롬프트 생성', menu: 'data', color: 'border-orange-400 bg-orange-50', badge: '학생' },
    { icon: '📑', title: '피치덱·보고서', desc: '프로젝트 정보 → Gamma 프롬프트, 보고서 목차 자동화', menu: 'pitch', color: 'border-purple-400 bg-purple-50', badge: '팀' },
    { icon: '🤝', title: '팀 코칭 에이전트', desc: '진행 단계·어려운 점 → AI 코칭 프롬프트 생성', menu: 'coaching', color: 'border-pink-400 bg-pink-50', badge: '팀' },
    { icon: '🤖', title: 'AI 튜터·시뮬레이션', desc: 'Opal/Gemini 기반 AI 에이전트 설계 가이드', menu: 'agent', color: 'border-indigo-400 bg-indigo-50', badge: '고급' },
  ]

  const tools = [
    { name: 'ChatGPT', color: 'bg-green-100 text-green-800', icon: '🧠' },
    { name: 'Gemini', color: 'bg-blue-100 text-blue-800', icon: '✨' },
    { name: 'Gamma', color: 'bg-purple-100 text-purple-800', icon: '🎨' },
    { name: 'Perplexity', color: 'bg-orange-100 text-orange-800', icon: '🔍' },
    { name: 'Napkin AI', color: 'bg-pink-100 text-pink-800', icon: '📐' },
    { name: 'Python/Colab', color: 'bg-yellow-100 text-yellow-800', icon: '🐍' },
    { name: 'Opal', color: 'bg-teal-100 text-teal-800', icon: '💎' },
    { name: 'Felo', color: 'bg-red-100 text-red-800', icon: '🌐' },
  ]

  const outputs = ['강의안', '기업 사례', '아이디어 후보', '분석 코드', '피치덱', '보고서', '코칭 피드백', '평가 루브릭']

  return (
    <div className="space-y-6">
      {/* 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">👋 Business AI Class Studio에 오신 것을 환영합니다</h2>
        <p className="text-blue-100 text-sm leading-relaxed">
          이 플랫폼은 경영학 수업에서 생성형 AI를 강의 준비, 사례 발굴, 데이터 분석, 프로젝트 코칭, 발표자료 제작에 활용하도록 설계되었습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['⚠️ AI 생성 결과는 교수자 검토 후 사용하세요', '🔒 개인정보 미저장', '📋 저작권·AI 윤리 준수 필요'].map(t => (
            <span key={t} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* 현재 모드 정보 */}
      {mode === 'professor' && (
        <div className="card border-l-4 border-blue-500 bg-blue-50">
          <p className="text-sm text-blue-800 font-medium">👨‍🏫 교수자 모드 — 강의안 생성, 사례 발굴, 평가 루브릭, 16주차 수업 운영표를 활용하세요.</p>
        </div>
      )}
      {mode === 'student' && (
        <div className="card border-l-4 border-emerald-500 bg-emerald-50">
          <p className="text-sm text-emerald-800 font-medium">🎓 학생 모드 — 프로젝트 아이디어, 데이터 분석, 피치덱 자동화로 과제를 완성하세요.</p>
        </div>
      )}
      {mode === 'team' && (
        <div className="card border-l-4 border-purple-500 bg-purple-50">
          <p className="text-sm text-purple-800 font-medium">👥 팀 프로젝트 모드 — 팀 코칭 에이전트, 역할 분담, 발표자료 제작을 활용하세요.</p>
        </div>
      )}

      {/* 이번 주 오늘의 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-xs text-slate-500 mb-1">오늘의 수업 주제</div>
          <div className="text-sm font-bold text-slate-800">AI 기반 비즈니스 모델 설계</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-xs text-slate-500 mb-1">이번 주 AI 활용 목표</div>
          <div className="text-sm font-bold text-slate-800">GPT로 아이디어 검증하기</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🛠️</div>
          <div className="text-xs text-slate-500 mb-1">추천 AI 도구</div>
          <div className="text-sm font-bold text-slate-800">ChatGPT · Gamma · Napkin</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-xs text-slate-500 mb-1">팀 프로젝트 진행 단계</div>
          <div className="text-sm font-bold text-slate-800">아이디어 도출 → 검증 단계</div>
        </div>
      </div>

      {/* 주요 기능 카드 */}
      <div>
        <h3 className="section-title">⚡ 주요 기능 바로가기</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map(card => (
            <button
              key={card.menu}
              onClick={() => setActive(card.menu)}
              className={`card border-l-4 ${card.color} text-left hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <span className="badge bg-slate-100 text-slate-600">{card.badge}</span>
              </div>
              <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{card.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 생성 가능 산출물 */}
      <div className="card">
        <h3 className="section-title">📦 생성 가능한 산출물</h3>
        <div className="flex flex-wrap gap-2">
          {outputs.map(o => (
            <span key={o} className="badge bg-blue-100 text-blue-800">{o}</span>
          ))}
        </div>
      </div>

      {/* 추천 AI 도구 */}
      <div className="card">
        <h3 className="section-title">🛠️ 수업에서 활용하는 AI 도구</h3>
        <div className="flex flex-wrap gap-2">
          {tools.map(t => (
            <span key={t.name} className={`badge ${t.color} gap-1`}>
              {t.icon} {t.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">※ 각 도구의 이용약관과 저작권 정책을 확인하여 적절하게 활용하세요.</p>
      </div>

      {/* AI 윤리 안내 */}
      <div className="card bg-amber-50 border border-amber-200">
        <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">⚖️ AI 활용 윤리 안내</h3>
        <ul className="text-sm text-amber-700 space-y-1.5 list-none">
          <li>✔ AI 생성 결과물은 반드시 사실 확인(Fact-check) 후 사용하세요.</li>
          <li>✔ AI 작성 보고서·발표자료에 AI 활용 여부를 명시하세요.</li>
          <li>✔ 타인의 개인정보, 기업 기밀을 AI에 입력하지 마세요.</li>
          <li>✔ AI 생성 이미지·텍스트의 저작권 귀속을 확인하세요.</li>
          <li>✔ 표절 방지를 위해 AI 내용을 그대로 제출하지 마세요.</li>
        </ul>
      </div>
    </div>
  )
}
