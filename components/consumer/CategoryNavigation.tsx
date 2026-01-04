"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryNavigationProps {
  firstCategories: string[];
  secondCategories: Record<string, string[]>;
  currentFirstCategory?: string | null;
  currentSecondCategory?: string | null;
}

export function CategoryNavigation({
  firstCategories,
  secondCategories,
  currentFirstCategory,
  currentSecondCategory,
}: CategoryNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFirstCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set("firstCategory", category);
    } else {
      params.delete("firstCategory");
    }
    
    // secondCategory도 초기화
    params.delete("secondCategory");
    params.delete("page"); // 페이지도 초기화
    params.delete("cursor"); // 커서도 초기화 (필터 변경 시 잘못된 start_cursor 방지)
    
    router.push(`/contents?${params.toString()}`);
  };

  const handleSecondCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set("secondCategory", category);
    } else {
      params.delete("secondCategory");
    }
    
    params.delete("page"); // 페이지 초기화
    params.delete("cursor"); // 커서도 초기화 (필터 변경 시 잘못된 start_cursor 방지)
    
    router.push(`/contents?${params.toString()}`);
  };

  const availableSecondCategories = currentFirstCategory
    ? secondCategories[currentFirstCategory] || []
    : [];

  return (
    <div className="space-y-4 mb-8">
      {/* 첫 번째 카테고리 - 탭 스타일 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFirstCategoryClick(null)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
            !currentFirstCategory
              ? "bg-primary-600 dark:bg-primary-500 text-white shadow-elevation-1"
              : "bg-surface-elevated dark:bg-surface-elevated text-text-primary dark:text-text-secondary border border-border hover:bg-surface-hover dark:hover:bg-surface-hover"
          )}
        >
          전체
        </button>
        {firstCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleFirstCategoryClick(category)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
              currentFirstCategory === category
                ? "bg-primary-600 dark:bg-primary-500 text-white shadow-elevation-1"
                : "bg-surface-elevated dark:bg-surface-elevated text-text-primary dark:text-text-secondary border border-border hover:bg-surface-hover dark:hover:bg-surface-hover"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 두 번째 카테고리 - 서브 탭 스타일 (첫 번째 카테고리가 선택된 경우에만 표시) */}
      {currentFirstCategory && availableSecondCategories.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-border dark:border-border">
          <div className="flex flex-wrap gap-2">
            {/* secondCategory가 명시적으로 선택되지 않았을 때는 "전체" 버튼을 비활성화 상태로 표시 */}
            <button
              onClick={() => handleSecondCategoryClick(null)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500",
                // currentSecondCategory가 null이고 URL에 secondCategory가 없을 때만 활성화
                !currentSecondCategory && !searchParams.get("secondCategory")
                  ? "bg-accent-500 dark:bg-accent-400 text-white shadow-elevation-1"
                  : "bg-surface dark:bg-surface text-text-secondary dark:text-text-tertiary border border-border/50 hover:bg-surface-hover dark:hover:bg-surface-hover"
              )}
            >
              전체
            </button>
            {availableSecondCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleSecondCategoryClick(category)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500",
                  currentSecondCategory === category
                    ? "bg-accent-500 dark:bg-accent-400 text-white shadow-elevation-1"
                    : "bg-surface dark:bg-surface text-text-secondary dark:text-text-tertiary border border-border/50 hover:bg-surface-hover dark:hover:bg-surface-hover"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
