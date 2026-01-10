"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryNavigation } from "@/components/consumer/CategoryNavigation";
import { ContentCard } from "@/components/consumer/ContentCard";
import { Pagination } from "@/components/consumer/Pagination";
import { Card, CardContent } from "@/components/ui/Card";
import { ContentSkeleton } from "@/components/consumer/ContentSkeleton";
import { useContents } from "@/lib/hooks/useContents";

// 개발 모드에서 완전히 동적 렌더링
export const dynamic = "force-dynamic";

function ContentsList() {
  const searchParams = useSearchParams();
  const firstCategory = searchParams.get("firstCategory") || undefined;
  const secondCategory = searchParams.get("secondCategory") || undefined;
  const page = searchParams.get("page") || undefined;
  const cursor = searchParams.get("cursor") || undefined;

  const currentPage = page ? parseInt(page, 10) : 1;

  const { data, isLoading, error } = useContents({
    firstCategory,
    secondCategory,
    page,
    cursor: cursor || null,
  });

  // 로딩 중
  if (isLoading) {
    return <ContentSkeleton />;
  }

  // 에러 발생
  if (error) {
    return (
      <Card elevation={1}>
        <CardContent className="py-12 text-center">
          <p className="text-error font-semibold mb-4">
            컨텐츠를 불러오는데 실패했습니다.
          </p>
          <p className="text-sm text-text-tertiary">
            {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { categories, contents, hasMore, nextCursor } = data;

  return (
    <>
      {/* 카테고리 네비게이션 */}
      <CategoryNavigation
        firstCategories={categories.firstCategories}
        secondCategories={categories.secondCategories}
        currentFirstCategory={firstCategory || null}
        currentSecondCategory={secondCategory || null}
      />

      {/* 컨텐츠 리스트 */}
      {contents.length === 0 ? (
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">
              해당 카테고리에 컨텐츠가 없습니다.
            </p>
            <p className="text-sm text-text-tertiary">
              다른 카테고리를 선택해보세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-10">
            {contents.map(({ content, hasAccess, requiresAuth, requiresPremium }) => (
              <ContentCard
                key={content.pageId}
                content={content}
                hasAccess={hasAccess}
                requiresAuth={requiresAuth}
                requiresPremium={requiresPremium}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {(hasMore || currentPage > 1) && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              nextCursor={nextCursor}
            />
          )}
        </>
      )}
    </>
  );
}

export default function ContentsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<ContentSkeleton />}>
          <ContentsList />
        </Suspense>
      </div>
    </div>
  );
}
