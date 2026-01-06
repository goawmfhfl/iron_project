import { NextRequest, NextResponse } from "next/server";
import { getNotionFormSchema } from "@/lib/services/notion-service.server";
import type { FormDatabaseType } from "@/lib/types/notion-form";

export const dynamic = "force-dynamic";

const NOTION_FORM_SUBMIT_URL =
  "https://grit-official.notion.site/2e0834013f70804088abcd0869065060?pvs=105";

export async function GET(request: NextRequest) {
  try {
    const type = (request.nextUrl.searchParams.get("type") ||
      "DORAN_BOOK") as FormDatabaseType;

    const schema = await getNotionFormSchema(type, NOTION_FORM_SUBMIT_URL, {
      cache: "no-store",
    });

    if (!schema) {
      return NextResponse.json(
        { error: "폼 스키마를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ type, schema });
  } catch (error) {
    console.error("form-schema api error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

