"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/lib/stores/modal-store";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Socialing } from "@/lib/types/socialing";
import type { NotionPageContent } from "@/lib/types/notion";
import { NotionRenderer } from "@/components/notion/socialing/NotionRenderer";
import { SocialingCTAButton } from "@/components/consumer/SocialingCTAButton";
import { Button } from "@/components/ui/Button";
import { useSocialingDetail } from "@/lib/hooks/useSocialingDetail";
import { Card, CardContent } from "@/components/ui/Card";
// 이미지 에러는 handleImageError에서 직접 처리하므로 import 불필요

interface SocialingDetailClientProps {
  socialingId: string;
}

/**
 * 타입별 텍스트
 */
function getTypeText(type: string): string {
  switch (type) {
    case "CHALLENGE":
      return "챌린지";
    case "SOCIALING":
      return "소셜링";
    case "EVENT":
      return "이벤트";
    default:
      return "이벤트";
  }
}

export function SocialingDetailClient({
  socialingId,
}: SocialingDetailClientProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();
  const { user, loading } = useAuth();
  const { data, isLoading, error, refetch } = useSocialingDetail(socialingId);

  // 이미지 에러는 handleImageError에서 직접 페이지 새로고침을 처리하므로
  // 여기서는 이벤트 리스너가 필요 없습니다.

  // useEffect는 항상 호출되어야 하므로 조건부 return 전에 배치
  useEffect(() => {
    // PENDING 상태일 때 모달 표시 (2단계 방어)
    if (data?.socialing?.status === "PENDING") {
      const typeText = getTypeText(data.socialing.type);
      openModal({
        type: "CUSTOM",
        title: "예정 이벤트",
        message: `아직 예정중인 ${typeText} 입니다`,
        primaryAction: {
          label: "확인",
          onClick: () => {
            closeModal();
            router.back();
          },
        },
      });
    }
  }, [data?.socialing?.status, data?.socialing?.type, router, openModal, closeModal]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-surface-elevated rounded animate-pulse" />
        <div className="h-64 bg-surface-elevated rounded animate-pulse" />
        <div className="h-96 bg-surface-elevated rounded animate-pulse" />
      </div>
    );
  }

  // 에러 발생
  if (error || !data) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error font-semibold mb-4">
            소셜링을 불러올 수 없습니다.
          </p>
          <p className="text-sm text-text-tertiary mb-6">
            {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
          </p>
          <Button variant="outline" onClick={() => router.push("/social")}>
            목록으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { socialing, notionContent } = data;

  // PENDING 상태일 때도 페이지를 보여주되, 명확한 안내 표시

  const pageIdForUrl = socialing.pageId.replace(/-/g, "");

  const handleApplyClick = () => {
    const applyPath = `/social/${pageIdForUrl}/apply`;

    // 아직 로딩 중이면 잠시 막고, 다시 시도하도록 안내
    if (loading) {
      openModal({
        type: "CUSTOM",
        title: "잠시만요",
        message: "로그인 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.",
        primaryAction: {
          label: "확인",
          onClick: () => closeModal(),
        },
      });
      return;
    }

    if (!user) {
      openModal({
        type: "CUSTOM",
        title: "로그인 필요",
        message: "소셜링 신청은 회원만 가능합니다. 로그인 후 다시 시도해주세요.",
        primaryAction: {
          label: "로그인하기",
          onClick: () => {
            closeModal();
            router.push(`/login?redirect=${encodeURIComponent(applyPath)}`);
          },
        },
        secondaryAction: {
          label: "닫기",
          onClick: () => closeModal(),
        },
      });
      return;
    }

    router.push(applyPath);
  };

  return (
    <div className="pb-24">
      {/* PENDING 상태일 때 상단 안내 배너 */}
      {socialing.status === "PENDING" && (
        <div className="mb-6 rounded-xl border-2 border-yellow-500/50 bg-yellow-900/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-300 mb-1">
                오픈 예정
              </h3>
              <p className="text-sm text-yellow-400">
                이 {getTypeText(socialing.type)}는 아직 오픈 예정입니다. 곧 만나요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notion 콘텐츠 렌더링 
        - '상세정보' 콜아웃: SocialingDetailInfo
        - '신청버튼' 콜아웃: 인라인 신청 버튼 (handleApplyClick 사용)
      */}
      {notionContent && notionContent.blocks && notionContent.blocks.length > 0 ? (
        <div className="mb-8">
          <NotionRenderer
            blocks={notionContent.blocks}
            socialing={socialing}
            renderApplyButton={() => (
              <div className="mb-8 flex justify-center">
                <Button
                  onClick={handleApplyClick}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                  disabled={socialing.status === "PENDING"}
                >
                  {socialing.status === "PENDING" ? "오픈 예정" : "신청하기"}
                </Button>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="mb-8 text-center py-12 text-text-secondary">
          상세 내용이 없습니다.
        </div>
      )}

      {/* 고정 CTA 버튼 - PENDING 상태일 때는 표시하지 않음 */}
      {socialing.status !== "PENDING" && (
        <SocialingCTAButton socialingId={pageIdForUrl} />
      )}
    </div>
  );
}
