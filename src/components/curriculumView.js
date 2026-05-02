App.register('curriculum', function (el) {
  const toolColors = { GPT:'tag-blue', Gamma:'tag-mint', Napkin:'tag-green', Genspark:'tag-amber', Gemini:'tag-blue', NotebookLM:'tag-mint', Perplexity:'tag-green' };

  const rows = CURRICULUM.map(w => `
    <tr>
      <td><span class="week-num">${w.week}주</span></td>
      <td><strong>${w.topic}</strong></td>
      <td style="font-size:.82rem">${w.goal}</td>
      <td>${w.concepts.map(c => `<span class="tag tag-blue" style="margin:1px;display:inline-block">${c}</span>`).join('')}</td>
      <td style="font-size:.82rem">${w.practice}</td>
      <td>${w.aiTools.map(t => `<span class="tag ${toolColors[t]||'tag-blue'}" style="margin:1px;display:inline-block">${t}</span>`).join('')}</td>
      <td style="font-size:.82rem">${w.assignment}</td>
      <td style="font-size:.82rem">${w.evaluation}</td>
    </tr>
  `).join('');

  el.innerHTML = `
    <p class="page-title">📅 16주차 수업설계</p>
    <p class="page-subtitle">운동건강관리과 AI 기반 16주차 수업계획표입니다. 각 주차의 학습목표, 핵심개념, 실습활동, AI 도구, 과제, 평가방법을 확인하세요.</p>

    <div class="flex-between mb-16 flex-wrap gap-8">
      <div class="flex gap-8 flex-wrap">
        <span class="tag tag-blue">GPT</span>
        <span class="tag tag-mint">Gamma / NotebookLM</span>
        <span class="tag tag-green">Napkin / Perplexity</span>
        <span class="tag tag-amber">Genspark</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="copyCurriculum()">📋 전체 복사</button>
    </div>

    <div class="table-wrap">
      <table id="curriculumTable">
        <thead>
          <tr>
            <th>주차</th>
            <th>수업주제</th>
            <th>학습목표</th>
            <th>핵심개념</th>
            <th>실습활동</th>
            <th>AI 도구</th>
            <th>과제</th>
            <th>평가방법</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="notice notice-warn mt-16">
      ⚠️ 본 수업계획은 교육용 예시입니다. 실제 수업에서는 학과 특성과 학생 수준에 맞게 조정하여 사용하시기 바랍니다.
    </div>
  `;

  window.copyCurriculum = function () {
    const text = CURRICULUM.map(w =>
      `[${w.week}주차] ${w.topic}\n목표: ${w.goal}\n개념: ${w.concepts.join(', ')}\n실습: ${w.practice}\nAI: ${w.aiTools.join(', ')}\n과제: ${w.assignment}\n평가: ${w.evaluation}`
    ).join('\n\n');
    copyToClipboard(text);
  };
});
