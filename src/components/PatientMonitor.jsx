import { useEffect, useRef } from 'react';
import { Heart, Wind, Thermometer, Activity, Brain } from 'lucide-react';

function VitalCard({ icon: Icon, label, value, unit, status }) {
  const colorMap = {
    normal: 'text-med-green border-med-green/30 bg-med-green/5',
    warning: 'text-med-yellow border-med-yellow/30 bg-med-yellow/5',
    critical: 'text-med-red border-med-red/30 bg-med-red/5',
    zero: 'text-slate-500 border-slate-700 bg-slate-800/30',
  };

  return (
    <div className={`rounded-lg border p-2.5 flex flex-col gap-1 ${colorMap[status]}`}>
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="opacity-70" />
        <span className="text-xs opacity-70 font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold font-mono leading-none">{value}</span>
        {unit && <span className="text-xs opacity-60 mb-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function EcgLine({ heartRate }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;

    function drawEcg() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = heartRate > 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = heartRate > 0 ? '#10b981' : '#ef4444';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const speed = heartRate > 0 ? 2 : 1;
      const bpm = heartRate > 0 ? heartRate : 60;
      const beatLen = (60 / bpm) * 60;

      for (let x = 0; x < w; x++) {
        const t = (x + offsetRef.current) % beatLen;
        let y = mid;

        if (heartRate === 0) {
          y = mid + (Math.random() < 0.02 ? (Math.random() - 0.5) * 6 : 0);
        } else {
          const phase = t / beatLen;
          if (phase < 0.1) y = mid - 2;
          else if (phase < 0.15) y = mid + 10;
          else if (phase < 0.2) y = mid - 18;
          else if (phase < 0.25) y = mid + 6;
          else if (phase < 0.3) y = mid - 4;
          else if (phase < 0.5) y = mid - 2;
          else if (phase < 0.55) y = mid - 6;
          else if (phase < 0.6) y = mid + 4;
          else y = mid;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      offsetRef.current = (offsetRef.current + speed) % beatLen;
      frameRef.current = requestAnimationFrame(drawEcg);
    }

    drawEcg();
    return () => cancelAnimationFrame(frameRef.current);
  }, [heartRate]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={50}
      className="w-full h-12 rounded"
    />
  );
}

function getHRStatus(hr) {
  if (hr === 0) return 'critical';
  if (hr < 50 || hr > 120) return 'warning';
  return 'normal';
}

function getSpO2Status(spo2) {
  if (spo2 === 0) return 'zero';
  if (spo2 < 90) return 'critical';
  if (spo2 < 95) return 'warning';
  return 'normal';
}

function getBPStatus(bp) {
  if (bp === '측정불가') return 'critical';
  const sys = parseInt(bp);
  if (isNaN(sys)) return 'zero';
  if (sys < 90) return 'warning';
  return 'normal';
}

function getRespStatus(resp) {
  if (resp === 0) return 'critical';
  if (resp < 10 || resp > 24) return 'warning';
  return 'normal';
}

export default function PatientMonitor({ vitals }) {
  const { bloodPressure, heartRate, spO2, respiration, temperature, consciousness } = vitals;

  return (
    <div className="bg-med-card border border-med-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-med-cyan" />
          <span className="text-xs font-semibold text-med-cyan tracking-wider uppercase">Patient Monitor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${heartRate > 0 ? 'bg-med-green animate-pulse' : 'bg-med-red animate-blink-dot'}`}
          />
          <span className={`text-xs font-medium ${heartRate > 0 ? 'text-med-green' : 'text-med-red'}`}>
            {heartRate > 0 ? 'MONITORING' : 'CARDIAC ARREST'}
          </span>
        </div>
      </div>

      <div className="bg-black/40 rounded-lg p-2 border border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-mono">ECG II</span>
          <span className={`text-xs font-mono ${heartRate > 0 ? 'text-med-green' : 'text-med-red'}`}>
            {heartRate > 0 ? `${heartRate} bpm` : 'FLATLINE'}
          </span>
        </div>
        <EcgLine heartRate={heartRate} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <VitalCard
          icon={Heart}
          label="심박수"
          value={heartRate === 0 ? '--' : heartRate}
          unit="bpm"
          status={getHRStatus(heartRate)}
        />
        <VitalCard
          icon={Activity}
          label="산소포화도"
          value={spO2 === 0 ? '--' : `${spO2}%`}
          unit=""
          status={getSpO2Status(spO2)}
        />
        <VitalCard
          icon={Activity}
          label="혈압"
          value={bloodPressure}
          unit="mmHg"
          status={getBPStatus(bloodPressure)}
        />
        <VitalCard
          icon={Wind}
          label="호흡수"
          value={respiration === 0 ? '--' : respiration}
          unit="회/분"
          status={getRespStatus(respiration)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <VitalCard
          icon={Thermometer}
          label="체온"
          value={temperature}
          unit="°C"
          status="normal"
        />
        <VitalCard
          icon={Brain}
          label="의식"
          value={consciousness}
          unit=""
          status={consciousness === 'GCS 3' ? 'critical' : consciousness.includes('7') || consciousness.includes('8') ? 'warning' : 'normal'}
        />
      </div>
    </div>
  );
}
