"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ConsentCard } from "@/components/consent/consent-card";
import type { ConsentRecord, ConsentType } from "@/lib/types";

const CONSENT_TYPES: ConsentType[] = [
  "SERVICE_USE",
  "RESEARCH_PARTICIPATION",
  "THIRD_PARTY_SHARING",
  "AI_LOG_RESEARCH",
];

export default function ConsentPage() {
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery<ConsentRecord[]>({
    queryKey: ["consent-records"],
    queryFn: () => apiClient.get("/api/v1/consent/my").then((r) => r.data),
  });

  const grantMutation = useMutation({
    mutationFn: (consentType: ConsentType) =>
      apiClient.post("/api/v1/consent/grant", { consent_type: consentType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consent-records"] }),
  });

  const revokeMutation = useMutation({
    mutationFn: (consentType: ConsentType) =>
      apiClient.post("/api/v1/consent/revoke", { consent_type: consentType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consent-records"] }),
  });

  const getRecord = (type: ConsentType): ConsentRecord | null =>
    records?.find((r) => r.consent_type === type) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">동의 관리</h2>
        <p className="mt-1 text-sm text-gray-500">
          각 동의 항목은 독립적으로 설정할 수 있습니다. 언제든지 철회 가능합니다.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-800">개인정보 처리 안내</h3>
        <p className="mt-1 text-sm text-blue-700">
          U-AI Compass는 「개인정보 보호법」에 따라 목적별 분리 동의를 운영합니다.
          각 동의의 범위, 보존 기간, 파기 방법에 대한 자세한 내용은{" "}
          <a href="#" className="underline">개인정보 처리방침</a>을 참고하세요.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {CONSENT_TYPES.map((type) => (
            <ConsentCard
              key={type}
              consentType={type}
              record={getRecord(type)}
              onGrant={async (t) => { await grantMutation.mutateAsync(t); }}
              onRevoke={async (t) => { await revokeMutation.mutateAsync(t); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
