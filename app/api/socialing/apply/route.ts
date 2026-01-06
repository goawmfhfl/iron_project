import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSocialingApplication } from "@/lib/services/socialing-apply-service";
import { getSocialingByPageId } from "@/lib/services/notion-service.server";
import type { FormDatabaseType } from "@/lib/types/notion-form";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      socialing_id,
      form_database_type,
      form_database_id,
      form_data,
      form_schema_snapshot,
    } = body || {};

    if (
      !socialing_id ||
      !form_database_type ||
      !form_database_id ||
      !form_data
    ) {
      return NextResponse.json(
        { error: "필수 값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 로그인 유저 정보 가져오기 (필수)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다. 회원만 신청할 수 있습니다." },
        { status: 401 }
      );
    }

    // 인증된 사용자 정보 필수 필드로 설정
    const user_id = user.id;
    const user_email = user.email || null;
    const user_name = (user.user_metadata?.user_name as string) || null;

    // 소셜링 제목 가져오기
    let socialing_title: string | null = null;
    try {
      const socialing = await getSocialingByPageId(socialing_id);
      if (socialing) {
        socialing_title = socialing.title;
      }
    } catch (error) {
      console.error("소셜링 제목 조회 실패:", error);
    }

    const application = await createSocialingApplication({
      socialing_id,
      socialing_title,
      form_database_type: form_database_type as FormDatabaseType,
      form_database_id,
      form_data,
      form_schema_snapshot: form_schema_snapshot || null,
      user_id,
      user_email,
      user_name,
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("apply api error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "신청 제출에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

