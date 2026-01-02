"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { UserTable } from "@/components/admin/UserTable";
import { getAllUsers } from "@/lib/services/user-service";
import type { AdminUser } from "@/lib/types/user";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("회원 목록 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "회원 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="text-primary-600 hover:text-primary-700"
          >
            다시 시도
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          회원 관리
        </h1>
        <p className="text-text-secondary">
          등록된 회원 정보를 조회하고 관리할 수 있습니다.
        </p>
      </div>

      <Card elevation={2}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">
            회원 목록 ({users.length}명)
          </h2>
        </CardHeader>
        <CardContent>
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}

