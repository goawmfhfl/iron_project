import { NextRequest, NextResponse } from "next/server";
import type { FormDatabaseType } from "@/lib/types/notion-form";

export const dynamic = "force-dynamic";

function getFormDatabaseId(type: FormDatabaseType): string {
  const envMap: Record<FormDatabaseType, string> = {
    DORAN_BOOK: process.env.NOTION_DORAN_BOOK_APPLY_DATABASE_ID || "",
    EVENT: process.env.NOTION_EVENT_APPLY_DATABASE_ID || "",
    VIVID: process.env.NOTION_VIVID_APPLY_DATABASE_ID || "",
  };

  const databaseId = envMap[type];
  if (!databaseId) {
    throw new Error(`NOTION_${type}_APPLY_DATABASE_ID가 설정되지 않았습니다.`);
  }
  return databaseId;
}

function getNotionHeaders(): HeadersInit {
  const apiKey = process.env.NOTION_TOKEN;

  if (!apiKey) {
    throw new Error("NOTION_TOKEN이 설정되지 않았습니다.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

/**
 * GET /api/formtest/raw
 * Notion 데이터베이스의 원본 속성을 그대로 반환 (테스트용)
 */
export async function GET(request: NextRequest) {
  try {
    const type = (request.nextUrl.searchParams.get("type") || "DORAN_BOOK") as FormDatabaseType;
    const databaseId = getFormDatabaseId(type);
    const headers = getNotionHeaders();

    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!dbResponse.ok) {
      const errorData = await dbResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Notion 데이터베이스 조회 실패: ${errorData.message || dbResponse.statusText}` },
        { status: dbResponse.status }
      );
    }

    const dbData = await dbResponse.json();

    return NextResponse.json({
      type,
      databaseId,
      database: dbData,
    });
  } catch (error) {
    console.error("formtest/raw api error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
