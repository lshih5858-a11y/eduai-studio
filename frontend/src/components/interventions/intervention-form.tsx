"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterventionCreate } from "@/lib/types";

const INTERVENTION_TYPES = [
  { value: "EMAIL_NUDGE", label: "이메일 알림" },
  { value: "CONSULTATION_REQUEST", label: "상담 요청" },
  { value: "PEER_MENTORING", label: "멘토링 연결" },
  { value: "SUPPLEMENTARY_MATERIAL", label: "보충 자료 제공" },
];

interface InterventionFormProps {
  targetPseudoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 개입 생성 폼
 * 생성된 개입은 PENDING_APPROVAL 상태로 저장되며, 교수/관리자 승인 후 실행됩니다.
 */
export function InterventionForm({ targetPseudoId, onSuccess, onCancel }: InterventionFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<InterventionCreate>({
    target_pseudo_student_id: targetPseudoId,
    intervention_type: "EMAIL_NUDGE",
    message: "",
    urgency: "NORMAL",
  });

  const mutation = useMutation({
    mutationFn: (data: InterventionCreate) =>
      apiClient.post("/api/v1/interventions", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">개입 요청 생성</CardTitle>
        <p className="text-xs text-amber-600">
          ⚠ 이 요청은 교수/관리자 승인 후 실행됩니다.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">개입 유형</label>
            <select
              value={form.intervention_type}
              onChange={(e) => setForm({ ...form, intervention_type: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {INTERVENTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">긴급도</label>
            <select
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value as "NORMAL" | "HIGH" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="NORMAL">일반</option>
              <option value="HIGH">긴급</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">개입 메시지</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={4}
              placeholder="학습자에게 전달할 개입 내용을 입력하세요..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">개입 요청에 실패했습니다.</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "저장 중..." : "개입 요청 제출"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
