App.register('ai-tools', function (el) {
  const colorMap = { blue:'card-blue', mint:'card-mint', green:'card-green', accent:'card-accent' };

  const cards = AI_TOOLS.map(tool => `
    <div class="card ${colorMap[tool.color] || 'card-blue'}">
      <div class="flex-between mb-8">
        <div style="font-size:1.8rem">${tool.emoji}</div>
        <span class="tag tag-blue">${tool.weeks.length}개 주차</span>
      </div>
      <div class="card-title">${tool.name}</div>
      <div class="card-desc mb-12">${tool.tagline}</div>
      <ul style="font-size:.82rem;color:var(--color-text-muted);padding-left:14px;list-style:disc;margin-bottom:14px;line-height:1.8">
        ${tool.roles.map(r => `<li>${r}</li>`).join('')}
      </ul>
      <div class="flex gap-8 flex-wrap mb-12">
        ${tool.weeks.map(w => `<span class="tag tag-mint" style="font-size:.7rem">${w}주</span>`).join('')}
      </div>
      <button class="btn btn-outline btn-sm" onclick="togglePrompt('${tool.id}')">💡 프롬프트 보기</button>
      <div id="prompt-${tool.id}" class="hidden mt-12">
        <div class="accordion">
          ${tool.prompts.map((p, i) => `
            <div class="accordion-item">
              <button class="accordion-btn" data-acc="${tool.id}-${i}">
                ${p.title} <span class="accordion-arrow">▾</span>
              </button>
              <div class="accordion-body">
                <p style="font-size:.85rem;line-height:1.7;white-space:pre-wrap">${p.text}</p>
                <button class="btn btn-ghost btn-sm mt-8" onclick="copyToClipboard(\`${p.text.replace(/`/g,"'")}\`)">📋 복사</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <p class="page-title">🤖 AI 도구 매핑</p>
    <p class="page-subtitle">운동건강관리과 수업에 활용할 수 있는 AI 도구와 주차별 역할, 예시 프롬프트를 확인하세요.</p>

    <div class="notice notice-info mb-24">
      💡 각 카드의 <strong>"프롬프트 보기"</strong>를 클릭하면 해당 AI 도구에서 바로 사용할 수 있는 예시 프롬프트를 확인하고 복사할 수 있습니다.
    </div>

    <div class="grid-3">${cards}</div>
  `;

  window.togglePrompt = function (id) {
    const box = document.getElementById('prompt-' + id);
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) setupAccordions(box);
  };
});
