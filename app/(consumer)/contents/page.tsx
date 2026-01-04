import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getNotionContentsDatabase,
  getNotionCategories,
} from "@/lib/services/notion-service.server";
import { CategoryNavigation } from "@/components/consumer/CategoryNavigation";
import { ContentCard } from "@/components/consumer/ContentCard";
import { Pagination } from "@/components/consumer/Pagination";
import { Card, CardContent } from "@/components/ui/Card";
import { ContentSkeleton } from "@/components/consumer/ContentSkeleton";
import type { ContentStatus } from "@/lib/types/notion-content";
import { createClient } from "@/lib/supabase/server";
import { checkContentAccess } from "@/lib/services/content-access";
import type { UserRole } from "@/lib/types/user";

export const revalidate = 3600; // 1시간마다 재생성

interface ContentsPageProps {
  searchParams: Promise<{ 
    firstCategory?: string;
    secondCategory?: string;
    page?: string;
    cursor?: string;
  }>;
}

async function ContentsList({
  firstCategory,
  secondCategory,
  page,
  cursor,
}: {
  firstCategory?: string;
  secondCategory?: string;
  page?: string;
  cursor?: string;
}) {
  const currentPage = page ? parseInt(page, 10) : 1;
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  try {
    // 사용자 인증 상태 확인 (서버 사이드)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userRole = (user?.user_metadata?.user_role as UserRole) || null;

    // 카테고리 정보 가져오기
    const categories = await getNotionCategories();

    // 컨텐츠 조회 (OPEN 상태만)
    // start_cursor 기반 페이지네이션 사용
    const pageSize = 10;
    
    // 필터링 파라미터 구성 (명시적으로 값이 있을 때만 전달)
    const queryParams: {
      status: ContentStatus[];
      firstCategory?: string;
      secondCategory?: string;
      pageSize: number;
      startCursor: string | null;
    } = {
      status: ["OPEN"],
      pageSize,
      startCursor: cursor || null,
    };

    // firstCategory가 있으면 필터에 추가
    if (firstCategory && firstCategory.trim() !== "") {
      queryParams.firstCategory = firstCategory.trim();
    }

    // secondCategory가 있고 firstCategory도 있을 때만 필터에 추가
    // (secondCategory는 firstCategory의 하위 카테고리이므로)
    if (secondCategory && secondCategory.trim() !== "" && firstCategory) {
      queryParams.secondCategory = secondCategory.trim();
    }

    const result = await getNotionContentsDatabase(queryParams);

    // 각 컨텐츠의 접근 가능 여부를 미리 계산
    const contentsWithAccess = await Promise.all(
      result.contents.map(async (content) => {
        const accessCheck = await checkContentAccess(content.access, userRole);
        return {
          content,
          hasAccess: accessCheck.allowed,
          requiresAuth: accessCheck.requiresAuth,
          requiresPremium: accessCheck.requiresPremium,
        };
      })
    );

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
        {result.contents.length === 0 ? (
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
              {contentsWithAccess.map(({ content, hasAccess, requiresAuth, requiresPremium }) => (
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
            {(result.hasMore || currentPage > 1) && (
              <Pagination
                currentPage={currentPage}
                hasMore={result.hasMore}
                nextCursor={result.nextCursor}
              />
            )}
          </>
        )}
      </>
    );
  } catch (error) {
    console.error("ContentsList error:", error);
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
}


export default async function ContentsPage({ searchParams }: ContentsPageProps) {
  const params = await searchParams;
  const { firstCategory, secondCategory, page } = params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* 컨텐츠 리스트 (Suspense로 감싸서 로딩 상태 처리) */}
        <Suspense fallback={<ContentSkeleton />}>
          <ContentsList
            firstCategory={firstCategory}
            secondCategory={secondCategory}
            page={page}
            cursor={params.cursor}
          />
        </Suspense>
      </div>
    </div>
  );
}
