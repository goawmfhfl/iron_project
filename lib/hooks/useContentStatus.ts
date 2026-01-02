"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContentStatus } from "@/lib/services/content-service";
import type { ContentStatus } from "@/lib/types/content";

export const useUpdateContentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      updateContentStatus(id, status),
    onSuccess: () => {
      // 목록 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ["read_margnet", "all"] });
    },
    onError: (error) => {
      console.error("컨텐츠 상태 업데이트 실패:", error);
    },
  });
};

