"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  NotionContent,
  NotionContentsQueryResult,
} from "@/lib/types/notion-content";

interface ContentWithAccess {
  content: NotionContent;
  hasAccess: boolean;
  requiresAuth: boolean;
  requiresPremium: boolean;
}

interface ContentsResponse {
  categories: {
    firstCategories: string[];
    secondCategories: Record<string, string[]>;
  };
  contents: ContentWithAccess[];
  hasMore: boolean;
  nextCursor: string | null;
}

interface UseContentsParams {
  firstCategory?: string;
  secondCategory?: string;
  page?: string;
  cursor?: string | null;
}

/**
 * 컨텐츠 목록과 카테고리를 가져오는 React-Query 훅
 * - staleTime: 데이터가 fresh로 간주되는 시간 (이 시간 동안은 캐시된 데이터 사용)
 * - gcTime: 사용되지 않는 쿼리가 메모리에서 제거되기까지의 시간
 */
export function useContents(params: UseContentsParams = {}) {
  const { firstCategory, secondCategory, page, cursor } = params;

  // 개발 환경: 3초, 운영 환경: 10분
  const isDev =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NODE_ENV === "development";
  const staleTime = isDev ? 3 * 1000 : 10 * 60 * 1000; // 3초 또는 10분
  const gcTime = isDev ? 5 * 1000 : 30 * 60 * 1000; // 5초 또는 30분 (메모리 보관 시간)

  // 쿼리 키 생성 (파라미터에 따라 다른 캐시 사용)
  const queryKey = [
    "contents",
    firstCategory || null,
    secondCategory || null,
    page || "1",
    cursor || null,
  ];

  return useQuery<ContentsResponse>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (firstCategory) searchParams.set("firstCategory", firstCategory);
      if (secondCategory) searchParams.set("secondCategory", secondCategory);
      if (page) searchParams.set("page", page);
      if (cursor) searchParams.set("cursor", cursor);

      const response = await fetch(`/api/contents?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("컨텐츠를 불러올 수 없습니다.");
      }
      return response.json();
    },
    staleTime,
    gcTime,
  });
}
