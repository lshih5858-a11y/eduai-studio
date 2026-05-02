App.register('dashboard', function (el) {
  el.innerHTML = `
    <p class="page-title">EduAI Exercise Health Designer</p>
    <p class="page-subtitle">운동건강관리과 전공 수업을 AI로 설계하고, 실습하고, 평가하는 EduAI Studio 기반 통합 플랫폼</p>

    <div class="grid-4 mb-24">
      <div class="card card-blue" style="cursor:pointer" onclick="Router.showSection('curriculum')">
        <div class="card-icon">📅</div>
        <div class="card-title">16주차 수업 자동 설계</div>
        <div class="card-desc">주차별 학습목표, 개념, 실습, 과제, 평가를 자동 구성합니다.</div>
      </div>
      <div class="card card-mint" style="cursor:pointer" onclick="Router.showSection('ai-tools')">
        <div class="card-icon">🤖</div>
        <div class="card-title">AI 도구 매핑</div>
        <div class="card-desc">GPT, Gamma, Napkin, Genspark, Gemini, NotebookLM, Perplexity를 수업 목적에 맞게 배치합니다.</div>
      </div>
      <div class="card card-green" style="cursor:pointer" onclick="Router.showSection('prescription')">
        <div class="card-icon">🏋️</div>
        <div class="card-title">운동처방 실습</div>
        <div class="card-desc">학생이 가상 대상자의 건강상태를 분석하고 맞춤형 운동계획을 설계합니다.</div>
      </div>
      <div class="card card-accent" style="cursor:pointer" onclick="Router.showSection('tasks')">
        <div class="card-icon">📊</div>
        <div class="card-title">평가 루브릭 자동화</div>
        <div class="card-desc">실습보고서, 발표, 운동처방안, 체력평가 결과를 루브릭으로 평가합니다.</div>
      </div>
    </div>

    <p class="section-heading">플랫폼 구성 안내</p>
    <div class="grid-2 mb-24">
      <div class="notice notice-info">
        <span>👩‍🏫</span>
        <div><strong>교수자</strong>라면 <em>16주차 수업설계</em>와 <em>교수자용 출력자료</em> 메뉴를 먼저 확인하세요. 수업계획서, 실습지, 퀴즈, 루브릭을 바로 사용할 수 있습니다.</div>
      </div>
      <div class="notice notice-mint">
        <span>🎓</span>
        <div><strong>학생</strong>이라면 <em>학생용 AI 튜터</em>와 <em>운동처방 실습</em> 메뉴를 활용하세요. 개념 설명, 실습 안내, 자기평가 피드백을 받을 수 있습니다.</div>
      </div>
    </div>

    <p class="section-heading">주요 메뉴 바로가기</p>
    <div class="grid-4">
      ${[
        { icon:'📅', label:'16주차 수업설계', id:'curriculum' },
        { icon:'🤖', label:'AI 도구 매핑',   id:'ai-tools' },
        { icon:'🏋️', label:'운동처방 실습',   id:'prescription' },
        { icon:'📊', label:'건강·체력 평가',  id:'assessment' },
        { icon:'💬', label:'학생용 AI 튜터',  id:'ai-tutor' },
        { icon:'📝', label:'과제·퀴즈·루브릭',id:'tasks' },
        { icon:'🖨️', label:'교수자용 출력자료',id:'professor' },
      ].map(m => `
        <button class="btn btn-outline" style="justify-content:flex-start;gap:8px;padding:12px 16px" onclick="Router.showSection('${m.id}')">
          ${m.icon} ${m.label}
        </button>
      `).join('')}
    </div>

    <div class="notice notice-warn mt-24">
      ⚠️ 본 플랫폼의 모든 건강·운동 관련 정보는 <strong>교육용 안내</strong>이며, 실제 질환자나 고위험군의 운동처방은 전문가 상담과 의학적 확인이 필요합니다.
    </div>
  `;
});
