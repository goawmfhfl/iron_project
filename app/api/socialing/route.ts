import { NextRequest, NextResponse } from "next/server";
import {
  getSocialingThumbnails,
  getSocialings,
} from "@/lib/services/notion-service.server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";

// 동적 렌더링 강제 (cookies 사용)
export const dynamic = 'force-dynamic';

/**
 * GET /api/socialing
 * 소셜링 리스트와 썸네일 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 사용자 역할 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // user_metadata에서 user_role 추출
    const userRole: UserRole | null = user
      ? ((user.user_metadata?.user_role as UserRole) || "user")
      : null;

    // 썸네일과 소셜링 데이터 병렬로 가져오기
    const [thumbnails, socialings] = await Promise.all([
      getSocialingThumbnails(),
      getSocialings(userRole ?? undefined),
    ]);

    return NextResponse.json({
      thumbnails,
      socialings,
    });
  } catch (error) {
    console.error("GET /api/socialing error:", error);
    return NextResponse.json(
      {
        error: "소셜링을 불러오는데 실패했습니다.",
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
