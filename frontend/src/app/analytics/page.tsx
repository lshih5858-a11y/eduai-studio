"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskGauge } from "@/components/analytics/risk-gauge";
import type { LearnerRisk, RiskLevel } from "@/lib/types";

const RISK_BADGE: Record<RiskLevel, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  LOW: { label: "저위험", variant: "secondary" },
  MEDIUM: { label: "중위험", variant: "default" },
  HIGH: { label: "고위험", variant: "destructive" },
};

export default function AnalyticsPage() {
  const [search, setSearch] = useState("");

  const { data: learners, isLoading } = useQuery<LearnerRisk[]>({
    queryKey: ["cohort-risks"],
    queryFn: () => apiClient.get("/api/v1/analytics/cohort").then((r) => r.data),
  });

  const filtered = (learners ?? []).filter((l) =>
    l.pseudo_student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">학습 분석</h2>
          <p className="mt-1 text-sm text-gray-500">코호트 위험도 현황</p>
        </div>
        <input
          type="text"
          placeholder="학습자 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 위험도 분포 요약 */}
      <div className="grid grid-cols-3 gap-4">
        {(["HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map((level) => {
          const count = (learners ?? []).filter((l) => l.risk_level === level).length;
          const badge = RISK_BADGE[level];
          return (
            <Card key={level}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-2xl font-bold text-gray-900">{count}명</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 학습자 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((learner) => {
            const badge = RISK_BADGE[learner.risk_level];
            return (
              <Card
                key={learner.pseudo_student_id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  window.location.href = `/analytics/${learner.pseudo_student_id}`;
                }}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {learner.pseudo_student_id.slice(-4)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        학습자 {learner.pseudo_student_id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-400">
                        위험 점수: {Math.round(learner.risk_score * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RiskGauge score={learner.risk_score} riskLevel={learner.risk_level} />
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              조건에 맞는 학습자가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
