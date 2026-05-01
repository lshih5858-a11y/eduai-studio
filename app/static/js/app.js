// 현재 페이지의 단계 번호 추출
const stageNum = location.pathname.match(/stage\/(\d)/)?.[1];

const form = document.getElementById('analysisForm');
const resultBox = document.getElementById('resultBox');
const resultContent = document.getElementById('resultContent');

// 마크다운 간이 렌더러
function renderMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn-analyze');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '🔄 AI 분석 중...';

    // 체크박스 다중 선택 처리
    const formData = new FormData(form);
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length > 0) {
      const name = checkboxes[0].name;
      formData.delete(name);
      const values = Array.from(checkboxes).map(cb => cb.value).join(', ');
      formData.set(name, values);
    }

    resultBox.classList.remove('hidden');
    resultContent.innerHTML = '';
    resultContent.classList.add('streaming-cursor');

    let rawText = '';

    try {
      const response = await fetch(`/analyze/${stageNum}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        resultContent.textContent = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') {
            resultContent.classList.remove('streaming-cursor');
            break;
          }
          rawText += data.replace(/\\n/g, '\n');
          resultContent.innerHTML = renderMarkdown(rawText);
          resultContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    } catch (err) {
      resultContent.classList.remove('streaming-cursor');
      resultContent.textContent = `오류: ${err.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

function copyResult() {
  const text = resultContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✅ 복사됨';
    setTimeout(() => { btn.textContent = '📋 복사'; }, 2000);
  });
}
