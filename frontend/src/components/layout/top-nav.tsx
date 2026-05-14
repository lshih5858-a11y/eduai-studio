"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/types";

const roleBadgeVariant: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  STUDENT: "secondary",
  PROFESSOR: "default",
  ASSISTANT: "outline",
  ADMIN: "destructive",
  RESEARCHER: "outline",
};

const roleLabelMap: Record<UserRole, string> = {
  STUDENT: "학생",
  PROFESSOR: "교수",
  ASSISTANT: "조교",
  ADMIN: "관리자",
  RESEARCHER: "연구자",
};

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Badge variant={roleBadgeVariant[user.role]}>
              {roleLabelMap[user.role]}
            </Badge>
            <span className="text-sm text-gray-600">{user.display_name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
