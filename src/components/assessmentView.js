App.register('assessment', function (el) {
  const panels = FITNESS_ITEMS.map(item => `
    <div class="accordion-item">
      <button class="accordion-btn">
        <span>${item.emoji} ${item.name}</span>
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-body">
        <div class="tabs">
          <button class="tab-btn active" data-tab-group="${item.id}" data-tab="concept">개념 설명</button>
          <button class="tab-btn" data-tab-group="${item.id}" data-tab="method">측정방법</button>
          <button class="tab-btn" data-tab-group="${item.id}" data-tab="interpret">결과 해석</button>
          <button class="tab-btn" data-tab-group="${item.id}" data-tab="improve">개선운동 추천</button>
        </div>
        <div class="tab-panel active" data-tab-group="${item.id}" data-tab="concept">
          <p style="font-size:.9rem;line-height:1.8">${item.concept}</p>
        </div>
        <div class="tab-panel" data-tab-group="${item.id}" data-tab="method">
          <p style="font-size:.9rem;line-height:1.8">${item.method}</p>
        </div>
        <div class="tab-panel" data-tab-group="${item.id}" data-tab="interpret">
          <p style="font-size:.9rem;line-height:1.8">${item.interpretation}</p>
        </div>
        <div class="tab-panel" data-tab-group="${item.id}" data-tab="improve">
          <div class="notice notice-warn mb-12">⚠️ 아래 내용은 <strong>교육용 예시</strong>입니다. 실제 적용 시 전문가 상담을 받으시기 바랍니다.</div>
          <ul style="font-size:.9rem;line-height:2;padding-left:18px;list-style:disc">
            ${item.improvement.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <p class="page-title">📊 건강·체력 평가</p>
    <p class="page-subtitle">건강체력 평가 8개 항목의 개념, 측정방법, 결과 해석, 개선운동을 확인하세요.</p>

    <div class="notice notice-info mb-24">
      💡 각 항목을 클릭하면 <strong>개념 설명 / 측정방법 / 결과 해석 / 개선운동 추천</strong> 탭을 확인할 수 있습니다.
    </div>

    <div class="accordion" id="assessAccordion">${panels}</div>

    <div class="notice notice-warn mt-24">
      ⚠️ 본 내용은 교육용 안내이며 진단이나 치료를 목적으로 하지 않습니다. 건강 이상이 있는 경우 반드시 전문가와 상담하시기 바랍니다.
    </div>
  `;

  setupAccordions(el);
  setupTabs(el);
});
