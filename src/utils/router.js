/**
 * 섹션 간 전환을 담당하는 라우터
 * URL 해시(#section-id) 기반으로 동작
 */
const Router = (() => {
  const sections = [
    'dashboard',
    'curriculum',
    'ai-tools',
    'prescription',
    'assessment',
    'ai-tutor',
    'tasks',
    'professor',
  ];

  function showSection(id) {
    if (!sections.includes(id)) id = 'dashboard';

    // 섹션 전환
    document.querySelectorAll('.section').forEach(el => {
      el.classList.toggle('active', el.id === id);
    });

    // 내비게이션 활성 표시
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === id);
    });

    // 해당 섹션 렌더 함수 호출
    App.render(id);

    // 모바일 사이드바 닫기
    document.getElementById('sidebar').classList.remove('open');

    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    // 내비게이션 버튼 클릭
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => showSection(btn.dataset.section));
    });

    // 모바일 햄버거
    document.getElementById('navToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // 해시 변경 (뒤로가기 지원)
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.replace('#', '') || 'dashboard';
      showSection(id);
    });

    // 초기 진입
    const initial = window.location.hash.replace('#', '') || 'dashboard';
    showSection(initial);
  }

  return { init, showSection };
})();
