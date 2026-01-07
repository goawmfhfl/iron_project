"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { SocialingApplication, ApplicationStatus } from "@/lib/types/socialing-apply";
import { useModalStore } from "@/lib/stores/modal-store";

export default function SocialingApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { openModal, closeModal } = useModalStore();

  const [application, setApplication] = useState<SocialingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/socialing-applications/${id}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "신청 정보를 불러오는데 실패했습니다.");
      }
      const data = json?.application as SocialingApplication | undefined;
      if (!data) {
        setError("신청을 찾을 수 없습니다.");
        setApplication(null);
        return;
      }
      setApplication(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "신청 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusBadge = (s: ApplicationStatus) => {
    const cls =
      s === "APPROVED"
        ? "bg-success text-white"
        : s === "REJECTED"
          ? "bg-error text-white"
          : "bg-warning text-white";
    const label = s === "APPROVED" ? "승인" : s === "REJECTED" ? "거부" : "대기";
    return <span className={cn("inline-flex px-2 py-1 rounded text-xs font-medium", cls)}>{label}</span>;
  };

  const updateStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/socialing-applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          admin_note: adminNote.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "상태 변경에 실패했습니다.");
      }
      setAdminNote("");
      await fetchDetail();
      openModal({
        type: "CUSTOM",
        title: "상태 변경 완료",
        message: `신청 상태가 ${newStatus === "APPROVED" ? "승인" : newStatus === "REJECTED" ? "거부" : "대기"}로 변경되었습니다.`,
        primaryAction: { label: "확인", onClick: () => closeModal() },
      });
    } catch (e) {
      openModal({
        type: "CUSTOM",
        title: "상태 변경 실패",
        message: e instanceof Error ? e.message : "상태 변경에 실패했습니다.",
        primaryAction: { label: "확인", onClick: () => closeModal() },
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error mb-4">{error || "신청을 찾을 수 없습니다."}</p>
          <Button variant="outline" onClick={() => router.back()}>
            돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">신청 상세</h1>
          <p className="text-text-secondary">신청 내용을 확인하고 상태를 변경할 수 있습니다.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/socialing-applications")}>
          목록으로
        </Button>
      </div>

      <Card elevation={1}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">기본 정보</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 신청자 정보를 상단에 강조 표시 */}
          {(application.user_email || application.user_name) && (
            <div className="p-4 bg-primary-900/20 rounded-lg border border-primary-800 mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">신청자 정보</h3>
              <div className="space-y-1">
                {application.user_email && (
                  <div>
                    <span className="text-xs text-text-tertiary">이메일: </span>
                    <span className="text-sm font-medium text-text-primary">{application.user_email}</span>
                  </div>
                )}
                {application.user_name && (
                  <div>
                    <span className="text-xs text-text-tertiary">이름: </span>
                    <span className="text-sm font-medium text-text-primary">{application.user_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-tertiary mb-1">신청 ID</p>
              <p className="text-text-primary break-all">{application.id}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">소셜링 ID</p>
              <p className="text-text-primary break-all">{application.socialing_id}</p>
            </div>
            {application.socialing_title && (
              <div>
                <p className="text-sm text-text-tertiary mb-1">소셜링 제목</p>
                <p className="text-text-primary break-all">{application.socialing_title}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-text-tertiary mb-1">상태</p>
              {statusBadge(application.status)}
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">신청일</p>
              <p className="text-text-primary">{formatDateTime(application.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">수정일</p>
              <p className="text-text-primary">{formatDateTime(application.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">질문 답변</h2>
        </CardHeader>
        <CardContent>
          {application.question_answer ? (
            <div className="p-4 bg-surface-elevated rounded-lg border border-border">
              <pre className="text-sm text-text-primary whitespace-pre-wrap break-words">
                {application.question_answer}
              </pre>
            </div>
          ) : (
            <p className="text-text-secondary">답변이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {application.admin_note && (
        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">관리자 메모</h2>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border">
              <pre className="text-sm text-text-primary whitespace-pre-wrap break-words">
                {application.admin_note}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {application.status === "PENDING" && (
        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">상태 변경</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                관리자 메모 (선택사항)
              </label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="승인/거절 사유나 메모를 입력하세요..."
                rows={4}
              />
            </div>
            <div className="flex gap-4">
              <Button disabled={updating} onClick={() => updateStatus("APPROVED")} className="flex-1">
                승인
              </Button>
              <Button disabled={updating} variant="outline" onClick={() => updateStatus("REJECTED")} className="flex-1">
                거부
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

