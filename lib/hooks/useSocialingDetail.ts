"use client";

import { useQuery } from "@tanstack/react-query";
import type { Socialing } from "@/lib/types/socialing";
import type { NotionPageContent } from "@/lib/types/notion";

interface SocialingDetailResponse {
  socialing: Socialing;
  notionContent: NotionPageContent | null;
}

/**
 * 소셜링 상세 정보를 가져오는 React-Query 훅
 * - staleTime: 데이터가 fresh로 간주되는 시간 (이 시간 동안은 캐시된 데이터 사용)
 * - gcTime: 사용되지 않는 쿼리가 메모리에서 제거되기까지의 시간
 */
export function useSocialingDetail(id: string) {
  // 개발 환경: 3초, 운영 환경: 10분
  const isDev =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NODE_ENV === "development";
  const staleTime = isDev ? 3 * 1000 : 10 * 60 * 1000; // 3초 또는 10분
  const gcTime = isDev ? 5 * 1000 : 30 * 60 * 1000; // 5초 또는 30분 (메모리 보관 시간)

  return useQuery<SocialingDetailResponse>({
    queryKey: ["socialing_detail", id],
    queryFn: async () => {
      const response = await fetch(`/api/socialing/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("소셜링을 찾을 수 없습니다.");
        }
        throw new Error("소셜링을 불러올 수 없습니다.");
      }
      return response.json();
    },
    enabled: !!id,
    staleTime,
    gcTime,
  });
}
