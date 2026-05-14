"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Intervention } from "@/lib/types";

interface ApprovalPanelProps {
  intervention: Intervention;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING_APPROVAL: { label: "승인 대기", variant: "secondary" },
  APPROVED: { label: "승인됨", variant: "default" },
  REJECTED: { label: "거부됨", variant: "destructive" },
  EXECUTED: { label: "실행됨", variant: "outline" },
};

/**
 * 개입 승인/거부 패널
 * PENDING_APPROVAL 상태의 개입만 승인/거부 액션을 허용합니다.
 */
export function ApprovalPanel({ intervention }: ApprovalPanelProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: ({ act, r }: { act: "approve" | "reject"; r: string }) =>
      apiClient
        .post(`/api/v1/interventions/${intervention.id}/${act}`, { reason: r })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
      setShowDialog(false);
      setReason("");
    },
  });

  const openDialog = (act: "approve" | "reject") => {
    setAction(act);
    setShowDialog(true);
  };

  const badge = (STATUS_BADGE[intervention.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.PENDING_APPROVAL)!;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="text-xs text-gray-400">{intervention.intervention_type}</span>
          {(intervention.urgency_level === "HIGH" || intervention.urgency_level === "CRITICAL") && (
            <Badge variant="destructive" className="text-xs">긴급</Badge>
          )}
        </div>
        <p className="text-sm text-gray-700">{intervention.message}</p>
        <p className="text-xs text-gray-400">
          대상: 학습자 {intervention.target_pseudo_student_id.slice(-8)} ·{" "}
          {new Date(intervention.created_at).toLocaleString("ko-KR")}
        </p>
      </div>

      {intervention.status === "PENDING_APPROVAL" && (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => openDialog("reject")}
          >
            거부
          </Button>
          <Button
            size="sm"
            onClick={() => openDialog("approve")}
          >
            승인
          </Button>
        </div>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "개입 승인" : "개입 거부"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {action === "approve"
                ? "이 개입을 승인하면 즉시 실행됩니다. 계속하시겠습니까?"
                : "이 개입을 거부하는 이유를 입력해주세요."}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={action === "approve" ? "승인 메모 (선택)" : "거부 사유 (필수)"}
              required={action === "reject"}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                취소
              </Button>
              <Button
                variant={action === "reject" ? "destructive" : "default"}
                disabled={mutation.isPending || (action === "reject" && !reason.trim())}
                onClick={() => action && mutation.mutate({ act: action, r: reason })}
              >
                {mutation.isPending ? "처리 중..." : action === "approve" ? "승인 확정" : "거부 확정"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
