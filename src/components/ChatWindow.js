import React, { useState, useRef, useEffect } from 'react';
import { WEEKS, GAMMA_LINKS, SUBMISSION_LINK, RGCF_PRINCIPLE } from '../data/curriculum';
import './ChatWindow.css';

const QUICK_COMMANDS = [
  { label: '1주차 알려줘', value: '1주차 수업 알려줘' },
  { label: '프롬프트 원칙', value: 'R-G-C-F 원칙 설명해줘' },
  { label: '과제 제출 링크', value: '과제 제출 링크 알려줘' },
  { label: '도구 추천', value: '이번 주 AI 도구 추천해줘' },
  { label: '실습 환경', value: '실습 환경 설명해줘' },
];

function buildWeekResponse(week) {
  const w = WEEKS.find((x) => x.week === week);
  if (!w) return null;
  return w;
}

function parseWeekNumber(text) {
  const m = text.match(/(\d{1,2})\s*주차/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 16) return n;
  }
  return null;
}

function generateTutorReply(input, currentWeek) {
  const lower = input.toLowerCase();
  const weekNum = parseWeekNumber(input);

  // Week info request
  if (weekNum) {
    const w = buildWeekResponse(weekNum);
    if (!w) return { type: 'text', content: '1~16주차만 안내할 수 있어요. 다시 확인해 주세요!' };
    return { type: 'week', data: w };
  }

  // Submission link
  if (lower.includes('제출') || lower.includes('링크') || lower.includes('레포트')) {
    return {
      type: 'text',
      content: `📌 **과제 및 레포트 제출 링크**\n\n👉 [${SUBMISSION_LINK}](${SUBMISSION_LINK})\n\n⚠️ **필수 준수 사항**: AI 협업 내용과 본인 작성 부분을 반드시 **주석으로 구분**해야 합니다.\n\n\`\`\`\n// [AI 생성] ChatGPT로 작성된 내용\n// [본인 작성] 수정 및 추가 내용\n\`\`\``,
    };
  }

  // RGCF principle
  if (lower.includes('r-g-c-f') || lower.includes('rgcf') || lower.includes('원칙') || lower.includes('프롬프트 원칙')) {
    return { type: 'rgcf' };
  }

  // Current week tools
  if ((lower.includes('도구') || lower.includes('tool') || lower.includes('ai 추천')) && currentWeek) {
    return { type: 'tools', data: currentWeek };
  }

  // Practice env
  if ((lower.includes('실습') || lower.includes('환경') || lower.includes('설치')) && currentWeek) {
    return { type: 'env', data: currentWeek };
  }

  // Gamma
  if (lower.includes('gamma') || lower.includes('슬라이드') || lower.includes('발표자료')) {
    if (currentWeek && GAMMA_LINKS[currentWeek.week]) {
      return {
        type: 'text',
        content: `📊 **${currentWeek.week}주차 Gamma 슬라이드**\n\n👉 [슬라이드 열기](${GAMMA_LINKS[currentWeek.week]})\n\n위 링크에서 해당 주차의 학습 자료를 확인할 수 있어요!`,
      };
    }
    const gammaWeeks = Object.keys(GAMMA_LINKS).join(', ');
    return {
      type: 'text',
      content: `📊 **Gamma 슬라이드 제공 주차**: ${gammaWeeks}주차\n\n해당 주차를 선택하거나 "n주차 수업 알려줘"라고 입력하면 슬라이드 링크를 바로 볼 수 있어요!`,
    };
  }

  // Sample prompt
  if (lower.includes('프롬프트') || lower.includes('예시') || lower.includes('예제')) {
    if (currentWeek) {
      return { type: 'prompt', data: currentWeek };
    }
    return {
      type: 'text',
      content: `✏️ 먼저 로드맵에서 주차를 선택하거나 "n주차 수업 알려줘"라고 입력해 주세요.\n그러면 해당 주차의 실습 프롬프트 예시를 보여드릴게요!`,
    };
  }

  // Unity
  if (lower.includes('unity') || lower.includes('유니티')) {
    return {
      type: 'text',
      content: `🎮 **Unity 학습 가이드**\n\n**설치**: [Unity Hub 다운로드](https://unity.com/download) → Unity 2022 LTS 설치\n\n**관련 주차**:\n- **9주차**: Unity 기초 & C# 스크립팅\n- **10주차**: Unity XR Toolkit으로 VR 개발\n- **11주차**: AI 에셋 Unity 연동\n\n"9주차 수업 알려줘"라고 입력하면 자세한 내용을 볼 수 있어요!`,
    };
  }

  // Figma
  if (lower.includes('figma') || lower.includes('피그마')) {
    return {
      type: 'text',
      content: `🎨 **Figma 학습 가이드**\n\n**접속**: [figma.com](https://figma.com) (무료 계정으로 시작 가능)\n\n**관련 주차**: **6주차** - Figma로 게임 UI 프로토타입 제작\n\n"6주차 수업 알려줘"라고 입력하면 자세한 내용과 Gamma 슬라이드를 볼 수 있어요!`,
    };
  }

  // Mozilla Hubs
  if (lower.includes('hubs') || lower.includes('mozilla') || lower.includes('소셜 vr')) {
    return {
      type: 'text',
      content: `🌐 **Mozilla Hubs 가이드**\n\n**접속**: [hubs.mozilla.com](https://hubs.mozilla.com) (브라우저 기반, 설치 불필요)\n**에디터**: [Spoke](https://hubs.mozilla.com/spoke) - 가상 공간 제작 도구\n\n**관련 주차**: **12주차** - 소셜 VR & Mozilla Hubs 활용\n\n"12주차 수업 알려줘"를 입력해보세요!`,
    };
  }

  // Help / greeting
  if (lower.includes('안녕') || lower.includes('hello') || lower.includes('help') || lower.includes('도움')) {
    return {
      type: 'text',
      content: `안녕하세요! 👋 저는 **게임/VR 콘텐츠 개론** 수업의 AI 튜터예요.\n\n**이렇게 물어보실 수 있어요:**\n- "3주차 수업 알려줘" → 해당 주차 학습 내용\n- "R-G-C-F 원칙 설명해줘" → 프롬프트 작성법\n- "과제 제출 링크" → 제출 페이지 안내\n- "Gamma 슬라이드" → 해당 주차 슬라이드\n- "Unity 알려줘" / "Figma 알려줘" → 실습 환경 안내\n\n로드맵에서 주차를 클릭해도 바로 안내드려요! 😊`,
    };
  }

  // Default
  return {
    type: 'text',
    content: `궁금한 점이 있으시군요! 😊\n\n좀 더 구체적으로 물어봐 주시면 도움드릴 수 있어요.\n\n**예시 질문:**\n- "n주차 수업 알려줘" (1~16)\n- "R-G-C-F 원칙 설명해줘"\n- "과제 제출 링크 알려줘"\n- "이번 주 AI 도구 추천해줘"`,
  };
}

function MessageBubble({ msg, currentWeek }) {
  if (msg.role === 'user') {
    return (
      <div className="bubble-wrap user">
        <div className="bubble user-bubble">{msg.content}</div>
        <div className="bubble-avatar user-avatar">나</div>
      </div>
    );
  }

  const { type, content, data } = msg.payload || { type: 'text', content: msg.content };

  return (
    <div className="bubble-wrap bot">
      <div className="bubble-avatar bot-avatar">🤖</div>
      <div className="bubble bot-bubble">
        {type === 'text' && <MarkdownText text={content} />}
        {type === 'week' && <WeekDetail week={data} />}
        {type === 'rgcf' && <RGCFCard />}
        {type === 'tools' && <ToolsCard week={data} />}
        {type === 'env' && <EnvCard week={data} />}
        {type === 'prompt' && <PromptCard week={data} />}
      </div>
    </div>
  );
}

function MarkdownText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="md-text">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="md-bold">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="md-li">• {line.slice(2)}</p>;
        }
        if (line.startsWith('```')) return null;
        if (line.startsWith('//')) {
          return <code key={i} className="md-code-line">{line}</code>;
        }
        // inline bold + links
        const parsed = parseInline(line);
        return line ? <p key={i}>{parsed}</p> : <br key={i} />;
      })}
    </div>
  );
}

function parseInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith('**')) {
      parts.push(<strong key={m.index}>{m[2]}</strong>);
    } else {
      parts.push(<a key={m.index} href={m[4]} target="_blank" rel="noopener noreferrer">{m[3]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function WeekDetail({ week }) {
  const gammaLink = GAMMA_LINKS[week.week];
  return (
    <div className="week-detail">
      <div className="week-detail-header">
        <span className="tag tag-week">{week.week}주차</span>
        <h3 className="week-detail-title">{week.title}</h3>
      </div>

      {week.submissionNote && (
        <div className="ot-notice">
          <div className="ot-notice-title">📌 필수 공지 — 과제 제출</div>
          <p>제출 링크: <a href={SUBMISSION_LINK} target="_blank" rel="noopener noreferrer">{SUBMISSION_LINK}</a></p>
          <p className="ot-warn">⚠️ AI 협업 내용과 본인 작성 부분을 <strong>주석으로 반드시 구분</strong>해야 합니다!</p>
          <div className="code-block">
            <code>{'// [AI 생성] ChatGPT가 작성한 부분'}</code>
            <code>{'// [본인 작성] 직접 수정하거나 추가한 부분'}</code>
          </div>
        </div>
      )}

      <div className="week-section">
        <div className="week-section-label">🎯 학습 목표</div>
        <p className="week-objective">{week.objective}</p>
      </div>

      <div className="week-section">
        <div className="week-section-label">📚 세부 내용</div>
        <ul className="topic-list">
          {week.topics.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      {week.aiTools && week.aiTools.length > 0 && (
        <div className="week-section">
          <div className="week-section-label">🤖 AI 도구</div>
          <div className="tool-chips">
            {week.aiTools.map((t, i) => (
              <div key={i} className="tool-chip">
                <span className="tag tag-tool">{t.name}</span>
                <span className="tool-purpose">{t.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {week.practiceEnv && week.practiceEnv.length > 0 && (
        <div className="week-section">
          <div className="week-section-label">💻 실습 환경</div>
          <div className="env-list">
            {week.practiceEnv.map((e, i) => (
              <div key={i} className="env-item">
                <span className="tag tag-env">{e.name}</span>
                <span className="env-desc">{e.desc}</span>
                {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="env-link">→ 열기</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {gammaLink && (
        <div className="gamma-banner">
          <span className="tag tag-gamma">Gamma</span>
          <span>{week.week}주차 슬라이드 자료가 있어요!</span>
          <a href={gammaLink} target="_blank" rel="noopener noreferrer" className="gamma-btn">슬라이드 열기 →</a>
        </div>
      )}

      <div className="week-section">
        <div className="week-section-label">✏️ 실습 프롬프트 (R-G-C-F)</div>
        <PromptCard week={week} compact />
      </div>
    </div>
  );
}

function PromptCard({ week, compact }) {
  const p = week.samplePrompt;
  if (!p) return null;
  return (
    <div className={`prompt-card ${compact ? 'compact' : ''}`}>
      {!compact && <div className="prompt-card-title">📝 {week.week}주차 실습 프롬프트</div>}
      <div className="prompt-rows">
        <div className="prompt-row"><span className="prompt-label r">R</span><span className="prompt-key">Role</span><span className="prompt-val">{p.role}</span></div>
        <div className="prompt-row"><span className="prompt-label g">G</span><span className="prompt-key">Goal</span><span className="prompt-val">{p.goal}</span></div>
        <div className="prompt-row"><span className="prompt-label c">C</span><span className="prompt-key">Context</span><span className="prompt-val">{p.context}</span></div>
        <div className="prompt-row"><span className="prompt-label f">F</span><span className="prompt-key">Format</span><span className="prompt-val">{p.format}</span></div>
      </div>
    </div>
  );
}

function RGCFCard() {
  const items = [
    { key: 'R', label: 'Role (역할)', desc: 'AI에게 어떤 전문가 역할을 맡길지 설정해요.', example: '"당신은 게임 스토리 작가입니다."', color: '#e84a5f' },
    { key: 'G', label: 'Goal (목표)', desc: '달성하고자 하는 구체적인 목표를 명시해요.', example: '"포스트 아포칼립스 VR 게임 시나리오 초안 작성"', color: '#f9a23a' },
    { key: 'C', label: 'Context (맥락)', desc: '배경 정보, 타겟 사용자, 제약 조건을 설명해요.', example: '"플레이어는 10-20대, 1인칭 시점"', color: '#4ac4e8' },
    { key: 'F', label: 'Format (형식)', desc: '원하는 출력 형식과 길이를 지정해요.', example: '"3개의 챕터 개요, 각 150자 이내"', color: '#7ec94a' },
  ];
  return (
    <div className="rgcf-card">
      <div className="rgcf-title">✏️ R-G-C-F 프롬프트 원칙</div>
      <p className="rgcf-desc">AI에게 더 좋은 답변을 받기 위한 4가지 핵심 요소예요!</p>
      <div className="rgcf-grid">
        {items.map((item) => (
          <div key={item.key} className="rgcf-item" style={{ borderColor: item.color + '44' }}>
            <div className="rgcf-key" style={{ background: item.color }}>{item.key}</div>
            <div className="rgcf-content">
              <div className="rgcf-label">{item.label}</div>
              <div className="rgcf-item-desc">{item.desc}</div>
              <div className="rgcf-example">예: {item.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsCard({ week }) {
  return (
    <div className="tools-card">
      <div className="tools-title">🤖 {week.week}주차 AI 도구 추천</div>
      {week.aiTools && week.aiTools.length > 0 ? (
        week.aiTools.map((t, i) => (
          <div key={i} className="tool-full-item">
            <span className="tag tag-tool">{t.name}</span>
            <span className="tool-full-purpose">{t.purpose}</span>
          </div>
        ))
      ) : (
        <p>이번 주차는 별도 AI 도구 실습이 없어요.</p>
      )}
    </div>
  );
}

function EnvCard({ week }) {
  return (
    <div className="env-card">
      <div className="env-title">💻 {week.week}주차 실습 환경</div>
      {week.practiceEnv && week.practiceEnv.length > 0 ? (
        week.practiceEnv.map((e, i) => (
          <div key={i} className="env-full-item">
            <span className="tag tag-env">{e.name}</span>
            <span className="env-full-desc">{e.desc}</span>
            {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="env-link">설치/접속 →</a>}
          </div>
        ))
      ) : (
        <p>이번 주차는 별도 실습 환경 설치가 필요하지 않아요.</p>
      )}
    </div>
  );
}

const WELCOME_MSG = {
  role: 'bot',
  id: 'welcome',
  payload: {
    type: 'text',
    content: `안녕하세요! 👋 저는 **게임/VR 콘텐츠 개론** 수업의 AI 튜터예요.\n\n로드맵에서 주차를 클릭하거나 아래 빠른 명령어를 사용해 보세요!\n\n**활용 방법:**\n- "3주차 수업 알려줘" → 해당 주차 학습 내용 & Gamma 슬라이드\n- "R-G-C-F 원칙 설명해줘" → 프롬프트 작성법 안내\n- "과제 제출 링크 알려줘" → 제출 페이지 바로가기\n- "Unity 알려줘" / "Figma 알려줘" → 실습 환경 가이드`,
  },
};

export default function ChatWindow({ selectedWeek, onClearWeek }) {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedWeek) {
      addBotMessage({ type: 'week', data: selectedWeek });
    }
  }, [selectedWeek]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addBotMessage = (payload) => {
    setMessages((prev) => [...prev, { role: 'bot', id: Date.now(), payload }]);
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: 'user', id: Date.now(), content: trimmed }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = generateTutorReply(trimmed, selectedWeek);
      setTyping(false);
      addBotMessage(reply);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="chat-window">
      {selectedWeek && (
        <div className="chat-context-bar">
          <span className="tag tag-week">{selectedWeek.week}주차</span>
          <span className="context-title">{selectedWeek.title}</span>
          <button className="context-clear" onClick={onClearWeek} title="주차 선택 해제">✕</button>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} currentWeek={selectedWeek} />
        ))}
        {typing && (
          <div className="bubble-wrap bot">
            <div className="bubble-avatar bot-avatar">🤖</div>
            <div className="bubble bot-bubble typing-bubble">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="quick-commands">
        {QUICK_COMMANDS.map((cmd) => (
          <button key={cmd.value} className="quick-btn" onClick={() => sendMessage(cmd.value)}>
            {cmd.label}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요 (예: '5주차 수업 알려줘', 'R-G-C-F 설명해줘')"
          rows={2}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
        >
          전송
        </button>
      </div>
    </div>
  );
}
