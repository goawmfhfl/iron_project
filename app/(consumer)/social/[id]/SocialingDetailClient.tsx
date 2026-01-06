"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Socialing } from "@/lib/types/socialing";
import type { NotionPageContent } from "@/lib/types/notion";
import { NotionRenderer } from "@/components/notion/socialing/NotionRenderer";
import { SocialingCTAButton } from "@/components/consumer/SocialingCTAButton";
import { SocialingDetailInfo } from "@/components/consumer/SocialingDetailInfo";
import { Button } from "@/components/ui/Button";

interface SocialingDetailClientProps {
  socialing: Socialing;
  notionContent: NotionPageContent | null;
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
  socialing,
  notionContent,
}: SocialingDetailClientProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();

  useEffect(() => {
    // PENDING 상태일 때 모달 표시 (2단계 방어)
    if (socialing.status === "PENDING") {
      const typeText = getTypeText(socialing.type);
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
  }, [socialing.status, socialing.type, router, openModal, closeModal]);

  // PENDING 상태면 아무것도 렌더링하지 않음 (모달만 표시)
  if (socialing.status === "PENDING") {
    return null;
  }

  const pageIdForUrl = socialing.pageId.replace(/-/g, "");

  const handleApplyClick = () => {
    router.push(`/social/${pageIdForUrl}/apply`);
  };

  return (
    <div className="pb-24">
      {/* 소셜링 정보 카드 */}
      <SocialingDetailInfo socialing={socialing} />
      
      {/* Notion 콘텐츠 렌더링 */}
      {notionContent && notionContent.blocks && notionContent.blocks.length > 0 ? (
        <div className="mb-8">
          <NotionRenderer blocks={notionContent.blocks} />
        </div>
      ) : (
        <div className="mb-8 text-center py-12 text-text-secondary">
          상세 내용이 없습니다.
        </div>
      )}



      {/* 인라인 신청하기 버튼 */}
      <div className="mb-8 flex justify-center">
        <Button
          onClick={handleApplyClick}
          size="lg"
          className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
        >
          신청하기
        </Button>
      </div>

      {/* 고정 CTA 버튼 */}
      <SocialingCTAButton socialingId={pageIdForUrl} />
    </div>
  );
}
