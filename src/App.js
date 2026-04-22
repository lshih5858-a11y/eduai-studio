import React, { useState } from 'react';
import WeeklyRoadmap from './components/WeeklyRoadmap';
import ChatWindow from './components/ChatWindow';
import FeedbackPanel from './components/FeedbackPanel';
import './App.css';

export default function App() {
  const [activeTab, setActive] = useState('chat');
  const [selectedWeek, setSelectedWeek] = useState(null);

  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    setActive('chat');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">🎮</span>
            <div>
              <h1 className="brand-title">게임/VR 하이브리드 학습 지원 앱</h1>
              <p className="brand-sub">AI 튜터 · 16주 커리큘럼 · Glow &amp; Grow 피드백</p>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-dot" />
            AI 튜터 활성
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* 상단 로드맵 */}
        <section className="section-roadmap">
          <WeeklyRoadmap selectedWeek={selectedWeek} onSelectWeek={handleWeekSelect} />
        </section>

        {/* 중앙 탭 영역 */}
        <section className="section-main">
          <div className="tab-bar">
            {[
              { id: 'chat', label: '💬 AI 튜터 대화', icon: '💬' },
              { id: 'feedback', label: '✨ Glow & Grow 피드백', icon: '✨' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActive(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'chat' && (
              <ChatWindow selectedWeek={selectedWeek} onClearWeek={() => setSelectedWeek(null)} />
            )}
            {activeTab === 'feedback' && <FeedbackPanel />}
          </div>
        </section>
      </div>

      <footer className="app-footer">
        <span>게임/VR 콘텐츠 개론 · AI 기반 하이브리드 수업</span>
        <span className="footer-divider">|</span>
        <span>수석 AI 튜터 시스템 v1.0</span>
      </footer>
    </div>
  );
}
