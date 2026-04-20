import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Film, Music } from 'lucide-react';

const STAGE_AUDIO = {
  DISCOVERY: { label: '현장음 — 식당 소음 + 쓰러지는 소리', type: 'ambient' },
  ASSESSMENT: { label: '경고음 — 모니터 심정지 알람', type: 'alarm' },
  INTERVENTION: { label: 'CPR 가이드음 + AED 음성 안내', type: 'cpr' },
  OUTCOME: { label: '회복 사운드 — 모니터 리듬 회복', type: 'recovery' },
};

const STAGE_VIDEO = {
  DISCOVERY: '응급 상황 발생 영상',
  ASSESSMENT: '맥박/호흡 확인 데모',
  INTERVENTION: 'CPR + AED 시범 영상',
  OUTCOME: 'ROSC 처치 가이드',
};

function AudioVisualizer({ isPlaying, type }) {
  const barCount = 12;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm transition-all ${
            type === 'alarm' ? 'bg-med-red' : type === 'cpr' ? 'bg-med-cyan' : 'bg-med-green'
          }`}
          style={{
            height: isPlaying
              ? `${20 + Math.sin((i / barCount) * Math.PI * 2) * 12 + Math.random() * 8}%`
              : '15%',
            opacity: isPlaying ? 0.8 + Math.random() * 0.2 : 0.3,
            animation: isPlaying ? `pulse ${0.3 + (i % 3) * 0.15}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function MediaPlayer({ stage }) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const audio = STAGE_AUDIO[stage] || STAGE_AUDIO.DISCOVERY;
  const videoLabel = STAGE_VIDEO[stage] || STAGE_VIDEO.DISCOVERY;

  return (
    <div className="bg-med-card border border-med-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Film size={15} className="text-med-cyan" />
        <span className="text-xs font-semibold text-med-cyan tracking-wider uppercase">Media Assets</span>
        <span className="ml-auto text-xs text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">Veo 3</span>
      </div>

      {/* 비디오 플레이어 영역 */}
      <div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-med-border overflow-hidden cursor-pointer group"
        style={{ aspectRatio: '16/9' }}
        onClick={() => setVideoOpen(!videoOpen)}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {!videoOpen ? (
            <>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/20">
                <Play size={18} className="text-white ml-0.5" />
              </div>
              <p className="text-xs text-slate-400 text-center px-4">{videoLabel}</p>
              <p className="text-xs text-slate-600">Veo 3 생성 영상 자리</p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-xs text-slate-300">{videoLabel}</p>
              <p className="text-xs text-slate-500 mt-1">재생 중 (시뮬레이션)</p>
            </div>
          )}
        </div>

        {/* 오버레이 스캔라인 효과 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </div>

      {/* 오디오 플레이어 */}
      <div className="bg-black/30 rounded-lg border border-med-border p-3">
        <div className="flex items-center gap-2">
          <Music size={13} className="text-slate-400 shrink-0" />
          <p className="text-xs text-slate-400 flex-1 truncate">{audio.label}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setAudioPlaying(!audioPlaying)}
            className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
              audioPlaying
                ? 'bg-med-cyan/20 border-med-cyan/50 text-med-cyan'
                : 'bg-med-border/50 border-med-border text-slate-400 hover:text-white'
            }`}
          >
            {audioPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
          <div className="flex-1">
            <AudioVisualizer isPlaying={audioPlaying} type={audio.type} />
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
