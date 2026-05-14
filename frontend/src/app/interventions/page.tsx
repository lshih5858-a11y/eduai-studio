"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ApprovalPanel } from "@/components/interventions/approval-panel";
import type { Intervention } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "ALL", label: "전체" },
  { value: "PENDING_APPROVAL", label: "승인 대기" },
  { value: "APPROVED", label: "승인됨" },
  { value: "REJECTED", label: "거부됨" },
  { value: "EXECUTED", label: "실행됨" },
];

export default function InterventionsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: interventions, isLoading } = useQuery<Intervention[]>({
    queryKey: ["interventions", statusFilter],
    queryFn: () => {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      return apiClient.get(`/api/v1/interventions${params}`).then((r) => r.data);
    },
  });

  const pendingCount = (interventions ?? []).filter(
    (i) => i.status === "PENDING_APPROVAL"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">개입 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            모든 개입은 교수/관리자 승인 후 실행됩니다.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            승인 대기 {pendingCount}건
          </div>
        )}
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Human-in-the-loop 안내 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-800">Human-in-the-loop 정책</h3>
        <p className="mt-1 text-sm text-amber-700">
          학습자에게 영향이 큰 모든 개입은 자동 실행이 금지됩니다. 교수 또는 상담자의
          명시적 승인 단계를 거쳐야 합니다.
        </p>
      </div>

      {/* 개입 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(interventions ?? []).map((intervention) => (
            <ApprovalPanel key={intervention.id} intervention={intervention} />
          ))}
          {(interventions ?? []).length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              조건에 맞는 개입이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
