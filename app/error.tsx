"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          오류가 발생했습니다
        </h2>
        <p className="text-text-tertiary mb-8">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="text-xs text-text-tertiary mb-4">
            오류 ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" asChild>
            <a href="/">홈으로 가기</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
