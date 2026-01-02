"use client";

import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/types/user";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: AdminUser[];
  className?: string;
}

export function UserTable({ users, className }: UserTableProps) {
  const router = useRouter();

  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-error text-white";
      case "premium_user":
        return "bg-warning text-white";
      default:
        return "bg-surface-elevated text-text-primary";
    }
  };

  if (users.length === 0) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-text-secondary">등록된 회원이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-elevated">
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              이메일
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              닉네임
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              전화번호
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              성별
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              역할
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
              가입일
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user.id)}
              className="border-b border-surface-elevated hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm text-text-primary">
                {user.email}
              </td>
              <td className="px-4 py-3 text-sm text-text-primary">
                {user.nickname || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-text-primary">
                {user.phone || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-text-primary">
                {user.gender || "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                    getRoleBadgeColor(user.user_role)
                  )}
                >
                  {user.user_role === "admin"
                    ? "관리자"
                    : user.user_role === "premium_user"
                    ? "프리미엄"
                    : "일반"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-text-secondary">
                {formatDate(user.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

