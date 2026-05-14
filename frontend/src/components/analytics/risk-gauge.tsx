"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  score: number;  // 0.0 ~ 1.0
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

const RISK_COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

const RISK_LABELS = {
  LOW: "저위험",
  MEDIUM: "중위험",
  HIGH: "고위험",
};

/**
 * 위험도 게이지 차트 (반원형 Pie 차트 사용)
 */
export function RiskGauge({ score, riskLevel }: RiskGaugeProps) {
  const percentage = Math.round(score * 100);
  const color = RISK_COLORS[riskLevel];

  const gaugeData = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage}%
          </span>
        </div>
      </div>
      <div
        className="mt-1 rounded-full px-3 py-1 text-sm font-semibold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {RISK_LABELS[riskLevel]}
      </div>
    </div>
  );
}
