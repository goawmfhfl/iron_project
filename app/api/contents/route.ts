import { NextRequest, NextResponse } from "next/server";
import {
  getNotionContentsDatabase,
  getNotionCategories,
} from "@/lib/services/notion-service.server";
import { createClient } from "@/lib/supabase/server";
import { checkContentAccess } from "@/lib/services/content-access";
import type { UserRole } from "@/lib/types/user";
import type { ContentStatus } from "@/lib/types/notion-content";

// 동적 렌더링 강제 (searchParams와 cookies 사용)
export const dynamic = 'force-dynamic';

/**
 * GET /api/contents
 * 컨텐츠 목록과 카테고리 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const firstCategory = searchParams.get("firstCategory") || undefined;
    const secondCategory = searchParams.get("secondCategory") || undefined;
    const page = searchParams.get("page");
    const cursor = searchParams.get("cursor") || null;

    // 사용자 인증 상태 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userRole = (user?.user_metadata?.user_role as UserRole) || null;

    // 카테고리 정보 가져오기
    const categories = await getNotionCategories();

    // 컨텐츠 조회 (OPEN 상태만)
    const pageSize = 10;

    // 필터링 파라미터 구성
    const queryParams: {
      status: ContentStatus[];
      firstCategory?: string;
      secondCategory?: string;
      pageSize: number;
      startCursor: string | null;
    } = {
      status: ["OPEN"],
      pageSize,
      startCursor: cursor,
    };

    // firstCategory가 있으면 필터에 추가
    if (firstCategory && firstCategory.trim() !== "") {
      queryParams.firstCategory = firstCategory.trim();
    }

    // secondCategory가 있고 firstCategory도 있을 때만 필터에 추가
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

    return NextResponse.json({
      categories,
      contents: contentsWithAccess,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error("GET /api/contents error:", error);
    return NextResponse.json(
      {
        error: "컨텐츠를 불러오는데 실패했습니다.",
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
