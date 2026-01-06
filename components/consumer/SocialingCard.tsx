"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Socialing, SocialingType } from "@/lib/types/socialing";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/utils/date";
import { useModalStore } from "@/lib/stores/modal-store";

interface SocialingCardProps {
  socialing: Socialing;
  className?: string;
}

/**
 * 타입별 뱃지 텍스트
 */
function getTypeBadgeText(type: SocialingType): string {
  switch (type) {
    case "CHALLENGE":
      return "챌린지";
    case "SOCIALING":
      return "소셜링";
    case "EVENT":
      return "이벤트";
    default:
      return "";
  }
}

/**
 * 타입별 뱃지 색상 클래스
 */
function getTypeBadgeColorClass(type: SocialingType): string {
  switch (type) {
    case "CHALLENGE":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
    case "SOCIALING":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700";
    case "EVENT":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700";
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
  }
}

/**
 * 상태별 스타일 클래스
 */
function getStatusStyleClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "";
    case "PENDING":
      return "opacity-75";
    case "FINISH":
      return "opacity-60";
    default:
      return "";
  }
}

/**
 * 비용 포맷팅
 */
function formatFee(fee: number | null): string {
  if (fee === null || fee === 0) {
    return "무료";
  }
  return `${fee.toLocaleString("ko-KR")}원`;
}

export function SocialingCard({
  socialing,
  className,
}: SocialingCardProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();
  const eventDateStr = socialing.eventDate
    ? formatEventDate(socialing.eventDate)
    : null;

  // Notion 페이지 ID를 URL 형식으로 변환 (하이픈 제거)
  const pageIdForUrl = socialing.pageId.replace(/-/g, "");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // PENDING 상태일 때 모달 표시
    if (socialing.status === "PENDING") {
      const typeText = getTypeBadgeText(socialing.type);
      openModal({
        type: "CUSTOM",
        title: "예정 이벤트",
        message: `예정 이벤트를 기다려 주세요`,
        primaryAction: {
          label: "확인",
          onClick: () => {
            closeModal();
          },
        },
      });
      return;
    }

    // OPEN/FINISH 상태일 때만 상세페이지로 이동
    router.push(`/social/${pageIdForUrl}`);
  };

  return (
    <Card
      elevation={1}
      onClick={handleClick}
      className={cn(
        "group transition-all duration-200 hover:shadow-elevation-2 hover:-translate-y-1 cursor-pointer",
        getStatusStyleClass(socialing.status),
        className
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* 이미지 영역 */}
        {socialing.coverImage && (
          <div className="relative w-full sm:w-64 md:w-80 lg:w-96 aspect-[16/9] sm:flex-shrink-0 overflow-hidden sm:rounded-l-lg rounded-t-lg sm:rounded-tr-none bg-surface-elevated">
            <Image
              src={socialing.coverImage}
              alt={socialing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 384px"
            />
          </div>
        )}

        {/* 텍스트 영역 */}
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between min-h-[180px] sm:min-h-[192px]">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-text-primary line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-1">
                {socialing.title}
              </h3>
              {/* Type 뱃지 */}
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md border shrink-0",
                  getTypeBadgeColorClass(socialing.type)
                )}
              >
                {getTypeBadgeText(socialing.type)}
              </span>
            </div>

            {socialing.description && (
              <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                {socialing.description}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            {/* 이벤트 날짜 */}
            {eventDateStr && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{eventDateStr}</span>
              </div>
            )}

            {/* 참가비 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatFee(socialing.participationFee)}</span>
              </div>

              {/* 상태 뱃지 */}
              {socialing.status === "OPEN" && (
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  모집중
                </span>
              )}
              {socialing.status === "PENDING" && (
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  예정
                </span>
              )}
              {socialing.status === "FINISH" && (
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300">
                  종료
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
