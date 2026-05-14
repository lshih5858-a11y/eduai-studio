"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/types";

interface DashboardStats {
  total_learners: number;
  high_risk_count: number;
  pending_interventions: number;
  avg_completion_rate: number;
}

function StatCard({ title, value, subtitle, highlight }: {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-red-200 bg-red-50" : ""}>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${highlight ? "text-red-700" : "text-gray-900"}`}>
          {value}
        </p>
        {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get("/api/v1/analytics/dashboard-stats").then((r) => r.data),
    enabled: user?.role !== "STUDENT",
  });

  if (!user) return null;

  // 학생용 대시보드
  if (user.role === "STUDENT") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user.display_name}님
          </h2>
          <p className="mt-1 text-gray-500">내 학습 현황을 확인하세요.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard title="수강 중인 강좌" value={2} subtitle="AI 기초 교양" />
          <StatCard title="완료한 과제" value="8 / 12" subtitle="이번 학기" />
          <StatCard title="퀴즈 평균 점수" value="78점" subtitle="최근 5회" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">나의 학습 동의 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">서비스 이용 동의</span>
              <Badge variant="default">동의됨</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">연구 참여 동의</span>
              <Badge variant="secondary">미동의</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI 로그 연구활용 동의</span>
              <Badge variant="secondary">미동의</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 교수/관리자용 대시보드
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">운영 현황</h2>
        <p className="mt-1 text-gray-500">전체 학습자 분석 요약</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard
            title="전체 학습자"
            value={stats?.total_learners ?? 0}
            subtitle="현재 수강생"
          />
          <StatCard
            title="고위험 학습자"
            value={stats?.high_risk_count ?? 0}
            subtitle="즉시 개입 필요"
            highlight={(stats?.high_risk_count ?? 0) > 0}
          />
          <StatCard
            title="승인 대기 개입"
            value={stats?.pending_interventions ?? 0}
            subtitle="교수 승인 필요"
            highlight={(stats?.pending_interventions ?? 0) > 0}
          />
          <StatCard
            title="평균 완료율"
            value={`${Math.round((stats?.avg_completion_rate ?? 0) * 100)}%`}
            subtitle="이번 학기"
          />
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-800">
          ⚠ Human-in-the-loop 알림
        </h3>
        <p className="mt-1 text-sm text-amber-700">
          고위험 학습자에 대한 개입은 반드시 교수 또는 상담자의 명시적 승인 후 실행됩니다.
          자동 실행되는 개입은 없습니다.
        </p>
      </div>
    </div>
  );
}
