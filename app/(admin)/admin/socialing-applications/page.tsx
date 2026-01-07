"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, SocialingApplication } from "@/lib/types/socialing-apply";

export default function SocialingApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<SocialingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [formDatabaseType, setFormDatabaseType] = useState<string>("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (formDatabaseType) params.set("form_database_type", formDatabaseType);
      if (status) params.set("status", status);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      const res = await fetch(`/api/admin/socialing-applications?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "신청 목록을 불러오는데 실패했습니다.");
      }
      setApplications((json?.applications ?? []) as SocialingApplication[]);
      setTotal(Number(json?.total ?? 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "신청 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, formDatabaseType, status, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

  const formTypeLabel = (t: string) => {
    if (t === "DORAN_BOOK") return "도란책방";
    if (t === "EVENT") return "이벤트";
    if (t === "VIVID") return "비비드";
    return t;
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">소셜링 신청 관리</h1>
        <p className="text-text-secondary">신청 내역을 조회하고 상태를 변경할 수 있습니다.</p>
      </div>

      <Card elevation={1}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">필터</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="폼 타입"
              value={formDatabaseType}
              onChange={(e) => {
                setFormDatabaseType(e.target.value as any);
                setPage(1);
              }}
              options={[
                { value: "", label: "전체" },
                { value: "DORAN_BOOK", label: "도란책방" },
                { value: "EVENT", label: "이벤트" },
                { value: "VIVID", label: "비비드" },
              ]}
            />
            <Select
              label="상태"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              options={[
                { value: "", label: "전체" },
                { value: "PENDING", label: "대기" },
                { value: "APPROVED", label: "승인" },
                { value: "REJECTED", label: "거부" },
              ]}
            />
            <Input label="시작일" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
            <Input label="종료일" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
          </div>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">신청 목록 ({total}건)</h2>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-12 text-center">
              <p className="text-error mb-4">{error}</p>
              <Button variant="outline" onClick={fetchList}>다시 시도</Button>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-secondary">신청 내역이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">신청일</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">신청자</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">소셜링</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">폼</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-border cursor-pointer hover:bg-surface-hover transition-colors"
                        onClick={() => router.push(`/admin/socialing-applications/${app.id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-text-secondary">{formatDateTime(app.created_at)}</td>
                        <td className="py-3 px-4 text-sm">
                          {app.user_email ? (
                            <div>
                              <div className="text-text-primary font-medium">{app.user_email}</div>
                              {app.user_name && (
                                <div className="text-text-secondary text-xs mt-0.5">{app.user_name}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-tertiary">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {app.socialing_title || app.socialing_id.slice(0, 8) + "..."}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{formTypeLabel(app.form_database_type)}</td>
                        <td className="py-3 px-4">{statusBadge(app.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-text-secondary">
                    {page} / {totalPages} 페이지
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      이전
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

