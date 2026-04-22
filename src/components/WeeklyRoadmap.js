import React, { useState } from 'react';
import { WEEKS, GAMMA_LINKS } from '../data/curriculum';
import './WeeklyRoadmap.css';

const PHASE_MAP = {
  1: { label: '기초', color: '#6c3de8' },
  2: { label: '기초', color: '#6c3de8' },
  3: { label: '기획', color: '#0099cc' },
  4: { label: '기획', color: '#0099cc' },
  5: { label: '기획', color: '#0099cc' },
  6: { label: '설계', color: '#00a882' },
  7: { label: '설계', color: '#00a882' },
  8: { label: '중간', color: '#e8853d' },
  9: { label: '개발', color: '#c43de8' },
  10: { label: '개발', color: '#c43de8' },
  11: { label: '개발', color: '#c43de8' },
  12: { label: '소셜VR', color: '#3d8de8' },
  13: { label: '미디어', color: '#3d8de8' },
  14: { label: 'QA', color: '#e83d6c' },
  15: { label: '포트폴리오', color: '#e8d03d' },
  16: { label: '발표', color: '#ff6b35' },
};

export default function WeeklyRoadmap({ selectedWeek, onSelectWeek }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="roadmap-wrap">
      <div className="roadmap-header">
        <h2 className="roadmap-title">📅 16주 학습 로드맵</h2>
        <span className="roadmap-hint">주차를 클릭하면 AI 튜터와 대화할 수 있어요</span>
      </div>
      <div className="roadmap-grid">
        {WEEKS.map((w) => {
          const phase = PHASE_MAP[w.week];
          const isSelected = selectedWeek?.week === w.week;
          const hasGamma = !!GAMMA_LINKS[w.week];

          return (
            <button
              key={w.week}
              className={`week-cell ${isSelected ? 'selected' : ''} ${hovered === w.week ? 'hovered' : ''}`}
              style={{ '--phase-color': phase.color }}
              onClick={() => onSelectWeek(w)}
              onMouseEnter={() => setHovered(w.week)}
              onMouseLeave={() => setHovered(null)}
              title={w.title}
            >
              <div className="week-num">{w.week}주</div>
              <div className="week-phase" style={{ color: phase.color }}>{phase.label}</div>
              {hasGamma && <span className="week-gamma-dot" title="Gamma 슬라이드 있음" />}
              {isSelected && <span className="week-selected-ring" />}
            </button>
          );
        })}
      </div>
      {selectedWeek && (
        <div className="roadmap-selected-info">
          <span className="tag tag-week">{selectedWeek.week}주차</span>
          <span className="roadmap-selected-title">{selectedWeek.title}</span>
        </div>
      )}
    </div>
  );
}
