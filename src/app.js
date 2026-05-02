/**
 * App: 각 섹션의 렌더 함수를 등록하고 Router에서 호출하는 진입점
 */
const App = (() => {
  // 섹션 id → 렌더 함수 매핑 (각 컴포넌트 JS가 register()로 등록)
  const registry = {};

  // 이미 렌더된 섹션은 재렌더 생략
  const rendered = new Set();

  function register(id, renderFn) {
    registry[id] = renderFn;
  }

  function render(id) {
    if (rendered.has(id)) return;
    if (typeof registry[id] === 'function') {
      registry[id](document.getElementById(id));
      rendered.add(id);
    }
  }

  // 강제 재렌더 (데이터 변경 시 외부에서 호출)
  function rerender(id) {
    rendered.delete(id);
    render(id);
  }

  function init() {
    Router.init();
  }

  return { register, render, rerender, init };
})();

// DOM 준비 후 앱 시작
document.addEventListener('DOMContentLoaded', () => App.init());
