"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { SocialingApplication, ApplicationStatus } from "@/lib/types/socialing-apply";
import { getSocialingApplicationById, updateApplicationStatus } from "@/lib/services/socialing-apply-service";
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

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSocialingApplicationById(id);
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
      await updateApplicationStatus(application.id, newStatus);
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

  const applicantEntries = Object.entries(application.applicant_data ?? {});

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-tertiary mb-1">신청 ID</p>
              <p className="text-text-primary break-all">{application.id}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">소셜링 ID</p>
              <p className="text-text-primary break-all">{application.socialing_id}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">폼 데이터베이스 ID</p>
              <p className="text-text-primary break-all">{application.form_database_id}</p>
            </div>
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
          <h2 className="text-xl font-semibold text-text-primary">신청자 입력</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicantEntries.length === 0 ? (
            <p className="text-text-secondary">입력 데이터가 없습니다.</p>
          ) : (
            applicantEntries.map(([key, value]) => {
              const isFileArray =
                Array.isArray(value) &&
                value.length > 0 &&
                typeof value[0] === "string" &&
                value[0].startsWith("http");

              return (
                <div key={key} className="border-b border-border pb-4 last:border-0">
                  <p className="text-sm font-medium text-text-primary mb-2">{key}</p>
                  {isFileArray ? (
                    <div className="space-y-2">
                      {(value as string[]).map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-surface-elevated rounded">
                          <span className="text-sm text-text-primary truncate">파일 {idx + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => window.open(url, "_blank")}>
                            열기
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-text-secondary whitespace-pre-wrap break-words">
                      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {application.status === "PENDING" && (
        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">상태 변경</h2>
          </CardHeader>
          <CardContent>
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

