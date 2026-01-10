"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  nextCursor?: string | null;
  totalPages?: number;
}

/**
 * 페이지별 커서를 저장하는 키 생성
 */
function getCursorStorageKey(searchParams: URLSearchParams): string {
  const firstCategory = searchParams.get("firstCategory") || "";
  const secondCategory = searchParams.get("secondCategory") || "";
  return `contents_cursors_${firstCategory}_${secondCategory}`;
}

export function Pagination({
  currentPage,
  hasMore,
  nextCursor,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursorsRef = useRef<Map<number, string>>(new Map());

  // 현재 페이지의 커서를 저장 (다음 페이지로 가기 위한 커서)
  useEffect(() => {
    const storageKey = getCursorStorageKey(searchParams);
    try {
      const stored = sessionStorage.getItem(storageKey);
      const cursors = stored ? JSON.parse(stored) : {};
      
      // 현재 페이지의 이전 커서 저장 (현재 URL의 cursor가 이전 페이지에서 받은 커서)
      const currentCursor = searchParams.get("cursor");
      if (currentCursor && currentPage > 1) {
        // 현재 페이지로 오기 위해 사용한 커서를 저장 (이전 페이지의 nextCursor)
        cursors[currentPage] = currentCursor;
      }
      
      // 현재 페이지의 nextCursor를 다음 페이지용으로 저장
      if (nextCursor && currentPage >= 1) {
        cursors[currentPage + 1] = nextCursor;
      }
      
      sessionStorage.setItem(storageKey, JSON.stringify(cursors));
      cursorsRef.current = new Map(Object.entries(cursors).map(([k, v]) => [Number(k), v as string]));
    } catch (error) {
      console.error("Failed to save cursor:", error);
    }
  }, [nextCursor, currentPage, searchParams]);

  // 저장된 커서 불러오기
  useEffect(() => {
    const storageKey = getCursorStorageKey(searchParams);
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const cursors = JSON.parse(stored);
        cursorsRef.current = new Map(Object.entries(cursors).map(([k, v]) => [Number(k), v as string]));
      }
    } catch (error) {
      console.error("Failed to load cursors:", error);
    }
  }, [searchParams]);

  const handlePageChange = (page: number, cursor?: string | null, isPrevious = false) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      // 첫 페이지로 이동
      params.delete("page");
      params.delete("cursor");
    } else if (isPrevious) {
      // 이전 페이지로 이동: 저장된 커서 사용
      const prevPage = currentPage - 1;
      const prevCursor = cursorsRef.current.get(prevPage);
      
      if (prevPage === 1) {
        // 첫 페이지로 이동
        params.delete("page");
        params.delete("cursor");
      } else {
        // 이전 페이지의 커서 사용
        params.set("page", prevPage.toString());
        if (prevCursor) {
          params.set("cursor", prevCursor);
        } else {
          params.delete("cursor");
        }
      }
    } else {
      // 다음 페이지로 이동
      params.set("page", page.toString());
      if (cursor) {
        params.set("cursor", cursor);
      } else {
        params.delete("cursor");
      }
    }
    
    router.push(`/contents?${params.toString()}`);
    // 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {/* 이전 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1, null, true)}
        disabled={currentPage === 1}
        className="min-w-[100px]"
      >
        이전
      </Button>

      {/* 다음 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1, nextCursor)}
        disabled={!hasMore && (!totalPages || currentPage >= totalPages)}
        className="min-w-[100px]"
      >
        다음
      </Button>
    </div>
  );
}
