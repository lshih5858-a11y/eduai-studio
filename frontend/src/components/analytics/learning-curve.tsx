"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LearningPoint {
  week: string;
  score: number;
  cohort_avg: number;
}

interface LearningCurveProps {
  data: LearningPoint[];
}

/**
 * 학습 진도 추이 차트 (개인 점수 vs 코호트 평균)
 */
export function LearningCurve({ data }: LearningCurveProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">학습 진도 추이</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => `${value}점`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="score"
            name="내 점수"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="cohort_avg"
            name="코호트 평균"
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
