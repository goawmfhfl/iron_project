"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  nextCursor?: string | null;
  totalPages?: number;
}

export function Pagination({
  currentPage,
  hasMore,
  nextCursor,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number, cursor?: string | null, isPrevious = false) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      params.delete("page");
      params.delete("cursor");
    } else {
      params.set("page", page.toString());
      // 이전 페이지로 가는 경우 cursor 제거 (Notion API는 이전 cursor를 제공하지 않음)
      if (isPrevious) {
        params.delete("cursor");
      } else if (cursor) {
        params.set("cursor", cursor);
      } else {
        params.delete("cursor");
      }
    }
    
    router.push(`/contents?${params.toString()}`);
    // 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = totalPages || (hasMore ? currentPage + 2 : currentPage);
    
    if (maxPages <= 5) {
      // 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= maxPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 앞뒤 2개씩 표시
      if (currentPage <= 3) {
        // 앞부분
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (maxPages > 5) {
          pages.push("...");
          pages.push(maxPages);
        }
      } else if (currentPage >= maxPages - 2) {
        // 뒷부분
        pages.push(1);
        pages.push("...");
        for (let i = maxPages - 4; i <= maxPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(maxPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 이전 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1, null, true)}
        disabled={currentPage === 1}
        className="min-w-[80px]"
      >
        이전
      </Button>

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-text-tertiary"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                "min-w-[40px] transition-all",
                isActive && "bg-primary text-text-inverse"
              )}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1, nextCursor)}
        disabled={!hasMore && (!totalPages || currentPage >= totalPages)}
        className="min-w-[80px]"
      >
        다음
      </Button>
    </div>
  );
}
