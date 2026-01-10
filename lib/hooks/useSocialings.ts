"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Socialing,
  SocialingThumbnail,
} from "@/lib/types/socialing";

interface SocialingsResponse {
  thumbnails: SocialingThumbnail[];
  socialings: Socialing[];
}

/**
 * 소셜링 리스트와 썸네일을 가져오는 React-Query 훅
 * - staleTime: 데이터가 fresh로 간주되는 시간 (이 시간 동안은 캐시된 데이터 사용)
 * - gcTime: 사용되지 않는 쿼리가 메모리에서 제거되기까지의 시간
 */
export function useSocialings() {
  // 개발 환경: 3초, 운영 환경: 10분
  const isDev =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NODE_ENV === "development";
  const staleTime = isDev ? 3 * 1000 : 10 * 60 * 1000; // 3초 또는 10분
  const gcTime = isDev ? 5 * 1000 : 30 * 60 * 1000; // 5초 또는 30분 (메모리 보관 시간)

  return useQuery<SocialingsResponse>({
    queryKey: ["socialings"],
    queryFn: async () => {
      const response = await fetch("/api/socialing");
      if (!response.ok) {
        throw new Error("소셜링을 불러올 수 없습니다.");
      }
      return response.json();
    },
    staleTime, // 캐싱 시간 (요청한 대로 10분 또는 3초)
    gcTime, // 메모리 보관 시간 (더 길게 설정)
  });
}
