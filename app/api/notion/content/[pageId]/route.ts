import { NextRequest, NextResponse } from "next/server";
import { getNotionContentByPageId } from "@/lib/services/notion-service.server";
import { formatNotionPageId } from "@/lib/utils/notion";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    
    if (!pageId) {
      return NextResponse.json(
        { error: "페이지 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // URL의 pageId를 Notion 페이지 ID로 변환
    const formattedPageId = formatNotionPageId(pageId);
    
    // 하이픈이 없는 경우 하이픈 추가
    let notionPageId: string;
    if (formattedPageId.length === 32) {
      notionPageId = `${formattedPageId.slice(0, 8)}-${formattedPageId.slice(8, 12)}-${formattedPageId.slice(12, 16)}-${formattedPageId.slice(16, 20)}-${formattedPageId.slice(20, 32)}`;
    } else {
      notionPageId = formattedPageId;
    }

    const content = await getNotionContentByPageId(notionPageId);

    if (!content) {
      return NextResponse.json(
        { error: "컨텐츠를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
