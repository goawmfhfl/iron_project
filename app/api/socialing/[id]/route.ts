import { NextRequest, NextResponse } from "next/server";
import {
  getSocialingByPageId,
  getNotionPageContent,
} from "@/lib/services/notion-service.server";
import { formatNotionPageId } from "@/lib/utils/notion";

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

/**
 * GET /api/socialing/[id]
 * 소셜링 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid socialing ID" },
        { status: 400 }
      );
    }

    // URL의 ID를 Notion 페이지 ID로 변환 (하이픈 추가)
    let notionPageId: string;
    if (id.length === 32) {
      // 하이픈이 없는 경우 하이픈 추가
      notionPageId = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20, 32)}`;
    } else {
      notionPageId = id;
    }

    // 소셜링 데이터 가져오기
    const socialing = await getSocialingByPageId(notionPageId);

    if (!socialing) {
      return NextResponse.json(
        { error: "Socialing not found" },
        { status: 404 }
      );
    }

    // Notion 페이지 내용 가져오기
    let notionContent = null;
    try {
      // 소셜링의 URL이 Notion 페이지 URL인 경우
      const notionUrl = socialing.pageId
        ? `https://notion.so/${socialing.pageId.replace(/-/g, "")}`
        : null;

      if (notionUrl) {
        notionContent = await getNotionPageContent(notionUrl);
      }
    } catch (error) {
      console.error("Notion 데이터 가져오기 실패:", error);
      notionContent = null;
    }

    return NextResponse.json({
      socialing,
      notionContent,
    });
  } catch (error) {
    console.error("GET /api/socialing/[id] error:", error);
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
