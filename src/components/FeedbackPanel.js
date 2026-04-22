import React, { useState } from 'react';
import { WEEKS, SUBMISSION_LINK } from '../data/curriculum';
import './FeedbackPanel.css';

function generateFeedback(text, week) {
  const len = text.trim().length;
  if (len < 20) return null;

  const weekTitle = week ? `${week.week}주차 — ${week.title}` : '게임/VR 콘텐츠 개론';

  // Simple keyword-based analysis
  const hasAiMention = /ai|인공지능|chatgpt|gpt|생성형|gamma|dreamina|meshy|suno/i.test(text);
  const hasStructure = /^\s*[-•*\d]/m.test(text) || text.includes('\n');
  const hasDetail = len > 150;
  const hasTool = /unity|figma|vr|ar|xr|blender|hubs|visual studio/i.test(text);
  const hasGoal = /목표|goal|하고자|하려고|계획|완성|구현|제작/i.test(text);

  const glows = [];
  const grows = [];
  const wonderings = [];

  // Glow analysis
  if (hasAiMention) glows.push('AI 도구를 적극 활용한 점이 돋보여요! 생성형 AI와의 협업 과정이 잘 드러나고 있습니다.');
  if (hasStructure) glows.push('내용이 구조적으로 잘 정리되어 있어요. 읽기 쉽고 논리적인 흐름이 느껴집니다.');
  if (hasDetail) glows.push('충분한 분량으로 주제를 깊이 있게 다루고 있어요. 세부 내용에 대한 이해도가 높습니다.');
  if (hasTool) glows.push('실습 도구(Unity, Figma 등)를 구체적으로 언급한 점이 좋아요. 실무 감각이 보입니다.');
  if (hasGoal) glows.push('학습 목표와 계획이 명확히 드러나 있어요. 방향성이 잘 잡혀 있습니다.');
  if (glows.length === 0) glows.push('작업을 시작하고 제출한 것 자체가 훌륭해요! 꾸준히 진행해 나가는 자세가 중요합니다.');

  // Grow analysis
  if (!hasAiMention) grows.push('AI 도구 활용 내용을 더 구체적으로 포함해 보세요. 어떤 도구를 어떻게 사용했는지 기술하면 좋습니다.');
  if (!hasStructure) grows.push('내용을 불릿 포인트나 소제목으로 구조화하면 가독성이 크게 향상됩니다.');
  if (!hasDetail && len < 100) grows.push('현재 내용이 다소 간략해요. 각 포인트에 구체적인 예시나 근거를 추가해 보세요.');
  if (!hasGoal) grows.push('이 작업의 목표와 예상 결과물을 명시하면 평가자가 맥락을 파악하기 쉬워집니다.');
  const missingAiNote = !/\[ai|\/\/ \[ai/i.test(text);
  if (missingAiNote) grows.push('AI 협업 내용과 본인 작성 부분을 주석으로 구분(`// [AI 생성]` / `// [본인 작성]`)하는 것을 잊지 마세요!');
  if (grows.length === 0) grows.push('전반적으로 완성도가 높아요. 다음 단계로 동료 피드백을 받아보거나 실제 사용자 테스트를 진행해 보세요.');

  // Wondering
  const wonderPool = [
    `이 프로젝트를 실제 VR 기기(Meta Quest 등)에서 테스트해 본다면 어떤 점이 달라질까요?`,
    `AI가 생성한 콘텐츠와 본인이 직접 만든 콘텐츠 중 어느 쪽이 더 창의적이라고 느꼈나요? 그 이유는?`,
    `이 작업을 팀 프로젝트로 확장한다면 각 팀원에게 어떤 역할을 분담하겠어요?`,
    `사용자(플레이어/학습자)의 관점에서 이 콘텐츠의 가장 큰 매력 포인트는 무엇일까요?`,
    `현재 사용한 AI 도구 외에 다른 도구를 추가로 활용한다면 어떤 부분을 개선할 수 있을까요?`,
    `이 결과물을 포트폴리오에 넣는다면 어떤 부분을 가장 강조하고 싶으신가요?`,
  ];
  wonderings.push(wonderPool[Math.floor(Math.random() * wonderPool.length)]);
  wonderings.push(wonderPool[(Math.floor(Math.random() * wonderPool.length) + 2) % wonderPool.length]);

  return { weekTitle, glows, grows, wonderings };
}

export default function FeedbackPanel() {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [workText, setWorkText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    if (workText.trim().length < 20) {
      setError('작업 내용을 20자 이상 입력해 주세요.');
      return;
    }
    setError('');
    const week = selectedWeek ? WEEKS.find((w) => w.week === parseInt(selectedWeek, 10)) : null;
    const result = generateFeedback(workText, week);
    setFeedback(result);
  };

  const handleReset = () => {
    setFeedback(null);
    setWorkText('');
    setSelectedWeek('');
  };

  return (
    <div className="feedback-panel">
      <div className="feedback-intro">
        <div className="feedback-intro-icon">✨</div>
        <div>
          <h2 className="feedback-intro-title">Glow &amp; Grow 피드백</h2>
          <p className="feedback-intro-sub">작업 내용을 입력하면 AI 튜터가 강점(Glow), 개선점(Grow), 심화 질문(Wondering)을 제공해요.</p>
        </div>
      </div>

      {!feedback ? (
        <div className="feedback-form">
          <div className="form-group">
            <label className="form-label">주차 선택 (선택사항)</label>
            <select
              className="form-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">-- 주차 선택 --</option>
              {WEEKS.map((w) => (
                <option key={w.week} value={w.week}>{w.week}주차 — {w.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">작업 내용 입력 <span className="form-required">*</span></label>
            <textarea
              className="form-textarea"
              value={workText}
              onChange={(e) => setWorkText(e.target.value)}
              placeholder="이번 주차에 작업한 내용, 기획한 아이디어, 작성한 코드나 기획서 내용 등을 자유롭게 입력해 주세요.

예시:
- 3주차 게임 시나리오 초안: 포스트 아포칼립스 배경의 VR 탐험 게임을 기획했어요.
  ChatGPT를 활용해 세계관 설정과 주인공 캐릭터를 만들었고,
  Gamma로 스토리보드 슬라이드를 완성했습니다."
              rows={10}
            />
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="submission-reminder">
            <span className="reminder-icon">📌</span>
            <span>완성 후 </span>
            <a href={SUBMISSION_LINK} target="_blank" rel="noopener noreferrer">과제 제출 페이지</a>
            <span>에 AI 협업 주석과 함께 제출하세요.</span>
          </div>

          <button className="generate-btn" onClick={handleGenerate}>
            ✨ Glow &amp; Grow 피드백 받기
          </button>
        </div>
      ) : (
        <div className="feedback-result">
          <div className="result-header">
            <div className="result-week">{feedback.weekTitle}</div>
            <button className="result-reset" onClick={handleReset}>← 다시 입력</button>
          </div>

          <FeedbackSection
            type="glow"
            icon="🌟"
            title="Glow — 강점"
            color="#f9a23a"
            items={feedback.glows}
          />
          <FeedbackSection
            type="grow"
            icon="🌱"
            title="Grow — 개선점"
            color="#7ec94a"
            items={feedback.grows}
          />
          <FeedbackSection
            type="wonder"
            icon="🤔"
            title="Wondering — 심화 질문"
            color="#4ac4e8"
            items={feedback.wonderings}
          />

          <div className="result-footer">
            <div className="result-footer-inner">
              <span className="result-footer-icon">📬</span>
              <div>
                <div className="result-footer-title">피드백 반영 후 제출하기</div>
                <a href={SUBMISSION_LINK} target="_blank" rel="noopener noreferrer" className="result-submit-link">
                  과제 제출 페이지 →
                </a>
                <p className="result-footer-note">⚠️ AI 협업 내용과 본인 작성 부분을 주석으로 구분해 주세요.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackSection({ type, icon, title, color, items }) {
  return (
    <div className={`feedback-section ${type}`} style={{ '--section-color': color }}>
      <div className="section-header">
        <span className="section-icon">{icon}</span>
        <h3 className="section-title">{title}</h3>
      </div>
      <ul className="section-items">
        {items.map((item, i) => (
          <li key={i} className="section-item">{item}</li>
        ))}
      </ul>
    </div>
  );
}
