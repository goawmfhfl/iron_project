"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { clearImageErrorReloadFlag } from "@/lib/utils/image-error-handler";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 페이지 로드 시 이미지 에러 플래그 초기화
  // 새로고침 후에는 다시 에러가 발생했을 때 새로고침할 수 있도록 플래그를 초기화
  useEffect(() => {
    clearImageErrorReloadFlag();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

