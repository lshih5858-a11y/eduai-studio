App.register('tasks', function (el) {
  /* ── 루브릭 테이블 생성 헬퍼 ── */
  function buildRubric(rubric) {
    const levelLabels = { excellent:'우수(A)', good:'양호(B)', average:'보통(C)', poor:'미흡(D)' };
    const rows = rubric.items.map(item => `
      <tr>
        <td><strong>${item.criterion}</strong></td>
        <td class="rubric-score">${item.score}점</td>
        <td style="font-size:.8rem">${item.levels.excellent}</td>
        <td style="font-size:.8rem">${item.levels.good}</td>
        <td style="font-size:.8rem">${item.levels.average}</td>
        <td style="font-size:.8rem">${item.levels.poor}</td>
      </tr>
    `).join('');
    return `
      <div class="table-wrap mb-16">
        <table class="rubric-table">
          <thead>
            <tr>
              <th>평가 항목</th><th>배점</th>
              <th>우수(A)</th><th>양호(B)</th><th>보통(C)</th><th>미흡(D)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="rubric-total">
              <td colspan="2">합계</td>
              <td colspan="4">${rubric.total}점 만점</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /* ── 퀴즈 패널 ── */
  function buildQuiz() {
    const ox = QUIZZES.ox.map((q, i) => `
      <div class="card mb-8">
        <div style="font-size:.9rem;font-weight:600;margin-bottom:8px">Q${i+1}. ${q.q}</div>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="checkOX(this,'O','${i}')">O</button>
          <button class="btn btn-outline btn-sm" onclick="checkOX(this,'X','${i}')">X</button>
        </div>
        <div id="ox-fb-${i}" class="mt-8 hidden" style="font-size:.83rem;color:var(--color-text-muted)"></div>
      </div>
    `).join('');

    const mc = QUIZZES.mc.map((q, i) => `
      <div class="card mb-8">
        <div style="font-size:.9rem;font-weight:600;margin-bottom:10px">Q${i+1}. ${q.q}</div>
        ${q.options.map((opt, j) => `
          <button class="btn btn-ghost btn-sm mb-4" style="display:block;text-align:left;width:100%" onclick="checkMC(this,${j},${q.a},'mc-fb-${i}','${q.explain.replace(/'/g,"\\'")}')">
            ${j+1}. ${opt}
          </button>
        `).join('')}
        <div id="mc-fb-${i}" class="mt-8 hidden" style="font-size:.83rem;color:var(--color-text-muted)"></div>
      </div>
    `).join('');

    const sh = QUIZZES.short.map((q, i) => `
      <div class="card mb-8">
        <div style="font-size:.9rem;font-weight:600;margin-bottom:8px">Q${i+1}. ${q.q}</div>
        <div class="flex gap-8">
          <input class="form-input" id="sh-input-${i}" placeholder="답을 입력하세요" style="flex:1">
          <button class="btn btn-primary btn-sm" onclick="checkShort(${i},'${q.a.replace(/'/g,"\\'")}')">확인</button>
        </div>
        <div id="sh-fb-${i}" class="mt-8 hidden" style="font-size:.83rem"></div>
      </div>
    `).join('');

    return { ox, mc, sh };
  }

  const weekOptions = Array.from({length:16},(_,i)=>`<option value="${i+1}">${i+1}주차</option>`).join('');
  const quiz = buildQuiz();

  el.innerHTML = `
    <p class="page-title">📝 과제·퀴즈·루브릭</p>
    <p class="page-subtitle">주차별 과제 예시, 유형별 퀴즈, 평가 루브릭을 확인하고 활용하세요.</p>

    <div class="tabs mb-0">
      <button class="tab-btn active" data-tab-group="tasks" data-tab="assignment">📋 과제</button>
      <button class="tab-btn" data-tab-group="tasks" data-tab="quiz">❓ 퀴즈</button>
      <button class="tab-btn" data-tab-group="tasks" data-tab="rubric">📊 루브릭</button>
    </div>

    <!-- 과제 탭 -->
    <div class="tab-panel active" data-tab-group="tasks" data-tab="assignment">
      <div class="card mt-16 mb-16">
        <label class="form-label">주차 선택</label>
        <select class="form-select" id="weekSelect" onchange="showAssignment()">${weekOptions}</select>
      </div>
      <div id="assignmentBox"></div>
    </div>

    <!-- 퀴즈 탭 -->
    <div class="tab-panel" data-tab-group="tasks" data-tab="quiz">
      <div class="tabs mt-16 mb-16">
        <button class="tab-btn active" data-tab-group="quiz" data-tab="ox">OX형</button>
        <button class="tab-btn" data-tab-group="quiz" data-tab="mc">객관식</button>
        <button class="tab-btn" data-tab-group="quiz" data-tab="short">단답형</button>
      </div>
      <div class="tab-panel active" data-tab-group="quiz" data-tab="ox">${quiz.ox}</div>
      <div class="tab-panel" data-tab-group="quiz" data-tab="mc">${quiz.mc}</div>
      <div class="tab-panel" data-tab-group="quiz" data-tab="short">${quiz.sh}</div>
    </div>

    <!-- 루브릭 탭 -->
    <div class="tab-panel" data-tab-group="tasks" data-tab="rubric">
      <p class="section-heading mt-16">운동처방안 평가 루브릭</p>
      ${buildRubric(RUBRIC_PRESCRIPTION)}
      <button class="btn btn-outline btn-sm mb-24" onclick="copyToClipboard(document.querySelector('.rubric-table').innerText)">📋 복사</button>

      <p class="section-heading">팀 프로젝트 발표 평가 루브릭</p>
      ${buildRubric(RUBRIC_PRESENTATION)}
      <button class="btn btn-outline btn-sm" onclick="copyToClipboard(document.querySelectorAll('.rubric-table')[1].innerText)">📋 복사</button>
    </div>
  `;

  setupTabs(el);

  /* 과제 표시 */
  window.showAssignment = function () {
    const w = parseInt(document.getElementById('weekSelect').value);
    const a = ASSIGNMENTS[w];
    if (!a) return;
    document.getElementById('assignmentBox').innerHTML = `
      <div class="card card-mint">
        <div class="flex-between mb-8">
          <span class="tag tag-blue">${w}주차</span>
          <span class="tag tag-mint">AI 도구: ${a.tool}</span>
        </div>
        <div class="card-title mb-8">${a.title}</div>
        <p style="font-size:.9rem;line-height:1.8;color:var(--color-text)">${a.desc}</p>
        <button class="btn btn-outline btn-sm mt-12" onclick="copyToClipboard('${a.title}\\n\\n${a.desc.replace(/'/g,"\\'")}')">📋 과제 복사</button>
      </div>
    `;
  };
  window.showAssignment();

  /* OX 퀴즈 채점 */
  window.checkOX = function (btn, answer, i) {
    const correct = QUIZZES.ox[i].a;
    const fb = document.getElementById('ox-fb-' + i);
    fb.classList.remove('hidden');
    if (answer === correct) {
      fb.innerHTML = `<span style="color:var(--color-green)">✅ 정답입니다!</span> ${QUIZZES.ox[i].explain}`;
    } else {
      fb.innerHTML = `<span style="color:var(--color-danger)">❌ 오답입니다. 정답: ${correct}</span> ${QUIZZES.ox[i].explain}`;
    }
  };

  /* 객관식 채점 */
  window.checkMC = function (btn, chosen, correct, fbId, explain) {
    const fb = document.getElementById(fbId);
    fb.classList.remove('hidden');
    if (chosen === correct) {
      fb.innerHTML = `<span style="color:var(--color-green)">✅ 정답입니다!</span> ${explain}`;
    } else {
      fb.innerHTML = `<span style="color:var(--color-danger)">❌ 오답입니다. 정답: ${correct+1}번</span> ${explain}`;
    }
  };

  /* 단답형 채점 */
  window.checkShort = function (i, answer) {
    const val = document.getElementById('sh-input-' + i).value.trim();
    const fb  = document.getElementById('sh-fb-' + i);
    fb.classList.remove('hidden');
    fb.innerHTML = `<strong>모범 답안:</strong> ${answer}`;
  };
});
