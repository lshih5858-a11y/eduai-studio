"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskGauge } from "@/components/analytics/risk-gauge";
import { ShapChart } from "@/components/analytics/shap-chart";
import { LearningCurve } from "@/components/analytics/learning-curve";
import type { LearnerAnalytics } from "@/lib/types";

export default function LearnerAnalyticsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  const { data, isLoading, error } = useQuery<LearnerAnalytics>({
    queryKey: ["learner-analytics", studentId],
    queryFn: () =>
      apiClient.get(`/api/v1/analytics/learner/${studentId}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">학습자 데이터를 불러올 수 없습니다.</p>
        <Link href="/analytics" className="mt-2 text-sm text-blue-600 hover:underline">
          ← 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/analytics"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← 코호트 분석
          </Link>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            학습자 {data.pseudo_student_id.slice(-8)}
          </h2>
          <p className="text-xs text-gray-400">
            가명 ID: {data.pseudo_student_id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">분석 시각</p>
          <p className="text-xs text-gray-600">
            {new Date(data.computed_at).toLocaleString("ko-KR")}
          </p>
          <p className="mt-1 text-xs text-gray-400">모델 버전: {data.model_version}</p>
        </div>
      </div>

      {/* 위험도 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">위험도 점수</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <RiskGauge score={data.risk_score} riskLevel={data.risk_level} />
            <p className="mt-3 text-center text-xs text-gray-400">
              {data.calibration_note}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">위험 요인 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <ShapChart reasonCodes={data.reason_codes} />
          </CardContent>
        </Card>
      </div>

      {/* 학습 곡선 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">학습 진도 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <LearningCurve data={data.learning_curve ?? []} />
        </CardContent>
      </Card>

      {/* 권장 개입 */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">
              AI 권장 개입
              <span className="ml-2 text-xs font-normal text-gray-400">
                (교수 승인 필요 — Human-in-the-loop)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3"
              >
                <Badge variant="outline" className="shrink-0 text-blue-700 border-blue-300">
                  {rec.type}
                </Badge>
                <div>
                  <p className="text-sm text-gray-900">{rec.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    신뢰도: {Math.round(rec.confidence * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
