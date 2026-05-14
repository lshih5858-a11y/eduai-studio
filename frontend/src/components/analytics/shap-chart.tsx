"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ReasonCode } from "@/lib/types";

interface ShapChartProps {
  reasonCodes: ReasonCode[];
  title?: string;
}

/**
 * SHAP 기반 위험 요인 수평 막대 차트
 * 빨간색: 위험 증가 요인, 초록색: 위험 감소 요인
 */
export function ShapChart({ reasonCodes, title = "위험 요인 분석 (SHAP)" }: ShapChartProps) {
  const sorted = [...reasonCodes].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)
  );

  const featureLabelMap: Record<string, string> = {
    submission_delay_days: "과제 제출 지연(일)",
    forum_activity_count: "토론 참여 횟수",
    quiz_avg_score: "퀴즈 평균 점수",
    video_completion_rate: "강의 영상 완료율",
    login_frequency: "로그인 빈도",
    peer_interaction_count: "동료 상호작용",
  };

  const data = sorted.map((rc) => ({
    name: featureLabelMap[rc.feature] ?? rc.feature,
    value: rc.shap_value,
    direction: rc.direction,
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="text-xs text-gray-400">
        SHAP 기반 설명 — 모델이 이 학습자의 위험도를 높게 예측한 이유를 보여줍니다.
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, bottom: 4, left: 140 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => v.toFixed(2)}
            domain={["dataMin - 0.05", "dataMax + 0.05"]}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={135} />
          <Tooltip
            formatter={(value: number) => [
              `SHAP: ${value > 0 ? "+" : ""}${value.toFixed(3)}`,
              "기여도",
            ]}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.direction === "increases_risk" ? "#ef4444" : "#22c55e"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-400" /> 위험 증가
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-400" /> 위험 감소
        </span>
      </div>
    </div>
  );
}
