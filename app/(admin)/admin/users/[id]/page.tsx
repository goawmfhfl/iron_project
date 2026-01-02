"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserDetailForm } from "@/components/admin/UserDetailForm";
import { getUserById, updateUser } from "@/lib/services/user-service";
import type { AdminUser, UpdateUserInput } from "@/lib/types/user";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserById(id);
        if (!data) {
          setError("회원을 찾을 수 없습니다.");
          return;
        }
        setUser(data);
      } catch (err) {
        console.error("회원 조회 실패:", err);
        setError(
          err instanceof Error ? err.message : "회원 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleSubmit = async (data: UpdateUserInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateUser(id, data);
      // 수정 후 다시 조회
      const updatedUser = await getUserById(id);
      if (updatedUser) {
        setUser(updatedUser);
      }
      alert("회원 정보가 수정되었습니다.");
    } catch (err) {
      console.error("회원 정보 수정 실패:", err);
      setError(
        err instanceof Error ? err.message : "회원 정보 수정에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            목록으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            회원 상세 정보
          </h1>
          <p className="text-text-secondary">
            회원 정보를 조회하고 수정할 수 있습니다.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          목록으로
        </Button>
      </div>

      {error && (
        <Card elevation={1}>
          <CardContent className="py-4">
            <p className="text-error text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card elevation={2}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">
            기본 정보
          </h2>
        </CardHeader>
        <CardContent>
          <UserDetailForm
            user={user}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

