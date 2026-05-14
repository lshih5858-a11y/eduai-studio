"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ConsentRecord, ConsentType } from "@/lib/types";

const CONSENT_LABELS: Record<ConsentType, { title: string; description: string; required: boolean }> = {
  SERVICE_USE: {
    title: "서비스 이용 동의",
    description:
      "U-AI Compass 플랫폼 이용을 위한 기본 동의입니다. 학습 데이터 수집 및 분석 서비스 제공에 활용됩니다.",
    required: true,
  },
  RESEARCH_PARTICIPATION: {
    title: "연구 참여 동의",
    description:
      "교육부 AI 기본교육과정 효과성 연구에 익명화된 학습 데이터가 활용됩니다. IRB 승인 연구에 한합니다.",
    required: false,
  },
  THIRD_PARTY_SHARING: {
    title: "제3자 제공 동의",
    description:
      "협력 기관과의 공동 연구를 위해 가명처리된 데이터가 제공될 수 있습니다. 별도 안내 후 진행합니다.",
    required: false,
  },
  AI_LOG_RESEARCH: {
    title: "AI 로그 연구활용 동의",
    description:
      "생성형 AI 활용 기록(학습 맥락 포함)이 AI 교육 연구에 활용됩니다. 식별 불가 처리 후 사용합니다.",
    required: false,
  },
};

interface ConsentCardProps {
  consentType: ConsentType;
  record: ConsentRecord | null;
  onGrant: (type: ConsentType) => Promise<void>;
  onRevoke: (type: ConsentType) => Promise<void>;
}

export function ConsentCard({ consentType, record, onGrant, onRevoke }: ConsentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const meta = CONSENT_LABELS[consentType];
  const isGranted = record?.granted ?? false;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isGranted) {
        await onRevoke(consentType);
      } else {
        await onGrant(consentType);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={isGranted ? "border-green-200 bg-green-50/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm">{meta.title}</CardTitle>
            {meta.required && (
              <Badge variant="destructive" className="mt-1 text-xs">
                필수
              </Badge>
            )}
          </div>
          <Badge variant={isGranted ? "default" : "secondary"}>
            {isGranted ? "동의됨" : "미동의"}
          </Badge>
        </div>
        <CardDescription className="text-xs">{meta.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {record?.granted_at && (
            <p className="text-xs text-gray-400">
              동의일: {new Date(record.granted_at).toLocaleDateString("ko-KR")}
            </p>
          )}
          {!meta.required && (
            <Button
              size="sm"
              variant={isGranted ? "outline" : "default"}
              disabled={isLoading}
              onClick={handleToggle}
              className="ml-auto"
            >
              {isLoading ? "처리 중..." : isGranted ? "동의 철회" : "동의"}
            </Button>
          )}
          {meta.required && !isGranted && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={handleToggle}
              className="ml-auto"
            >
              {isLoading ? "처리 중..." : "동의"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
