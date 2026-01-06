"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { NotionContent } from "@/lib/types/notion-content";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  getAccessBadgeText,
  getAccessBadgeColorClass,
} from "@/lib/services/content-access";
import { useModalStore } from "@/lib/stores/modal-store";

interface ContentCardProps {
  content: NotionContent;
  hasAccess: boolean;
  requiresAuth?: boolean;
  requiresPremium?: boolean;
  className?: string;
}

export function ContentCard({
  content,
  hasAccess,
  requiresAuth = false,
  requiresPremium = false,
  className,
}: ContentCardProps) {
  const router = useRouter();
  const { openModal, closeModal } = useModalStore();

  const formattedDate = new Date(content.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Notion 페이지 ID를 URL 형식으로 변환 (하이픈 제거)
  const pageIdForUrl = content.pageId.replace(/-/g, "");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!hasAccess) {
      // 접근 불가 시 모달 표시
      if (requiresAuth) {
        openModal({
          type: "LOGIN_REQUIRED",
          title: "회원전용 컨텐츠",
          message: "이 컨텐츠는 회원만 볼 수 있습니다. 로그인 하시겠어요?",
          primaryAction: {
            label: "로그인하기",
            onClick: () => {
              closeModal();
              router.push(`/login?redirect=/contents/${pageIdForUrl}`);
            },
          },
          secondaryAction: {
            label: "취소",
            onClick: closeModal,
          },
        });
      } else if (requiresPremium) {
        openModal({
          type: "PREMIUM_REQUIRED",
          title: "프리미엄 회원 전용",
          message: "이 컨텐츠는 프리미엄 회원만 볼 수 있는 컨텐츠입니다. 구독을 하시겠어요?",
          primaryAction: {
            label: "구독하기",
            onClick: () => {
              closeModal();
              router.push("/subscription");
            },
          },
          secondaryAction: {
            label: "취소",
            onClick: closeModal,
          },
        });
      }
      return;
    }

    // 접근 가능한 경우 상세 페이지로 이동
    router.push(`/contents/${pageIdForUrl}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "block w-full cursor-pointer",
        !hasAccess && "opacity-75"
      )}
    >
      <Card
        elevation={1}
        className={cn(
          "group transition-all duration-200",
          hasAccess
            ? "hover:shadow-elevation-2 hover:-translate-y-1"
            : "hover:shadow-elevation-1 cursor-not-allowed",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* 이미지 영역 - 모바일: 위쪽, 데스크톱: 왼쪽 */}
          {content.coverImage && (
            <div className="relative w-full sm:w-64 md:w-80 lg:w-96 aspect-[16/9] sm:flex-shrink-0 overflow-hidden sm:rounded-l-lg rounded-t-lg sm:rounded-tr-none bg-surface-elevated">
              <Image
                src={content.coverImage}
                alt={content.title}
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
                <h3 className="text-lg sm:text-xl font-bold text-text-primary line-clamp-2 group-hover:text-primary-400 transition-colors flex-1">
                  {content.title}
                </h3>
                {/* Access 뱃지 */}
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-md border shrink-0",
                    getAccessBadgeColorClass(content.access)
                  )}
                >
                  {getAccessBadgeText(content.access)}
                </span>
              </div>
              {content.description && (
                <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                  {content.description}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
              <span>{formattedDate}</span>
              <span
                className={cn(
                  "font-medium transition-colors",
                  hasAccess
                    ? "text-primary-400 group-hover:underline"
                    : "text-text-tertiary"
                )}
              >
                {hasAccess ? "읽기 →" : "로그인 필요"}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
