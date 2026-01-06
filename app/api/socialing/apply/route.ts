import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSocialingApplication } from "@/lib/services/socialing-apply-service";
import type { FormDatabaseType } from "@/lib/types/notion-form";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { socialing_id, form_database_type, form_database_id, applicant_data } =
      body || {};

    if (!socialing_id || !form_database_type || !form_database_id || !applicant_data) {
      return NextResponse.json(
        { error: "필수 값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 로그인 유저면 user_id 저장 (비회원도 허용)
    let user_id: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      user_id = user?.id ?? null;
    } catch {
      user_id = null;
    }

    const application = await createSocialingApplication({
      socialing_id,
      form_database_type: form_database_type as FormDatabaseType,
      form_database_id,
      applicant_data,
      user_id,
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

