/* 공통 유틸 함수 */

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('복사되었습니다!'));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function setupAccordions(root) {
  root.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = body.classList.contains('open');
      root.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
      root.querySelectorAll('.accordion-btn').forEach(b => b.classList.remove('open'));
      if (!isOpen) { body.classList.add('open'); btn.classList.add('open'); }
    });
  });
}

function setupTabs(root) {
  root.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.tabGroup;
      const target = btn.dataset.tab;
      root.querySelectorAll(`.tab-btn[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
      root.querySelectorAll(`.tab-panel[data-tab-group="${group}"]`).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      root.querySelector(`.tab-panel[data-tab-group="${group}"][data-tab="${target}"]`).classList.add('active');
    });
  });
}

function tagList(arr, cls = 'tag-blue') {
  return arr.map(t => `<span class="tag ${cls}">${t}</span>`).join(' ');
}
